module.exports = class Ping extends require(`${process.cwd()}/util/command.js`) {
    constructor(client) {
        super(client, {
            name: "setcoronakanaal",
            description: "Stel het corona kanaal in!",
            dir: __dirname,
            alias: ["setcorona"]
        });
    }

    async run(message, args) {

        if (!args[0]) return message.error("Geen kanaal opgegeven!");
        let kanaal = message.mentions.channels.first() || message.guild.channels.cache.find(c => c.name == args[0]) || message.guild.channels.cache.get(args[0]);
        if (!kanaal) return message.error("Geen kanaal opgegeven!");

        await this.client.db.set("coronaChannel", kanaal.id);

        let msg = await message.channel.send(message.embed()
            .setTitle("Info ophalen..")
        );
        await this.client.db.set("coronaMsg", msg.id)
        let corona = require("../events/corona.js")

    }
}