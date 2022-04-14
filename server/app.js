const express = require('express');
const app = express();
const expressWs = require('express-ws')(app);

const SSHClient = require('ssh2').Client;
const utf8 = require('utf8');


const createNewServer = (machineConfig, socket) => {
  const ssh = new SSHClient();
  const { host, username, password,port } = machineConfig;
  // Connection succeeded
  ssh.on('ready', function () { //Get ready and establish an ssh connection
    socket.send('\r\nSSH Connection succeeded \r\n');

    ssh.shell(function (err, stream) {
      // error
      if (err) {
        return socket.send('\r\nSSH connection failed: ' + err.message + '\r\n');
      }

      // Front end send message
      socket.on('message', function (data) {
        stream.write(data);
      });

      // Send messages to the front end through sh
      stream.on('data', function (d) {
        socket.send(utf8.decode(d.toString('binary')));

        // Close connection
      }).on('close', function () {
        ssh.end();
      });
    })

    // Close connection
  }).on('close', function () {
    socket.send('\r\nSSH Connection closed \r\n');

    // Connection error
  }).on('error', function (err) {
    socket.send('\r\nSSH connection failed: ' + err.message);

    // connect
  }).connect({
    port,
    host,
    username,
    password
  });
}

const isJSON = (str) => { //Judge whether it is json, otherwise it is easy to report errors, and the service will hang up
  if (typeof str == 'string') {
      try {
          JSON.parse(str);
          return true;
      } catch(e) {
          // console.log(str);
          return false;
      }
  }
  console.log('It is not a string!')    
}
app.ws('/',  (ws, req) => { //Establish connection
  ws.on("message", (data) => { //After establishing the connection, obtain the address and other information sent by the client
    try {
      isJSON(data) && createNewServer({
        port: JSON.parse(data).port,
        host: JSON.parse(data).host,
        username: JSON.parse(data).username,
        password: JSON.parse(data).password
      }, ws)
    } catch(e) {
        console.log(e);
    }
  });
});

app.listen(3888,()=>{
  console.log('3888 port is listening')
})
