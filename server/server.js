const express = require('express');
const multer = require('multer');
const cors = require('cors');
const sharp = require('sharp'); 
require('dotenv').config({ path: ".env" });

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto: ${port}`);
});
