const { MessageAttachment } = require("discord.js")
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
		if (this.client.db.get(`ticket-${message.channel.id}`) == null) return message.channel.send(`:negative_squared_cross_mark: Dit is geen ticket!`);
		if (!message.member.roles.cache.find(r => r.name.toLowerCase().includes("staff"))) return message.channel.send(":negative_squared_cross_mark: Je hebt geen permissies om een ticket te sluiten!");
		let msg = await message.channel.send(`:warning: Ticket wordt verwijderd, je hebt 15 seconden om **annuleer** te typen, dan wordt deze actie geannuleerd.`);
		let collector = message.channel.createMessageCollector(m => m.author.id == message.author.id && m.content.toLowerCase() == "annuleer", { time: 15e3, max: 1 });
		collector.on("end", async m => {
			if (m.size == 0) {
				await this.createTranscript(message)
				return message.channel.delete();
			}
			message.channel.send(":white_check_mark: Succesvol geannuleerd!")
		});
	}
	async createTranscript(message) {
		let logChannel = await message.guild.channels.cache.find(ch => ch.name.includes("ticket-transcripts"))
		if(logChannel) {
			let ticketMessages = await message.channel.messages.fetch();
			let text = "";
			ticketMessages.forEach(msg => {
				text += `${msg.author.tag} ${msg.createdAt}: ${msg.content}\r\n`
			})
			let attachment = new MessageAttachment(Buffer.from(text, "utf-8"), "transcript.txt");
			logChannel.send(attachment)
		}
	}
}