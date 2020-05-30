module.exports = class Cookies extends require(`${process.cwd()}/util/command.js`) {
	constructor(client) {
		super(client, {
			name: "cookies",
			description: "Kijk hoeveel cookies je hebt!",
			dir: __dirname,
			alias: ["koek", "koekjes"]
		}, {}, {
			examples: [
				"<cmd>",
				"<cmd> <@327462385361092621>"
			]
		});
	}

	async run(message, args) {
		if (!args[0]) return message.channel.send(message.embed(false)
			.setTitle("Cookies")
			.setDescription(`Je hebt **${message.author.settings.cookies.amount} koekjes**!\nJe bent **${message.author.settings.cookies.cookieMasterCount} keer** cookiemaster geweest!`)	
		);
		
    let member = message.getMember(args[0]);
		if (!member) return message.error(`Gebruiker ${args[0]} niet gevonden!`);
		if (!member.user.settings) member.user.settings = await this.client.db.get(`author-${member.id}`);
		if (!member.user.settings) member.user.settings = this.client.config.authorSettings;
		message.channel.send(message.embed(false)
			.setTitle(`Cookies van ${member.displayName}`)
			.setDescription(`${member} heeft **${message.author.settings.cookies.amount} koekjes**!\n${member} is **${message.author.settings.cookies.cookieMasterCount} keer** cookiemaster geweest!`)	
		);
	}
}