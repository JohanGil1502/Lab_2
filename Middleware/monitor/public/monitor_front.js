const app = new Vue({
    el: '#app',
    data() {
        return {
            chaosMessage: '',
            overallStatusColor: 'green',
            servers: [
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
        },
        async chaosIngeniery() {
            const response = await fetch(`http://localhost:7000/chaosIngeniery`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
    
            const data = await response.json();
            
            if (data.answer === 'OK') {
                console.log('servidor caido');
            } else {
                console.log('no fue posible caer el servidor');
            }
        }
    },
    mounted() {
        this.socket = io.connect('http://localhost:7000', { 'forceNew': true });
        console.log('linea despues de al parecer conectar')        
        this.socket.on('connect', () => {
            console.log('Conectado al servidor de WebSocket');
        });

        this.socket.on('connect_error', (err) => {
            console.error('Error de conexión:', err);
        });

        this.socket.on('chaosMessage', (data) => {
            console.log(data);
            this.chaosMessage = data;
        });

        this.socket.on('messages', (data) => {
            let server = this.servers.find(server => server.name === data.name);
            if (server) {
                if (server.status.length == 30) {
                    server.status.shift();
                    server.status.push(data.status)
                }else{
                    server.status.push(data.status)
                }
            }else{
                this.servers.push(
                    {
                        name: data.name,
                        status: [data.status],
                        uptime: 99.99
                    }
                )
            }
            console.log(data);
        });
    }
});
