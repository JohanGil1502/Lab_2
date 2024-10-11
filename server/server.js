const express = require('express');
const multer = require('multer');
const cors = require('cors');
const gm = require('gm').subClass({ imageMagick: true });  // Usar GraphicsMagick

require('dotenv').config({ path: ".env" });

// Almacenamiento en memoria en lugar de disco
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const app = express();

const ip = process.env.IP;
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/addWatermark', upload.single('image'), async (req, res) => {
    try {
        const watermarkText = req.body.text;
        const imageBuffer = req.file.buffer;

        // Usar gm para cargar la imagen y agregar la marca de agua
        gm(imageBuffer)
            .fontSize(40)  // Ajustar el tamaño de la fuente
            .fill('rgba(255,255,255,0.5)')  // Color blanco semitransparente
            .drawText(10, 50, watermarkText)  // Ajustar la posición del texto
            .toBuffer('PNG', (err, buffer) => {
                if (err) {
                    console.log("Error al añadir la marca de agua: ", err);
                    return res.status(500).send({ error: 'Error al procesar la imagen' });
                }

                console.log("Se ha añadido una marca de agua a la imagen.");
                res.set('Content-Type', 'image/png');
                res.send(buffer);  // Enviar la imagen con la marca de agua
            });
    } catch (error) {
        console.log("Error al añadir la marca de agua:", error.message);
        res.status(500).send({ error: 'Error al procesar la imagen' });
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto: ${port}`);
});
