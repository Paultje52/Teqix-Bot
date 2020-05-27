module.exports = class Ping extends require(`${process.cwd()}/util/command.js`) {
	constructor(client) {
		super(client, {
			name: "idee",
			description: "Geef je idee op!",
			dir: __dirname,
			alias: ["idea"]
		}, {}, {
      cmdArgs: [{
        name: "idee",
        test: (_message, arg) => !!arg
      }],
      examples: [
        "<cmd> Iedereen een gratis koekje geven!"
      ]
    });
	}

	async run(message, args) {
    if (!args[0]) return message.error("Geen idee opgegeven!");
    let channel = message.guild.channels.cache.find(c => c.name.toLowerCase().includes("idee"));
    if (!channel) return message.error("Ideeën kanaal niet gevonden!");
    let msg = await channel.send(message.embed()
      .setTitle(`Idee van ${message.member.displayName}`)
      .setDescription(args.join(" "))
    );
    await msg.react("556440979150864384");
    msg.react("556441024281575444");
    message.channel.send(message.embed()
      .setTitle("Idee verstuurt!")
      .setDescription(`Bekijk je idee in ${channel}!`)
    );
	}
}