module.exports = class Help extends require(`${process.cwd()}/util/command.js`) {
	constructor(client) {
		super(client, {
			name: "help",
			description: "Bekijk de commands!",
			dir: __dirname,
			alias: ["h", "?"]
		});
	}

	async run(message) {
		let categories = new Map();

		let embed = message.embed().setTitle("Help");
		let description = "";
		description += "Hieronder staan alle commands beschreven\n"
		this.client.commands.forEach(command => {
			if (!categories.has(command.help.category)) {
				categories.set(command.help.category, "");
			}
			categories.set(command.help.category, `${categories.get(command.help.category)}__${this.client.prefix}${command.help.name}__: ${command.help.description}\n`);
		});
		categories.forEach((cat, i) => {
			embed.addField(i, cat);
		});
		embed.setDescription(description);
		message.channel.send(embed);
	}
}