const EventEmitter = require('events');
const dgram = require('dgram');
const crypto = require('crypto');

const IV = new Buffer('F5ltCT0o3bO6aVoub1hWLg==', 'base64');
const hello = new Buffer('ITEAIP////////////////////////////////////8=', 'base64');


const { getDeviceTypeFromModel, getDevicePropertiesFromModel } = require('./utils');

class Xiaomi extends EventEmitter {
  constructor(options) {
    super();

    this.options = {
      host: options.host || '192.168.0.127',
      port_main: options.port_main || 54321,
      port_ext: options.port_ext || 9898,
      token: options.token || '44cbc0b8974e5fd75a758539b72aefa1',
    }

    this.lastToken = false;
    this.gatewaySettigs = {}
    this.gatewayid=''
    this.deviceListOrigin = null;
    this.deviceList = {};
    this.manualListReport = [];
    this.timerList = {};
    this.count = 0;
    this.status = 'handshake';
    this.header = new Buffer('21310000ffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 'hex');

    this.password = '1234567890123456';
    this.token = new Buffer(this.options.token, 'hex');
    this.key = crypto.createHash('md5').update(this.token).digest();
    this.iv = crypto.createHash('md5').update(this.key).update(this.token).digest();

    this.socket_main = dgram.createSocket({ type:"udp4", reuseAddr:true });
    this.socket_ext = dgram.createSocket({ type:"udp4", reuseAddr:true });

    const onError = this.error.bind(this)

    this.socket_main.on('error', onError);
    this.socket_ext.on('error', onError);

    this.socket_main.on('message', this.message_main.bind(this));
    this.socket_ext.on('message', this.message_ext.bind(this));

    this.socket_main.bind(this.options.port_main, this.start_main.bind(this));
  }

  error() {

  }

  send_main_raw(msg) {
    this.socket_main.send(msg, 0, msg.length, this.options.port_main, this.options.host);
  }

  send_main(data) {
    this.count = this.count + 1;
    data.id = this.count;
    this.emit('send', JSON.stringify(data));
    const cipher = crypto.createCipheriv('aes-128-cbc', this.key, this.iv);
    let encrypted = Buffer.concat([
      cipher.update(new Buffer(JSON.stringify(data))),
      cipher.final(),
    ]);

    this.header.writeUInt16BE(32 + encrypted.length, 2);

    let digest = crypto.createHash('md5')
      .update(this.header.slice(0, 16))
      .update(this.token)
      .update(encrypted)
      .digest();
    digest.copy(this.header, 16);

    const msg = Buffer.concat([ this.header, encrypted ]);
    this.socket_main.send(msg, 0, msg.length, this.options.port_main, this.options.host);
  }

  send_ext(msg) {
    this.emit('send', msg);
    this.socket_ext.send(msg, 0, msg.length, this.options.port_ext, this.options.host);
  }

  message_main(data) {
    data.copy(this.header, 0, 0, 32);

    if (this.status === 'handshake') {
      this.status = 'main';
      this.getGatewaySettings();
    } else {
      this.parseMessageMain(data);
    }
  }

  message_ext(data) {
    this.emit('message', data.toString());
    const msg = JSON.parse(data.toString());
    if (msg.hasOwnProperty('data')) {
      msg.data = JSON.parse(msg.data);
    }

    this.parseMessageExt(msg);
  }

  setToken(token) {
    this.lastToken = token;
  }

  setGatewaySettings(data) {
    data.token = null;
    data.sid = data.mac.replace(/:/g, '').toLocaleLowerCase();
    const settings = Object.keys(data).reduce((l, n) => {
      if (Object.prototype.toString.call(data[n]) === '[object Object]') {
        return Object.assign({}, l, data[n]);
      }
      if (Object.prototype.toString.call(data[n]) === '[object Array]') {
        return Object.assign({}, l, { [n]: data[n].toString() });
      }
      return Object.assign({}, l, { [n]: data[n] });
    }, {});
    this.gatewayid = data.sid;
    this.gatewaySettigs = settings;
  }

  setGatewayPassword(data) {
    this.password = data[0];
    if (this.status === 'main') {
      this.status = 'ext';
      this.socket_ext.bind(this.options.port_ext, this.start_ext.bind(this));
    }
  }

  setDeviceList(list, gateway) {
    this.deviceList = list.concat(gateway || []).reduce((l, n) => {
      return Object.assign({}, l, { [n]: { sid: n, type: false, props: [], data: {} } });
    }, {});
  }

  setDeviceType(sid, model) {
    const device = this.deviceList[sid];
    const type = getDeviceTypeFromModel(model);
    device.type = type || `unknown_${sid}`;
    device.model = type && model;
  }

  setDeviceProperties(sid, model) {
    const device = this.deviceList[sid];
    const props = getDevicePropertiesFromModel(model);
    device.props = props;
  }

  setDeviceInitData(sid, data) {
    const device = this.deviceList[sid];

    const temp1 =  Object.keys(device.props).reduce((l, n) => Object.assign({}, l, { [n]: null }), {});

    if (sid === this.gatewaySettigs.sid) {
      device.data = Object.assign({}, temp1, this.gatewaySettigs, data);
    } else {
      device.data = Object.assign({}, temp1, data);
    }

    device.data.heartbeat = 1;
  }

  setDeviceNewData(sid, data) {
    const device = this.deviceList[sid];

    // device.data = Object.assign({}, device.data, data);
    device.data = data;
  }

  setDeviceManualReport(sid, model) {
    if (!model) {
      this.manualListReport.push(sid);
    }
  }

  setDeviceListOrigin(list) {
    this.deviceListOrigin = list;
  }

  setDeviceAutoReset(device, type, prop, propValue, resetValue, time) {
    const sid = device.sid;

    if (device.type === type && device.data[prop] === propValue) {
      if (this.timerList[sid]) {
        clearTimeout(this.timerList[sid]);
      }
      this.timerList[sid] = setTimeout(() => {
        this.deviceList[sid].data= { [prop]: resetValue };
        this.emit('data', this.deviceList[sid]);
      }, time);
    }
  }

  checkDevice(sid) {
    return this.deviceList.hasOwnProperty(sid);
  }

  checkDeviceAutoReset(device) {
    // 1: device, 2: device type, 3: prop name 4: prop value 5: reset value prope 6: reset time
    this.setDeviceAutoReset(device, 'motion', 'status', 'motion', 'no_motion', 5000);
    this.setDeviceAutoReset(device, 'gateway', 'heartbeat', 1, 0, 11500);
  }

  parseMessageMain(raw) {
    const cipher = crypto.createDecipheriv('aes-128-cbc', this.key, this.iv);
    let data = Buffer.concat([
      cipher.update(raw.slice(32)),
      cipher.final(),
    ]);

    this.emit('message', data.toString());

    const msg = JSON.parse(data.toString());
    switch (msg.id) {
      case 1:
        this.setGatewaySettings(msg.result);
        break;
      case 2:
        this.setGatewayPassword(msg.result);
        break;
      default:
        break;
    }
  }

  parseMessageExt(msg) {
    switch (msg.cmd) {
      case 'get_id_list_ack':
        this.parseDeviceList(msg);
        return 0;
      case 'heartbeat':
        this.parseHeartbeat(msg);
        return 0
      case 'report':
        this.parseReport(msg);
        return 0
      case 'read_ack':
        this.parseReport(msg);
        return 0
      /* case 'write_ack':
        this.parseReport(msg);
        return 0 */
      default:
        return msg;
    }
  }

  parseDeviceList(msg) {
    if (this.gatewayid === msg.sid) {
      this.setToken(msg.token);
      if (this.deviceListOrigin === null) {
        this.setDeviceListOrigin(msg.data);
        this.setDeviceList(msg.data, msg.sid);
        this.getDeviceTypes();
      } else {
        this.emit('devicelist', msg.data);
      }
    }
  }

  parseHeartbeat(msg) {
    if (msg.hasOwnProperty('data') && msg.hasOwnProperty('token')) {
      if (this.options.host === msg.data.ip) {
        this.setToken(msg.token);
      }
    }

    if (msg.hasOwnProperty('data') && this.checkDevice(msg.sid)) {
      msg.data.heartbeat = 1;
      this.parseReport(msg);
    }

    if (
        this.deviceListOrigin &&
        msg.hasOwnProperty('data') &&
        msg.model !== 'gateway' &&
        !this.deviceListOrigin.includes(msg.sid)
      ) {
        this.emit('newdevice', msg);
      }
  }

  parseReport(msg) {
    if(this.checkDevice(msg.sid)) {
      const device = this.deviceList[msg.sid];
      if (!device.type) {
        this.setDeviceType(msg.sid, msg.model);
        this.setDeviceProperties(msg.sid, msg.model);
        this.setDeviceInitData(msg.sid, msg.data);
        this.setDeviceManualReport(device.sid, device.model);
        this.checkDeviceAutoReset(device);
        this.emit('device', device)
      } else {
        this.setDeviceNewData(msg.sid, msg.data);
        this.checkDeviceAutoReset(device);
        this.emit('data', device)
      }
    } else {
      // console.log('new device!');
    }
  }

  getDeviceTypes() {
    Object.keys(this.deviceList)
      .forEach(sid => this.getDeviceState(sid));
  }

  getDeviceState(sid) {
    this.send_ext(`{"cmd":"read","sid":"${sid}"}`);
  }

  getGatewayId() {
    return this.gatewayid;
  }

  getDeviceList() {
    this.send_ext('{"cmd" : "get_id_list"}');
  }

  getDeviceListOrigin() {
    return this.deviceListOrigin;
  }

  getGatewaySettings() {
    this.send_main({ method: 'miIO.info', params: []});
    this.send_main({ method: 'get_lumi_dpf_aes_key', params: [] });
  }

  getKey() {
    let cipher = crypto.createCipheriv('aes-128-cbc', this.password, IV);
    let encryptedData = cipher.update(this.lastToken, 'utf8', 'hex') + cipher.final('hex');
    return encryptedData.toUpperCase().slice(0, 32);
  }

  manualReport() {
    setInterval(() => {
      this.manualListReport.forEach(sid => this.getDeviceState(sid))
    }, 2000);
  }

  addToDeviceList(device) {
    this.deviceList[device.sid] = { sid: device.sid, type: false, props: [], data: {} };
    this.parseReport(device);
    this.getDeviceState(device.sid);
  }

  removeToDeviceList(id) {
    delete this.deviceList[id];
  }

  sendAction(payload) {
    if (payload && payload.cmd) {
      payload.data.key = this.getKey();
      this.send_ext(JSON.stringify(payload));
    }

    if (payload && payload.method) {
      this.send_main(payload);
    }
  }

  start_main() {
    this.socket_main.setBroadcast(true);
    this.socket_main.setMulticastTTL(128);
    this.socket_main.addMembership('224.0.0.50');
    this.send_main_raw(hello);
  }

  start_ext() {
    this.socket_main.close();
    this.socket_ext.setBroadcast(true);
    this.socket_ext.setMulticastTTL(128);
    this.socket_ext.addMembership('224.0.0.50');
    this.getDeviceList();
    // this.manualReport();
  }
}

module.exports = Xiaomi;
