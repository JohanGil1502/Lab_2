const { createApp, ref } = Vue;
var socket = io.connect('http://localhost:7000', { 'forceNew': true });

createApp({
    data() {
        return {
            letter: ''  // letter ahora es reactiva
        }
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
    },
    mounted() {
        var self = this;  // Guardar referencia al contexto de Vue
        socket.on('messages', function (data) {
            self.letter = self.letter+data;  // Actualizar 'letter' de forma reactiva
            console.log(data);
        });
    }
}).mount("#app");
