module.exports = class Ping extends require(`${process.cwd()}/util/command.js`) {
    constructor(client) {
        super(client, {
            name: "stats",
            description: "Bekijk de server stats!",
            dir: __dirname,
            alias: ["statistieken"]
        });
    }
    async run(message, args) {


    }
}