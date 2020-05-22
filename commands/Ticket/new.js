module.exports = class Ticket_New extends require(`${process.cwd()}/util/command.js`) {
	constructor(client) {
		super(client, {
			name: "ticket",
			description: "Maak een ticket!",
			dir: __dirname,
			alias: ["new", "nieuw"]
		});
	}

	async run(message) {
		let msg = await message.channel.send(`:warning: Ticket wordt aangemaakt.`);
		let ch = await message.guild.channels.create(`ticket-${message.author.tag}`, {
			parent: message.guild.channels.cache.find(ch => ch.type == "category" && ch.name.includes("Tickets"))
		});
		await ch.lockPermissions();
		ch.createOverwrite(message.author, { VIEW_CHANNEL: true });
		msg.edit(`:white_check_mark: Ticket is aangemaakt! ${ch}`);
		ch.send(message.embed().setTitle("Ticket aangemaakt!")
			.setDescription(`Hallo ${message.author}, bedankt voor het aanmaken van een supportticket.\nStel alvast je vraag, het staffteam helpt zo snel mogelijk!`));
		this.client.db.set(`ticket-${ch.id}`, {
			owner: message.author.id
		});
	}
}