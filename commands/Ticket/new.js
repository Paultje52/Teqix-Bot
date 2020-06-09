module.exports = class Ticket_New extends require(`${process.cwd()}/util/command.js`) {
	constructor(client) {
		super(client, {
			name: "ticket",
			description: "Maak een ticket!",
			dir: __dirname,
			alias: ["new", "nieuw"]
		});
	}

	async run(message, args) {
		let msg = await message.channel.send(message.embed()
			.setTitle("Ticket")
			.setDescription("Je ticket wordt gemaakt...")
		);
		let onderwerp = "Geen onderwerp opgegeven.";
		if (args[0]) onderwerp = args.join(" ");
		let channel = await message.guild.channels.create(`ticket-${message.author.tag}`, {
			parent: message.guild.channels.cache.find(ch => ch.type == "category" && ch.name.toLowerCase().includes(this.client.config.channels.ticket.toLowerCase()))
		});
		channel.createOverwrite(message.author, { VIEW_CHANNEL: true, MANAGE_MESSAGES: true });
		channel.createOverwrite(message.guild.roles.cache.find(r => r.name.toLowerCase().includes(this.client.config.roles.support.toLowerCase())).id, { VIEW_CHANNEL: true });
		channel.createOverwrite(message.guild.id, { VIEW_CHANNEL: false });
		msg.edit(message.embed()
			.setTitle("Ticket")
			.setDescription(`Hier is je ticket: ${channel}!`)
		);
		let m = await channel.send(message.embed().setTitle("Ticket aangemaakt!")
			.setDescription(`Hallo ${message.author}, bedankt voor het aanmaken van een ticket!\n**Onderwerp:** ${onderwerp}\n\n🔒 Sluit dit ticket\n📌 Staff: Claim dit ticket`));
		m.pin();
		await m.react("🔒");
		await m.react("📌");
		setTimeout(() => {
			this.client.db.set(`ticket-${channel.id}`, {
				owner: message.author.id,
				created: Date.now(),
				subject: onderwerp,
				msg: {
					first: m.id
				}
			});
		}, 1000);
	}
}