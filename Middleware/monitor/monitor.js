let servers = [];



setInterval(async () => {
    // console.log("revisando servidores caidos")
    for (let server of servers) {
        if (server.failed) {
            try {
                const response = await fetch(`http://${server.ipServer}:${server.portServer}/healthCheck`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })

                const data = await response.json()
                if (data.answer === 'OK') {
                    console.log(`sevidor ${server.portServer} disponible`);
                    server.failed = false; 
                }
            } catch (error) {
                console.log(`servidor ${server.portServer} caido`)
            }
        }
    }
}, 1000); 