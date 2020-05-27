module.exports = class WouldYouRather {
	constructor(client) {
		this.client = client;
		this.name = "messageReactionAdd";
	}

	async run(reaction, user) {
		let guild = reaction.message.guild;
		let member = guild.members.cache.get(user.id)
		if (!reaction.message.channel.name.includes("would-you-rather") || member.roles.cache.find(r => r.name.includes("Staff"))) return;
		let reactions = (await reaction.message.fetch()).reactions.cache;
		if (reactions.filter(async r => {
			let users = await r.users.fetch();
			return users.has(user)
		}).size > 1) reaction.users.remove(user);
	}
}