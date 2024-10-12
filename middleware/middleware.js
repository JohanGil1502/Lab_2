const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { Blob } = require('buffer'); 
require('dotenv').config({ path: ".env" });

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const app = express();

const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/addWatermark', upload.single('image'), async (req, res) => {
    try {
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
            const response = await fetch(`http://localhost:5000/addWatermark`, requestOptions);
            const blob = await response.blob();  
            res.set('Content-Type', 'image/png');
            res.send(Buffer.from(await blob.arrayBuffer()));
        } catch (error) {
            console.error('Error al enviar la imagen:', error);
        }

    } catch (error) {
        console.log("Error al añadir la marca de agua:", error.message);
        res.status(500).send({ error: 'Error al procesar la imagen' });
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto: ${port}`);
});
