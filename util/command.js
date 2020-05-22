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
	}
}