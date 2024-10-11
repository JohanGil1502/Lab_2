const { createApp } = Vue;

createApp({
    data() {
        return {
            text: "",  
            image: null,  
            imageWithWaterMark: ""  
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
                const response = await fetch(`http://localhost:5000/addWatermark`, requestOptions);
                
                if (!response.ok) {
                    throw new Error("Error al recibir la imagen procesada");
                }

                const blob = await response.blob();  
                this.imageWithWaterMark = URL.createObjectURL(blob); 
            } catch (error) {
                console.error('Error al enviar la imagen:', error);
            }
        }
    }
}).mount("#app");
