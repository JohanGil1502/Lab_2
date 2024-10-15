const express = require('express');
const cors = require('cors');
const { Client } = require('ssh2');
require('dotenv').config({ path: ".env" });
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))

var page = require('http').Server(app);
var io = require('socket.io')(page);

const ipMonitor = process.env.IP_MONITOR;
const portMonitor = process.env.PORT_MONITOR;
const ipComputer1 = process.env.IP_COMPUTER1;
const ipComputer2 = process.env.IP_COMPUTER2;
const ipRegisterServer = process.env.IP_REGISTER_SERVER;
const portRegisterServer = process.env.PORT_REGISTER_SERVER;
let infoComputerSelected;
let actualPort = 5000;
let servers = [];
let ipToAdd;
let portToAdd;

io.on('connection', function(socket) {
  console.log('Alguien se ha conectado con Sockets');
});

app.get('/deploy', async (req, res) => {
  console.log("Creando nueva instancia");
  await chooseComputer();
  res.status(200).send({ answer: 'OK' });
});

setInterval(async () => {
  if (servers.length > 0) {
    for (let server of servers) {
      try {
        const response = await fetch(`http://${server.ipServer}:${server.portServer}/healthCheck`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        const data = await response.json()
        if (data.answer === 'OK') {
          console.log(`servidor ${server.portServer} disponible`);
          io.emit('messages', 1)
          server.failed = false;
        }
      } catch (error) {
        console.log(error)
        io.emit('messages', 0)
        console.log(`servidor ${server.portServer} caido`)

      }
    }
  }
}, 1000);


function chooseComputer() {
  selectComputer();
  connect();
}

function selectComputer() {
  let number = Math.floor(Math.random() * 2) + 1;
  let command;
  let ipComputerSelected;
  let passwordSelected;
  let serverName;
  //toca cambiar a 'server' con contraseña 211100
  if (number == 1) {
    ipComputerSelected = ipComputer1;
    passwordSelected = 'sebas1502'
    serverName = 'administrador'
  } else {
    ipComputerSelected = ipComputer2;
    passwordSelected = 'sebas1502'
    serverName = 'administrador'
  }
  command = `echo "${passwordSelected}" | sudo -S docker run -e PORT=${actualPort} -e IP=${ipComputerSelected} -e IP_REGISTRY=${ipRegisterServer} -e PORT_REGISTRY=${portRegisterServer} --name server${actualPort - 5000} -p ${actualPort}:${actualPort} -d server69`;
  ipToAdd = ipComputerSelected;
  portToAdd = actualPort;
  actualPort++;
  infoComputerSelected = { command: command, ipComputerSelected: ipComputerSelected, passwordSelected: passwordSelected, name: serverName };
  console.log(infoComputerSelected)
}

function connect() {
  const conn = new Client();
  conn.on('ready', () => {
    console.log('Conexión SSH establecida');
    conn.exec(infoComputerSelected.command, (err, stream) => {
      if (err) throw err;
      stream.on('close', (code, signal) => {
        console.log('Comando finalizado con código:', code);
        conn.end(); // Finaliza la conexión SSH
      }).on('data', (data) => {
        console.log('Salida del comando:\n' + data);
        servers.push({ ipServer: ipToAdd, portServer: portToAdd, failed: false})
        console.log({ ipServer: ipToAdd, portServer: portToAdd })
      }).stderr.on('data', (data) => {
        console.error('Error del comando:\n' + data);
      });
    });
  }).connect({
    host: infoComputerSelected.ipComputerSelected,
    port: 22, // Puerto por defecto de SSH
    username: infoComputerSelected.name,
    password: infoComputerSelected.passwordSelected
  });
}

page.listen(portMonitor, function(){
  console.log(`servidor corriendo en http://localhost:${portMonitor}`)
});