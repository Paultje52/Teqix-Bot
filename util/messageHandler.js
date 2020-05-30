const discord = require("discord.js");

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

module.exports = async (message) => {
  // Handle alle commands
  if (message.author.bot) return;


  // Custom embed
  message.embed = () => {
    return new discord.MessageEmbed()
      .setColor("#0062ff") // #2f3136
      .setTimestamp()
      .setFooter("© Teqix Community")
      .setThumbnail("https://images-ext-2.discordapp.net/external/vHksXugqFF9PV7jEK2K-gGOsutF9OTTzvBBXk4kRDBM/%3Fsize%3D2048/https/cdn.discordapp.com/avatars/701449659423653905/8799003b26cb621e1dad18982b490e9b.png");
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


  // Command handler
  setTimeout(async () => { // Op andere thread runnen
    if (!message.content.startsWith(global.client.config.prefix)) return;
    const args = message.content.slice(global.client.config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
  
    let cmd = global.client.commands.get(command) == null ? global.client.commands.find(c => c.help.alias.includes(command)) : global.client.commands.get(command);
    if (!cmd) return;
    if (!await cmd.security.test(message, global.client, args)) return message.error(`Je mag het commando ${cmd.help.name} niet gebruiken!`);
    if (cmd.security.minRole) {
      let hasPosition = await eval(`message.member.staffTests().is${cmd.security.minRole}()`);
      if (!hasPosition) return message.error(`Je mag het commando ${cmd.help.name} niet gebruiken, je moet hiervoor ${cmd.security.minRole} permissies hebben!`);
    }
    let missing = [];
    cmd.security.permissions.bot.forEach(perm => {
      if (!message.guild.member(global.client.user.id).permissions.has(perm)) missing.push(perm);
    });
    if (missing.length > 0) return message.error(`Ik mis de volgende permissies om het commando ${cmd.help.name} uit te voeren:\n- ${missing.join("\n- ")}`);
    missing = [];
    cmd.security.permissions.user.forEach(perm => {
      if (!message.member.permissions.has(perm)) missing.push(perm);
    });
    if (missing.length > 0) return message.error(`Jij moet de volgende permissies hebben om het commando ${cmd.help.name} te gebruiken:\n- ${missing.join("\n- ")}`);
  
    // Command args checken
    if (!(await cmd.argsTester(message, args, client))) return;

    // Command uitvoeren
    cmd.run(message, args, global.client).catch(e => {
      console.log(e);
      // Automatische error report
      message.error(e, false);
      let errorLogs = global.client.channels.cache.find(c => c.name.includes("boterror-logs"));
      errorLogs.send(message.embed()
        .setTitle(`Error report (Auto.${cmd.help.name})`)
        .setDescription(`\`\`\`${e}\`\`\``)
        .addField("**__Informatie__**", `**Message**\n\`\`\`${message.content}\`\`\`\n**Timestamp:** \`${Date.now()}\`\n**Channel:** ${message.channel}\n**Author:** ${message.author}\n**Link** [Klik hier](https://discordapp.com/channels/${message.guild.id}/${message.channel.id}/${message.id})`)
      );
    });
  });


  // Teqix Message functie
  setTimeout(() => {
    global.client.emit("TeqixMessage", message);
  }, 2);


  // Add to message storage
  setTimeout(() => {
    global.client.messages._addMessage(message);
  }, 1000);

  // Spellen handler
  setTimeout(() => { // Op andere thread runnen
    if (message.channel.parent && message.channel.parent.name.toLowerCase().includes("developer")) { // TODO: "developer" moet "gameroom" worden!
      // Dit is mogelijk een spel, dus gaan we de spellen constructor callen
      require("./spel.js").event(global.client, message);
      delete require.cache[require.resolve("./spel.js")];
    }
  }, 5);
}