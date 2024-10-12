const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { Blob } = require('buffer');
require('dotenv').config({ path: ".env" });

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const port = process.env.PORT;
const ip_registry = process.env.IP_REGISTRY;
const port_registry = process.env.PORT_REGISTRY;

let servers = [];

let currentServerIndex = 0;

async function obtainServers(){
    try {
        const response = await fetch(`http://${ip_registry}:${port_registry}/servers`);
        console.log("Solicitando servidores al Server_Registry");
        const listServers = await response.json(); 
        listServers.forEach(element => {
            servers.push({ipServer:element.ipServer, portServer: element.portServer, failed: false})
        });
        console.log("Servidores actualizados\n", show_servers(servers));

    } catch (error) {
        console.error("El server_registry no está activo");
    }
}

function show_servers(servers){
    let message ="";
    for (let index = 0; index < servers.length; index++) {
        const element = servers[index];
        message += "servidor " +  (index+1) + ":" + " ip= " + element.ipServer + " puerto= " + element.portServer + "\n"    
    }
    return message;
}

obtainServers();

app.put('/addServer', async (req, res) => {
    const data = req.body;
    console.log("Servidor para agregar: " , "ip:" , data.ip, "puerto:" , data.port);
    const serverFound = servers.find(server => server.ipServer === data.ip && server.portServer === data.port);
    if (serverFound) {
        serverFound.failed = false
        res.send({answer: "Conexión realizada"})
        console.log(`Servidor de ip ${data.ip} y de puerto ${data.port} está en linea de nuevo`)
    }else{
        servers.push({ipServer:data.ip, portServer: data.port, petitions:0, failed: false})
        res.send({answer: "Conexión realizada"})
        console.log(`El servidor de ip ${data.ip} y de puerto ${data.port} fue agregado`)
    }
});

async function getNextServer() {
    const availableServers = servers.filter(server => !server.failed);

    if (availableServers.length === 0) {
        return null;
    }

    const selectedServer = availableServers[currentServerIndex];
    currentServerIndex = (currentServerIndex + 1) % availableServers.length;

    try {

        const response = await fetch(`http://${selectedServer.ipServer}:${selectedServer.portServer}/healthCheck`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();
        
        if (data.answer === 'OK') {
            return selectedServer;
        } else {
            selectedServer.failed = true;
            return await getNextServer();
        }
    } catch (error) {
        console.log("Error, servidor caído:", selectedServer);
        selectedServer.failed = true;
        return await getNextServer();
    }
}

app.post('/addWatermark', upload.single('image'), async (req, res) => {
    let availableServer;
    availableServer = await getNextServer();
    console.log("Servidor elegido: ", availableServer)

    if (availableServer) {
        const watermarkText = req.body.text;
        const imageBuffer = req.file.buffer;

        const imageBlob = new Blob([imageBuffer], { type: 'image/png' });


        const formData = new FormData();
        formData.append("text", watermarkText);
        formData.append("image", imageBlob);

        const requestOptions = {
            method: "POST",
            body: formData,
        };

        try {
            const response = await fetch(`http://${availableServer.ipServer}:${availableServer.portServer}/addWatermark`, requestOptions);
            const blob = await response.blob();
            res.set('Content-Type', 'image/png');
            res.send(Buffer.from(await blob.arrayBuffer()));
        } catch (error) {
            console.error('Error al enviar la imagen:', error);
        }


    } else {
        console.log("no hay servidores disponibles")
        return res.send({
            info: 'Todos los servidores están caidos :('
        });  
    }


}); 
app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto: ${port}`);
});
