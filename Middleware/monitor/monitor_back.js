const express = require('express');
const cors = require('cors');
const { Client } = require('ssh2');
const conn = new Client();
let servers = [];
require('dotenv').config({ path: ".env" });
const ipMonitor = process.env.IP_MONITOR;
const portMonitor = process.env.PORT_MONITOR;
const ipComputer1= process.env.IP_COMPUTER1;
const ipComputer2= process.env.IP_COMPUTER2;
const ipRegisterServer= process.env.IP_REGISTER_SERVER;
const portRegisterServer= process.env.PORT_REGISTER_SERVER;
let infoComputerSelected;
let actualPort = 5000;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/deploy', async (req, res) => {
    console.log("Creando nueva instancia");
    await chooseComputer();
    res.status(200).send({ answer: 'OK' }); 
});

//validar cuando no hay servidores en el arreglo
// setInterval(async () => {
//     for (let server of servers) {
//         if (server.failed) {
//             try {
//                 const response = await fetch(`http://${server.ipServer}:${server.portServer}/healthCheck`, {
//                     method: 'GET',
//                     headers: {
//                         'Content-Type': 'application/json'
//                     }
//                 })

//                 const data = await response.json()
//                 if (data.answer === 'OK') {
//                     console.log(`sevidor ${server.portServer} disponible`);
//                     server.failed = false;
//                 }
//             } catch (error) {
//                 console.log(`servidor ${server.portServer} caido`)
//             }
//         }
//     }
// }, 1000);


function chooseComputer(){
    selectComputer();
    connect();
}

function selectComputer(){
    let number = Math.floor(Math.random() * 2) + 1;
    let command;
    let ipComputerSelected;
    let passwordSelected;
    let serverName;
    //toca cambiar a 'server' con contraseña 211100
   if (number == 1){
        ipComputerSelected = ipComputer1;
        passwordSelected = 'sebas1502'
        serverName = 'administrador'
    }else{
        ipComputerSelected = ipComputer2;
        passwordSelected = 'sebas1502'
        serverName = 'administrador'
    }
    command = `echo "${passwordSelected}" | sudo -S docker run -e PORT=${actualPort} -e IP=${ipComputerSelected} -e IP_REGISTRY=${ipRegisterServer} -e PORT_REGISTRY=${portRegisterServer} --name server${actualPort-5000} -p ${actualPort}:${actualPort} -d server69`;
    actualPort++;
    infoComputerSelected = {command: command,ipComputerSelected:ipComputerSelected,passwordSelected:passwordSelected,name:serverName};
    console.log(infoComputerSelected)
}

function connect(){
    conn.on('ready', () => {
      console.log('Conexión SSH establecida');
      conn.exec(infoComputerSelected.command, (err, stream) => {
        if (err) throw err;
    
        stream.on('close', (code, signal) => {
          console.log('Comando finalizado con código:', code);
          conn.end(); // Finaliza la conexión SSH
        }).on('data', (data) => {
          console.log('Salida del comando:\n' + data);
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

app.listen(portMonitor, () => {
    console.log(`Servidor escuchando en el puerto: ${portMonitor}`);
});
