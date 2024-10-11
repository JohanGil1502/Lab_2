const { createApp, ref } = Vue;
//require('dotenv').config({ path: ".env" });

//const ip = process.env.IP || "localhost";
//const port = process.env.PORT || 5000;

createApp({
    data() {
        const text = "";
        const image = null;
        const imageWithWaterMark = "";
        return {
            text,
            image,
            imageWithWaterMark
        };
    },
    methods: {
        onFileChange(event) {
            this.image = event.target.files[0];
        },
        async sendImage() {
            const formData = new FormData();
            formData.append("text", this.text);
            formData.append("image", this.image);

            const requestOptions = {
                method: "POST",
                body: formData,
            };

            try {
                //console.log(ip, port)
                //const response = await fetch(`http://${ip}:${port}/addWatermark`, requestOptions);
                const response = await fetch(`http://localhost:5000/addWatermark`, requestOptions);
                this.response = response.status;
                
                const blob = await response.blob();
                
                this.imageWithWaterMark = URL.createObjectURL(blob);
            } catch (error) {
                console.error('Error al enviar la imagen:', error);
            }
        }
    }
}).mount("#app");