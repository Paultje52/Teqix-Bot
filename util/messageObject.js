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
  // TIJDELIJK: ALLES MOET IN EMBEDS
  if (message.author.id === global.client.user.id) {
    if (message.embeds.length !== 0) return;
    message.channel.send(new discord.MessageEmbed()
      .setTitle("Stoute developer!")
      .setDescription(`Er is een hele stoute developer geweest, die heeft zijn/haar bericht niet in een embed gezet!\nDe developer krijgt geen cadeautje voor sinterklaas!`)
      .setFooter("Rapporteer dit probleem aub bij een developer.")
    );
  }

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