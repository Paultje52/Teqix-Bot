module.exports = class Ticket_Close extends require(`${process.cwd()}/util/command.js`) {
	constructor(client) {
		super(client, {
			name: "sluit",
			description: "Sluit een ticket!",
			dir: __dirname,
			alias: ["close"]
		});
	}

	async run(message) {
		let data = await this.client.db.get(`ticket-${message.channel.id}`);
		if (!data) return message.error("Dit is geen ticket!");
		message.channel.send(message.embed()
			.setTitle("Ticket sluiten")
			.setDescription(`Tickets sluiten gaat via het ticket menu. Klik [hier](https://discordapp.com/channels/${message.guild.id}/${message.channel.id}/${data.msg.first}) om daar heen te gaan!`)
		);
	}
}