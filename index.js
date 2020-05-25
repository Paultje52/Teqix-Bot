console.log("Bot opstarten!");
const fsscanner = require("fsscanner")
const discord = require("discord.js");
const path = require("path")
const config = require("./config.json");

// Commands
const client = new discord.Client();
client.login(config.token);
const commands = new discord.Collection();
client.commands = commands;
client.prefix = config.prefix;
client.config = config;


// Database
let db = new (require("./database.js"))({
  development: true
});
db.isReady().then(() => {
  console.log("Database is ready!");
});
client.db = db;
client.cache = new (require("./util/cacheManager.js"))();

// Ready event
client.on("ready", async () => {
  await db.isReady();
  // Spellen laden
  fsscanner.scan(path.join(__dirname, "/spellen"), [fsscanner.criteria.pattern(".js"), fsscanner.criteria.type("F")], (err, files) => {
    // Load alle files, en delete require cache
    if (err) throw err;
    for (let i = 0; i < files.length; i++) {
      new (require(files[i]))(client);
      delete require.cache[require.resolve(files[i])];
    }
    console.log(`${files.length} spellen succesvol geladen.`);
  });

  // Load commands, ZONDER require cache
  fsscanner.scan(path.join(__dirname, "/commands"), [fsscanner.criteria.pattern(".js"), fsscanner.criteria.type("F")], (err, files) => {
    // Load alle files, en delete require cache
    if (err) throw err;
    for (let i = 0; i < files.length; i++) {
      const command = new (require(files[i]))(client);
      commands.set(command.help.name, command);
      delete require.cache[require.resolve(files[i])];
    }
    console.log(`${client.user.username} is nu online, ${files.length} commands succesvol geladen.`);
  });
  
  // Load event, ZONDER require cache
  fsscanner.scan(path.join(__dirname, "/events"), [fsscanner.criteria.pattern(".js"), fsscanner.criteria.type("F")], (err, files) => {
    // Load alle files, en delete require cache
    if (err) throw err;
    for (let i = 0; i < files.length; i++) {
      const event = new (require(files[i]))(client);
      if (event.name === "message") event.name = "cnMessage";
      client.on(event.name, event.run);
    }
  });
});

client.on("message", async (message) => {
  // Handle alle commands
  if (message.author.bot) return;

  // Custom embed
  message.embed = () => {
    return new discord.MessageEmbed()
      .setColor("#2f3136")
      .setTimestamp()
      .setFooter("© Teqix Community");
      // .setAuthor(message.author.username, message.author.displayAvatarURL(), "https://teqixcommunity.nl/");
  };
  // Menu functie
  message.menu = require("./util/menu.js");
  // Error report functie
  message.error = require("./util/messageError.js")(message, client);
  // Database gedoe voor de author
  if (!message.author.settings) {
    message.author.settings = await db.get(`author-${message.author.id}`);
    if (!message.author.settings) message.author.settings = config.authorSettings;
  }
  message.author.updateDatabase = () => {
    return client.db.set(`author-${message.author.id}`, message.author.settings);
  }

  // Member addons
  message.member = require("./util/memberAddons.js")(message);
  message.getMember = (string) => {
    return message.mentions.members.first() 
      || message.guild.cache.members.get(string) 
      || message.guild.cache.members.find(m => m.user.username.toLowerCase().includes(string));
  }

  // CNMessage functie
  client.emit("cnMessage", message);

  // Spellen handler
  if (message.channel.parent && message.channel.parent.name.toLowerCase().includes("entertainment")) {
    // Dit is mogelijk een spel, dus gaan we de spellen constructor callen
    require("./util/spel.js").event(client, message);
    delete require.cache[require.resolve("./util/spel.js")];
  }


  // Command handler
  if (!message.content.startsWith(config.prefix)) return;
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  let cmd = commands.get(command) == null ? commands.find(c => c.help.alias.includes(command)) : commands.get(command);
  if (!cmd) return;
  if (!await cmd.security.test(message, client, args)) return message.error(`Je mag het commando ${cmd.help.name} niet gebruiken!`);
  if (cmd.security.minRole) {
    let hasPosition = await eval(`message.member.staffTests().is${cmd.security.minRole}()`);
    if (!hasPosition) return message.error(`Je mag het commando ${cmd.help.name} niet gebruiken, je moet hiervoor ${cmd.security.minRole} permissies hebben!`);
  }
  let missing = [];
  cmd.security.permissions.bot.forEach(perm => {
    if (!message.guild.member(client.user.id).permissions.has(perm)) missing.push(perm);
  });
  if (missing.length > 0) return message.error(`Ik mis de volgende permissies om het commando ${cmd.help.name} uit te voeren:\n- ${missing.join("\n- ")}`);
  missing = [];
  cmd.security.permissions.user.forEach(perm => {
    if (!message.member.permissions.has(perm)) missing.push(perm);
  });
  if (missing.length > 0) return message.error(`Jij moet de volgende permissies hebben om het commando ${cmd.help.name} te gebruiken:\n- ${missing.join("\n- ")}`);

  // Command uitvoeren
  cmd.run(message, args, client).catch(e => {
    console.log(e);
    // Automatische error report
    message.error(e, false);
    let errorLogs = client.channels.cache.find(c => c.name.includes("boterror-logs"));
    errorLogs.send(message.embed()
      .setTitle(`Error report (Auto.${cmd.help.name})`)
      .setDescription(`\`\`\`${e}\`\`\``)
      .addField("**__Informatie__**", `**Message**\n\`\`\`${message.content}\`\`\`\n**Timestamp:** \`${Date.now()}\`\n**Channel:** ${message.channel}\n**Author:** ${message.author}\n**Link** [Klik hier](https://discordapp.com/channels/${message.guild.id}/${message.channel.id}/${message.id})`)
    );
  });
});

// Message reactions laten werken
client.on("raw", packet => {
  if (!["MESSAGE_REACTION_ADD", "MESSAGE_REACTION_REMOVE"].includes(packet.t)) return;
  const channel = client.channels.cache.get(packet.d.channel_id);
  if (channel.messages.cache.has(packet.d.message_id)) return;
  channel.messages.fetch(packet.d.message_id).then(message => {
    const emoji = packet.d.emoji.id ? packet.d.emoji.id : packet.d.emoji.name;
    const reaction = message.reactions.cache.get(emoji);
    if (reaction) reaction.users.cache.set(packet.d.user_id, client.users.cache.get(packet.d.user_id));
    if (packet.t === "MESSAGE_REACTION_ADD") client.emit("messageReactionAdd", reaction, client.users.cache.get(packet.d.user_id));
    if (packet.t === "MESSAGE_REACTION_REMOVE") client.emit("messageReactionRemove", reaction, client.users.cache.get(packet.d.user_id));
  });
});