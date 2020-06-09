let functions = {
  menu: require("./menu.js"),
  error: require("./messageError.js"),
  memberAddons: require("./memberAddons.js")
}

setInterval(() => {
  delete require.cache[require.resolve("./menu.js")];
  delete require.cache[require.resolve("./messageError.js")];
  delete require.cache[require.resolve("./memberAddons.js")];
  functions = {
    menu: require("./menu.js"),
    error: require("./messageError.js"),
    memberAddons: require("./memberAddons.js")
  }
}, 60*1000);

module.exports = async function Message(message) {
  // // TIJDELIJK: ALLES MOET IN EMBEDS
  // if (message.author.id === global.client.user.id) {
  //   if (message.embeds.length !== 0) return;
  //   message.channel.send(new discord.MessageEmbed()
  //     .setTitle("Stoute developer!")
  //     .setDescription(`Er is een hele stoute developer geweest, die heeft zijn/haar bericht niet in een embed gezet!\nDe developer krijgt geen cadeautje voor sinterklaas!`)
  //     .setFooter("Rapporteer dit probleem aub bij een developer.")
  //   );
  // }

  // Custom embed
  message.embed = (showThumbnail = true) => {
    let embed = new discord.MessageEmbed()
      .setColor("#0062ff") // #2f3136
      .setTimestamp()
      .setFooter("© Teqix Community");
    if (showThumbnail) embed.setThumbnail("https://images-ext-2.discordapp.net/external/vHksXugqFF9PV7jEK2K-gGOsutF9OTTzvBBXk4kRDBM/%3Fsize%3D2048/https/cdn.discordapp.com/avatars/701449659423653905/8799003b26cb621e1dad18982b490e9b.png");
    return embed;
      // .setAuthor(message.author.username, message.author.displayAvatarURL(), "https://teqixcommunity.nl/");
  };
  
  // Menu functie
  message.menu = functions.menu;
  // Error report functie
  message.error = functions.error(message, global.client);
  // Database gedoe voor de author
  if (!message.author.settings) {
    message.author.settings = await global.client.db.get(`author-${message.author.id}`);
    if (!message.author.settings) message.author.settings = global.client.config.authorSettings;
  }
  message.author.updateDatabase = () => {
    return global.client.db.set(`author-${message.author.id}`, message.author.settings);
  }

  // Member addons
  message.member = functions.memberAddons(message);
  message.getMember = (string) => {
    return message.mentions.members.first()
      || message.guild.cache.members.get(string)
      || message.guild.cache.members.find(m => m.user.username.toLowerCase().includes(string));
  }

  return message;
}