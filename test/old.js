const dgram = require('dgram');
const socket = dgram.createSocket('udp4');
const readline = require('readline');
const crypto = require('crypto');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const HOST = '10.42.0.190';
const PORT =  54321;


socket.on('message', message);
socket.bind(PORT, start);

const hello = new Buffer('ITEAIP////////////////////////////////////8=', 'base64');
let header = new Buffer('21310000ffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 'hex');
let count = 0;
let status = 'handshake';

const t = new Buffer('db96c43b3949b1951b0225b49aca1e89', 'hex');
const _token = Buffer.from(t);
const _key = crypto.createHash('md5').update(t).digest();
const _iv = crypto.createHash('md5').update(_key).update(t).digest();

function sendRaw(msg) {
  socket.send(msg, 0, msg.length, PORT, HOST);
}

function send(data) {
  count++;
  data.id = count;
  const cipher = crypto.createCipheriv('aes-128-cbc', _key, _iv);
  let encrypted = Buffer.concat([
    cipher.update(new Buffer(JSON.stringify(data))),
    cipher.final(),
  ]);

  header.writeUInt16BE(32 + encrypted.length, 2);

  let digest = crypto.createHash('md5')
    .update(header.slice(0, 16))
    .update(_token)
    .update(encrypted)
    .digest();
  digest.copy(header, 16);

  const msg = Buffer.concat([ header, encrypted ]);
  socket.send(msg, 0, msg.length, PORT, HOST);
}

function dec(msg) {
  const cipher = crypto.createDecipheriv('aes-128-cbc', _key, _iv);
  let data = Buffer.concat([
    cipher.update(msg.slice(32)),
    cipher.final(),
  ]);

  console.log('res', JSON.parse(data.toString()));
  console.log('');
}

function message(data) {
  data.copy(header, 0, 0, 32);

  if (status === 'handshake') {
    status = 'normal';
    handshakeEnd();
  } else {
    dec(data);
  }
}

function listenKeyboard() {
  rl.question('', command);
}

function command(value) {
  console.log(dec(new Buffer(value, 'hex')));
  listenKeyboard();
}

function start() {
   listenKeyboard();
   socket.setBroadcast(true);
   socket.setMulticastTTL(128);
   socket.addMembership('224.0.0.50');
  //  dec();
   sendRaw(hello);
}

function handshakeEnd() {
   send({ method: 'miIO.info', params: []});
   send({ method: 'get_device_prop', params: ['lumi.0','device_list'] });
   send({ method: 'get_lumi_dpf_aes_key', params: [] });

   // send({ method: 'toggle_plug', params: ['neutral_0', 'on'], sid: '158d00019c9f2b' });
   // send({ method: 'toggle_ctrl_neutral', params: ['neutral_0', 'off'], sid: '158d0001f99dfb' });
}


//-----------------command-------------------
/*
res { id: 65035, method: 'set_alarming_volume', params: [ 70 ] }
res { id: 65068, method: 'set_doorbell_volume', params: [ 60 ] }
res { id: 65070, method: 'set_fm_volume', params: [ 20 ] }
res { id: 65074, method: 'set_gateway_volume', params: [ 40 ] }



*/
