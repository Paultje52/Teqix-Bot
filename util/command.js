module.exports = class Command {
	constructor(client, {
		name,
		description = "_Geen beschrijving toegevoegd_",
		dir = ".\\commands",
		alias = [],
		enabled = true } = {}, {
			test = (_message, _args, _client) => {
				return true;
			},
			minRole = false,
			permissions = {
				bot: [],
				user: []
			}
		} = {}, {
			cmdArgs = [],
			examples = []
		} = {}
	) {
		this.client = client;
		let category = dir.split("\\");
		category = category.pop();
		if (!permissions.bot) permissions.bot = [];
		if (!permissions.user) permissions.user = [];
		this.help = {
			name: name,
			description: description,
			category: (category === "commands" ? "Main" : category),
			alias: alias,
			enabled: enabled
		}
		this.security = {
			test: test,
			minRole: minRole,
			permissions: permissions
		}
		this.argsTester = async (message, args, client) => {
			let invalid = [];
			for (let num = 0; num < cmdArgs.length; num++) {
				let result = await cmdArgs[num].test(message, args[num], client);
				if (!result) invalid.push({
					num: num+1,
					name: cmdArgs[num].name
				});
			};
			if (invalid.length === 0) return true;
			else if (invalid.length === 1) {
				message.channel.send(message.embed()
					.setTitle(toTitleCase(this.help.name))
					.setDescription(`Het ${invalid[0].num}e argument (**${invalid[0].name}**) is onjuist!\n\n_Voorbeeld:_ **${client.config.prefix}${examples[Math.floor(Math.random() * examples.length)].replace("<cmd>", this.help.name)}**`)
				);
			} else {
				let missingArgs = [];
				invalid.forEach(arg => {
					missingArgs.push(`Argument ${arg.num}: **${arg.name}**`);
				});
				message.channel.send(message.embed()
				.setTitle(toTitleCase(this.help.name))
				.setDescription(`${invalid.length} argumenten zijn onjuist!\n- ${missingArgs.join("\n- ")}\n\n_Voorbeeld:_ **${client.config.prefix}${examples[Math.floor(Math.random() * examples.length)].replace("<cmd>", this.help.name)}**`)
			);
			}
			return false;
		}
	}
}

function toTitleCase(string) {
  return string.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}