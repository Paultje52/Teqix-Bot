module.exports = class Status {
    constructor(client) {
        this.client = client;
        this.help = {
            name: "ready"
        }
    }
    async run(client) {
        // Scrolling statussen
        let statusses = [{ text: "Teqix Community", type: "WATCHING" }]
        let i = setInterval(() => {
            let random = statusses[Math.floor(Math.random() * statusses.length)];
            client.user.setActivity(random.text, { type: random.type })
                .catch(error => {
                    console.error(error);
                    clearInterval(i);
                    console.log(3);
                });
        }, 10e3);

    }
}