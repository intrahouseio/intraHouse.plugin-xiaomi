const readline = require('readline');
const miio = require('../../miio/lib');
const crypto = require('crypto');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const DEVICES = {};

//---------------------------------------------------

function sendCommand(id, value) {
  DEVICES[id]
    .setPower(value)
    .then(v => {
      console.log('res ->', v);
      listenKeyboard();
    })
    .catch(listenKeyboard);
}

function command(value) {
  if (value == 'exit') {
    return process.exit();
  }

  if (value == '0') {
     sendCommand('158d00019c9f2b', false);
     sendCommand('158d0001f99dfb', false);
     return 1;
  }

  if (value == '1') {
    sendCommand('158d00019c9f2b', true);
    sendCommand('158d0001f99dfb', true);
    return 1;
  }

  listenKeyboard();
}

function listenKeyboard() {
  rl.question('', command);
}

//----------------------------------------------------

function printDevice(device, level = 0) {
  const max = 3;

  if (max === level || level >= 1) {
    console.log(device.id, device.type, device.model);
  }

  if (max === level || level >= 2) {
    Object.keys(device.properties)
      .forEach(key => console.log(`  ${key}: ${device.properties[key]}`));
  }

  if (max === level) {
    console.log('--------------------------------');
    console.log(device);
    console.log();
    console.log();
  }
}

function setDevice(id, device) {
  DEVICES[id] = device;
}

function setGateway(item) {
  //console.log(item);
}

function setDevices(list) {
  list
    .forEach(device => {
      const {id, model, type, properties } = device;

      setDevice(device.id, device);
      printDevice(device, 2);
      device.on('propertyChanged', data => console.log('sub ->', id, type, model, data.property, '--> ', data.value));
    });
}

function start(host) {
  miio
    .device({ address: host, token: '93faa4a2f30f15a6a20ec211c92336bd' })
    .then(gateway => {
      setGateway(gateway);
      setDevices(gateway.devices);
      listenKeyboard();
    })
    .catch(console.error);
}

start('192.168.0.127');
console.log('App start...')
