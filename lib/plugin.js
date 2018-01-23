const EventEmitter = require('events');


class Plugin extends EventEmitter {

  constructor() {
    super();
    this.unitid = process.argv[2];
    this.params = {};
    this.channels = [];

    process.on('message', this.message.bind(this));

    this.start();
  }

  message(msg) {
    if (msg.type === 'get' && msg.hasOwnProperty('params')) {
      this.emit('params', msg.params);
    }
    if (msg.type === 'get' && msg.hasOwnProperty('config')) {
      this.emit('channels', msg.config);
    }
    if (msg.type === 'act') {
      this.emit('actions', msg.data);
    }
    if (msg.type === 'debug') {
      this.emit('debug', msg.mode);
    }
  }

  send(type, data) {
    process.send(Object.assign({}, {type}, data));
  }

  debug(data) {
    process.send({ type: 'debug', txt: data });
  }

  getId() {
    return this.unitid;
  }

  getParams() {
    return this.params;
  }

  getChannels() {
    return this.chanels;
  }

  setChannels(data) {
    this.channels = this.channels.concat(data)
    this.send('channels', { data: this.channels });
  }

  setChannelsData(data) {
    this.send('data', { data });
  }

  start() {
    this.send('get', { tablename: `params/${this.unitid}` });
    this.send('get', { tablename: `config/${this.unitid}` });
  }



}

module.exports = Plugin;
