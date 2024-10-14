const { createApp, ref } = Vue;

createApp({
    data() {
    },
    methods: {
        async deployServer() {
            const response = await fetch(`http://localhost:7000/deploy`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
    
            const data = await response.json();
            
            if (data.answer === 'OK') {
                console.log('servidor desplegado');
            } else {
                console.log('no fue posible desplegar el servidor');
            }
        }
    }
}).mount("#app");