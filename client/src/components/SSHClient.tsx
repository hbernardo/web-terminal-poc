//SSHClient 
import React, { useEffect, useState,FunctionComponent } from 'react';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';

type Props = {//Pass the four parameters, which are the information of the server you need to connect to.
  host?:string;
  port?:number;
  username?:string;
  password?:string;
}

var host: string | undefined;
var port: number | undefined;
var username: string | undefined;
var password: string | undefined;

const WebTerminal :FunctionComponent<Props> = (props) => {
  const [webTerminal, setWebTerminal] = useState<Terminal | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  if (!host) {
    host = props.host || prompt('SSH Server host') || undefined;
  }

  if (!port) {
    port = props.port || Number(prompt('SSH Server port')) || undefined;
  }

  if (!username) {
    username = props.username || prompt('SSH Server username') || undefined;
  }

  if (!password) {
    password = props.password || prompt('SSH Server password') || undefined;
  }

  useEffect(() => {
    // Add listening event
    if (webTerminal && ws) {
      // monitor
      webTerminal.onKey(e => {
        const { key } = e;
        ws.send(key);
      });
      // ws listening
      ws.onmessage = e => {
        console.log(e);
        if (webTerminal) {
          if (typeof e.data === 'string') {
            webTerminal.write(e.data);
          } else {
            console.error('Format error');
          }
        }
      };
    }
  }, [webTerminal, ws]);

  
  useEffect(() => {
    // Initialize terminal
    const ele = document.getElementById('terminal');
    while(ele && ele.hasChildNodes()){ //When there are still child nodes under the table, the loop continues
     //This is to correct the parameter in case of wrong parameter input. Click Connect to create a new window
      ele && ele.firstChild && ele.removeChild(ele.firstChild);
    }
    if (ele) {
      // initialization
      const terminal = new Terminal({
        cursorBlink: true,
        cols: 175,
        rows: 40,
      });
      terminal.focus();
      terminal.onKey(e => {
        // terminal.write(e.key);
        if (e.key== '\r') { 
        //   terminal.write('\nroot\x1b[33m$\x1b[0m');
        } else if (e.key== '\x7F') {
          terminal.write('\b \b');
        } 
      });

      terminal.open(ele);
      terminal.write('Connecting....');
      setWebTerminal(terminal);
    }
    // Initialize ws connection
    if (ws) ws.close();

    const socket = new WebSocket('ws://127.0.0.1:3888');
    socket.onopen = () => {//Establish socket connection with the server
      let message = {
          host:host,
          port:port,
          username:username,
          password:password
      };
      socket.send(JSON.stringify(message));
    };
    setWs(socket);
  }, [host,port,username,password]);

  return <div id="terminal"  />; 
};

export default WebTerminal;
//Just follow the project launch
