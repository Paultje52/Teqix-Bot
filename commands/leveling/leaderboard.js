module.exports = class Leaderboard extends require(`${process.cwd()}/util/command.js`) {
	constructor(client) {
		super(client, {
			name: "leaderboard",
			description: "Bekijk het level leaderboard!",
			dir: __dirname,
			alias: ["lb"]
		});
	}

	async run(message) {
		let users = [];
		for (let member of message.guild.members.cache.array()) {
			if (member.user.bot) continue;
      if (!member.user.settings) member.user.settings = await this.client.db.get(`author-${member.user.id}`);
			if (!member.user.settings) member.user.settings = this.client.config.authorSettings;
			users.push(member);
		}
		users = users.sort((a, b) => b.user.settings.leveling.xp-a.user.settings.leveling.xp).slice(0, 10);
		let output = "";
		users.forEach((member, i) => {
			output += `**${i+1}**. ${member.displayName}\n> Level: ${member.user.settings.leveling.level} (XP: ${member.user.settings.leveling.xp})\n`;
		});
		message.channel.send(message.embed()
			.setTitle("Leaderboard")
			.setDescription(output)
		);
	}
}
