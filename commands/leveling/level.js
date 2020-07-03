module.exports = class Level extends require(`${process.cwd()}/util/command.js`) {
	constructor(client) {
		super(client, {
			name: "level",
			description: "Bekijk je level!",
			dir: __dirname,
			alias: ["xp", "lvl"]
		});
	}

	async run(message, args) {
    if (!args[0]) {
      message.channel.send(message.embed()
        .setTitle("Level")
        .setDescription(`Level: **${message.author.settings.leveling.level}**\nXP: **${message.author.settings.leveling.xp}**`)
      );
    } else {
      let member = message.getMember();
      if (!member) return message.error(`Gebruiker ${args[0]} niet gevonden!`);
      if (!member.user.settings) member.user.settings = await this.client.db.get(`author-${member.user.id}`);
      if (!member.user.settings) member.user.settings = this.client.config.authorSettings;
      message.channel.send(message.embed()
        .setTitle(`Level van ${member.displayName}`)
        .setDescription(`Level: **${member.user.settings.leveling.level}**\nXP: **${member.user.settings.leveling.xp}**`)
      );
    }
	}
}
