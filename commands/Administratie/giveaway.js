const ms = require("ms");

module.exports = class Giveaway extends require(`${process.cwd()}/util/command.js`) {
  constructor(client) {
    super(client, {
      name: "giveaway",
      description: "Start een giveaway!",
      dir: __dirname,
      alias: ["m"]
    });
  }
  async run(message) {
    let title = await this.getTitle(message);
    if (!title) return message.channel.send(message.embed().setDescription("Giveaway maken geannuleerd!").setThumbnail(""));

    let description = await this.getDescription(message);
    if (!description) return message.channel.send(message.embed().setDescription("Giveaway maken geannuleerd!").setThumbnail(""));

    let duration = await this.getDuration(message);
    if (!duration) return message.channel.send(message.embed().setDescription("Giveaway maken geannuleerd!").setThumbnail(""));

    let channel = await this.getChannel(message);
    if (!channel) return message.channel.send(message.embed().setDescription("Giveaway maken geannuleerd!").setThumbnail(""));

    let winners = await this.getWinners(message);
    if (!winners) return message.channel.send(message.embed().setDescription("Giveaway maken geannuleerd!").setThumbnail(""));

    let requiredRole = await this.getRequiredRole(message);
    if (!requiredRole) return message.channel.send(message.embed().setDescription("Giveaway maken geannuleerd!").setThumbnail(""));

    let rewardRole = await this.getRewardRole(message);
    if (!rewardRole) return message.channel.send(message.embed().setDescription("Giveaway maken geannuleerd!").setThumbnail(""));
    

    if (!await this.isSure(message, `Weet je zeker dat je een giveaway wilt maken met de volgende instellingen?
    Titel: **${title}**
    Beschrijving: **${description}**
    Tijd: **${ms(duration, {long: true})}**
    Kanaal: ${channel}
    Winnaars: **${winners}**
    Role verplicht: **${requiredRole}**
    Role beloning: **${rewardRole}**`)) return message.channel.send(message.embed().setDescription("Giveaway maken geannuleerd!"));

    let m = await message.channel.send(message.embed().setDescription("Laden...").setThumbnail(""));

    if (requiredRole === "geen") requiredRole = false;
    else requiredRole = requiredRole.id;
    if (rewardRole === "geen") rewardRole = false;
    else rewardRole = rewardRole.id;

    let msg = await channel.send(message.embed()
      .setTitle("Giveaway!")
      .setDescription("Laden...")
      .setColor("rgb(47, 49, 54)")
    );
    msg = await this.client.message(msg);
    msg.react("🎉");

    let giveaway = new this.client.giveawayObject({
      message: msg,
      title: title,
      description: description,
      until: Date.now()+duration,
      winners: winners,
      requirements: {
        role: requiredRole
      },
      rewards: {
        role: rewardRole
      },
      author: message.author.username
    });
    giveaway.updateDB(this.client.db);
    giveaway.update();
    this.client.giveaways[msg.id] = giveaway;

    let giveaways = await this.client.db.get("giveaways");
    if (!giveaways) giveaways = [];
    giveaways.push(msg.id);
    this.client.db.set("giveaways", giveaways);

    m.edit(message.embed()
      .setTitle("Giveaway")
      .setDescription(`Je giveaway is gemaakt en verstuurt in <#${channel.id}>!`)
    );
  }

  // Weet je het zeker?
	isSure(message, content) {
		return new Promise(async (res) => {
			let menu = new message.menu(await message.channel.send(message.embed().setDescription("Laden...")), {
				"✅": "ja",
				"❌": "nee"
			});
			menu.filter((_reaction, user) => user.id === message.author.id);
			menu.reactie((reactie) => {
				menu.stop();
        menu.clearEmojis();
        menu.message.delete();
				res(reactie.naam === "ja");
			});
			menu.create().then(() => {
				menu.message.edit(message.embed()
					.setTitle("Giveaway maken")
					.setDescription(content)
				);
			});
		});
	}

  async ask(message, title, description) {
    return new Promise(async (resolve) => {
      let m = await message.channel.send(message.embed()
        .setTitle(title)
        .setDescription(description)
        .setFooter("Stuur \"stop\" om te stoppen!")
      );
      let collector = message.channel.createMessageCollector(m => m.author.id == message.author.id)
      collector.on("collect", (msg) => {
        msg.delete();
        m.delete();
        collector.stop();
        resolve(msg.content);
      });
    });
  }

  async getTitle(message) {
    let title = await this.ask(message, "Nieuwe giveaway (1/7)", "Wat is de titel van de giveaway?");
    if (!title) {
      message.channel.send(message.embed()
        .setTitle("Oeps!")
        .setDescription(`De titel is niet geldig.`)
        .setFooter("Stuur \"stop\" om te stoppen!")
        .setThumbnail("")
      ).then(m => m.delete({timeout: 5000}));
      return await this.getTitle(message);
    }
    if (title.toLowerCase() === "stop") return false;
    return title;
  }

  async getDescription(message) {
    let description = await this.ask(message, "Nieuwe giveaway (2/7)", "Wat is de volledige beschrijving van de giveaway?");
    if (!description) {
      message.channel.send(message.embed()
        .setTitle("Oeps!")
        .setDescription(`De beschrijving is niet geldig.`)
        .setFooter("Stuur \"stop\" om te stoppen!")
        .setThumbnail("")
      ).then(m => m.delete({timeout: 5000}));
      return await this.getDescription(message);
    }
    if (description.toLowerCase() === "stop") return false;
    return description;
  }
  
  async getDuration(message) {
    let duration = await this.ask(message, "Nieuwe giveaway (3/7)", "Hoe lang moet de giveaway duen?\n> Gebruik **s** voor seconden, **m** voor minuten, **h** voor uren en **d** voor dagen.\n> Voorbeeld: `5d` = 5 dagen, `5d1h` = 5 dagen en 1 uur");
    if (duration.toLowerCase() === "stop") return false;
    if (!duration || !ms(duration)) {
      message.channel.send(message.embed()
        .setTitle("Oeps!")
        .setDescription(`De tijd is niet geldig.`)
        .setFooter("Stuur \"stop\" om te stoppen!")
        .setThumbnail("")
      ).then(m => m.delete({timeout: 5000}));
      return await this.getDuration(message);
    }
    return ms(duration);
  }

  async getChannel(message) {
    let channel = await this.ask(message, "Nieuwe giveaway (4/7)", "In welk kanaal moet de giveaway worden gehouden?");
    if (channel.toLowerCase() === "stop") return false;
    try {
      channel = message.guild.channels.cache.find(c => c.id === channel.split("<#")[1].split(">")[0]);
    } catch(e) {
      message.channel.send(message.embed()
        .setTitle("Oeps!")
        .setDescription(`Opgegeven kanaal is niet geldig.\n> Bijvoorbeeld: <#702658055099121714>`)
        .setFooter("Stuur \"stop\" om te stoppen!")
        .setThumbnail("")
      ).then(m => m.delete({timeout: 5000}));
      return await this.getChannel(message);
    }
    return channel;
  }
  
  async getWinners(message) {
    let winners = await this.ask(message, "Nieuwe giveaway (5/7)", "Hoeveel winnaars wil je?\n> Moet een geldig getal zijn!");
    if (winners.toLowerCase() === "stop") return false;
    winners = Number(winners);
    if (isNaN(winners) || parseInt(winners) != winners || winners < 1) {
      message.channel.send(message.embed()
        .setTitle("Oeps!")
        .setDescription(`Opgegeven getal is niet geldig. Geef een geldig geheel getal boven de 0 op.`)
        .setFooter("Stuur \"stop\" om te stoppen!")
        .setThumbnail("")
      ).then(m => m.delete({timeout: 5000}));
      return await this.getWinners(message);
    }
    return winners;
  }

  async getRequiredRole(message) {
    let role = await this.ask(message, "Nieuwe giveaway (6/7)", "Is er een role die de gebruiker moet hebben om mee te kunnen doen?\n> \"Nee\" = Geen role\n> Mention anders de role!");
    if (role.toLowerCase() === "stop") return false;
    if (role.toLowerCase() === "nee") return "geen";
    try {
      role = message.guild.cache.roles.find(r => r.id === role.split("<@&")[1].split(">")[0]);
    } catch(e) {
      message.channel.send(message.embed()
        .setTitle("Oeps!")
        .setDescription(`Opgegeven role is niet geldig! Probeer het opnieuw!`)
        .setFooter("Stuur \"stop\" om te stoppen!")
        .setThumbnail("")
      ).then(m => m.delete({timeout: 5000}));
      return await this.getRequiredRole(message);
    }
    return role;
  }

  async getRewardRole(message) {
    return "geen";
  }
}