module.exports = class Review extends require(`${process.cwd()}/util/command.js`) {
	constructor(client) {
		super(client, {
			name: "review",
			description: "Schrijf een review!",
			dir: __dirname
		}, {}, {
      cmdArgs: [{
        name: "Sterren (1-5)",
        test: (_message, arg) => !isNaN(Number(arg)) && Number(arg) >= 1 && Number(arg) <= 5
      }, {
        name: "Beschrijving",
        test: (_message, arg) => !!arg
      }],
      examples: [
        "<cmd> 5 Perfect!",
        "<cmd> 4 Nice, maar X en X kunnen beter",
        "<cmd> 3 Opzich wel goed, maar X moet echt beter gaan"
      ]
    });
	}

	async run(message, args) {
    let stars = Number(args.shift());
    let description = args.join(" ");
    
    let reviewChannel = message.guild.channels.cache.find(c => c.name.includes(this.client.config.channels.review));
    if (!reviewChannel) return message.error(`Reviewkanaal (${this.client.config.channels.review}) niet gevonden!`);

    if (message.author.settings.didReview) return message.error(`\`\`\`Je hebt al een keer een review gestuurt.\`\`\`_Bekijk je review [hier](https://discordapp.com/channels/${message.guild.id}/${reviewChannel.id}/${message.author.settings.didReview})._`);

    let color = "#00ff00";
    if (stars === 4) color = "#ffee00";
    else if (stars === 3) color = "#fcad03";
    else if (stars === 2) color = "#ff6600";
    else if (stars === 1) color = "#ff0000";

    let starsDisplay = "";
    for (let i = 0; i < stars; i++) {
      starsDisplay += "⭐ ";
    }
    for (let i = 0; i < 5-stars; i++) {
      starsDisplay += "★ ";
    }

    let msg = await reviewChannel.send(message.embed()
      .setTitle(`Review van ${message.author.username}`)
      .setColor(color)
      .setDescription(`${starsDisplay}\n\n\`\`\`${description}\`\`\``)
    );
    message.channel.send(message.embed()
      .setTitle("Review verstuurt!")
      .setDescription(`Je review is verstuurt in ${reviewChannel}! Klik [hier](https://discordapp.com/channels/${message.guild.id}/${reviewChannel.id}/${msg.id}) om je review te bekijken!`)
    );

    message.author.settings.didReview = msg.id;
    message.author.updateDatabase();
	}
}