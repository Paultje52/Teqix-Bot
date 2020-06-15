const { channels, roles } = require("../config.json")
const chalk = require("chalk")
const { MessageEmbed } = require("discord.js")

module.exports = class Status {
    constructor(client) {
		this.client = client;
		this.name = "guildMemberAdd";
    }
  
    async run(member) {
		let channel = this.client.channels.cache.find(ch => ch.name.toLowerCase.includes(channels["join-leave"])) || this.client.channel.cache.get(channels["join-leave"]);
		if(!channel) console.error(chalk.red(`Het kanaal voor joinen en leaven in de database is incorrect. Waarde: ${channel}`));

		let embed = new MessageEmbed()
			.setTitle("Nieuwe member")
			.setFooter(`${member.user.tag} is de discord binnengekomen`, member.user.avatarURL())
			.setColor("GREEN")
			.setDescription(`${member}, welkom in ${member.guild.name}! Lees de regels, blijf aardig tegen elkaar en heb veel plezier!`)
			.setThumbnail(this.client.user.avatarURL());
		channel.send(embed);

		// Check for joinrole
		let role = this.client.roles.cache.find(r => r.name.includes(roles["joinrole"])) || this.client.roles.cache.get(roles["joinrole"]);
		if(role) member.roles.add(role);
	}
}