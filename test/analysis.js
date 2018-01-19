const fs = require('fs');
const readline = require('readline');

const path = 'test/gateway.log';
const temp = {};

const rd = readline.createInterface({
    input: fs.createReadStream(path),
    console: false,
});

rd.on('line', message);
rd.on('close', close);

function message(data) {
  const [date, string] = data.split(' --> ');
  const msg = JSON.parse(string);

  temp[msg.sid] = Object.assign({}, temp[msg.sid] || {}, JSON.parse(msg.data));

   // console.log(date, msg);
}

function close() {
  console.log(temp);
}
