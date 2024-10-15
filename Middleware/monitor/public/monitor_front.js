const app = new Vue({
    el: '#app',
    data() {
        return {
            overallStatusColor: 'green',
            servers: [
                {
                    name: 'Server 1',
                    status: ['green', 'green', 'yellow', 'red', 'green', 'green'],
                    uptime: 99.96
                },
                {
                    name: 'Server 2',
                    status: ['green', 'green', 'green', 'yellow', 'green'],
                    uptime: 99.99
                }
            ],
            socket: null
        };
    },
    methods: {
        stateColor(state) {
            if (state === 'green') return 'green';
            if (state === 'red') return 'red';
            if (state === 'yellow') return 'yellow';
        },
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
        this.socket = io.connect('http://localhost:7000', { 'forceNew': true });
        
        this.socket.on('connect', () => {
            console.log('Conectado al servidor de WebSocket');
        });

        this.socket.on('connect_error', (err) => {
            console.error('Error de conexión:', err);
        });

        this.socket.on('messages', (data) => {
            console.log(data);
            // Aquí puedes actualizar el estado de tus servidores según el mensaje recibido
        });
    }
});
