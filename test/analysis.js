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

  if (!temp[msg.sid]) {
    temp[msg.sid] = {};
  }

  const t = JSON.parse(msg.data);

  Object.keys(t)
    .forEach(key => {
      if(!temp[msg.sid][key]) {
        temp[msg.sid][key] = {};
      }
      temp[msg.sid][key] = Object.assign({}, temp[msg.sid][key], { [t[key]]: true })
    });

  // temp[msg.sid] = Object.assign({}, temp[msg.sid] || {}, JSON.parse(msg.data));

   // console.log(date, msg);
}

function close() {
  Object.keys(temp)
    .forEach(i => {
      Object.keys(temp[i])
        .forEach(item => {
          temp[i][item] = Object.keys(temp[i][item]).slice(0, 12);
        });
    });

  console.log(temp);
}
