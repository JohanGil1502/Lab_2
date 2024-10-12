const express = require('express');
const multer = require('multer');
const cors = require('cors');
const sharp = require('sharp'); 
require('dotenv').config({ path: ".env" });

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }); 

const app = express();
 
const ip_server = process.env.IP;
const port_server = process.env.PORT;
const ip_registry = process.env.IP_REGISTRY;
const port_registry = process.env.PORT_REGISTRY;


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
 
async function connect() { 
    console.log("Realizando conexión")
    let answer = "";
    await fetch(`http://${ip_registry}:${port_registry}/addServer`, {
        method: 'PUT', 
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ip: ip_server, port: port_server })
    })
    .then((answer) => answer.json())
    .then((data) => answer = data);

}

connect();

app.post('/addWatermark', upload.single('image'), async (req, res) => {
    try {
        const watermarkText = req.body.text;
        const imageBuffer = req.file.buffer;

       
        const image = sharp(imageBuffer);
        const { width, height } = await image.metadata();

        const watermark = Buffer.from(
            `<svg width="${width}" height="${height}">
                <text x="10" y="50" font-size="50" fill="white">${watermarkText}</text>
            </svg>`
        );
        const modifiedBuffer = await image
            .composite([{ input: watermark, blend: 'overlay' }])
            .png()
            .toBuffer();

        res.set('Content-Type', 'image/png');
        res.send(modifiedBuffer); 
    } catch (error) {
        console.log("Error al añadir la marca de agua:", error.message);
        res.status(500).send({ error: 'Error al procesar la imagen' });
    }
});

app.get('/healthCheck', (req, res) => {
    console.log("chequeado")
    res.status(200).send({ answer: 'OK' }); 
});

app.listen(port_server, () => {
    console.log(`Servidor escuchando en el puerto: ${port_server}`);
});
