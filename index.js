console.log("Bot opstarten!");
const fsscanner = require("fsscanner")
const discord = require("discord.js");
const path = require("path")
const config = require("./config.json");

// Commands
const client = new discord.Client();
client.login(config.token);
client.config = config;
global.client = client;
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
});

// Load event, ZONDER require cache
fsscanner.scan(path.join(__dirname, "/events"), [fsscanner.criteria.pattern(".js"), fsscanner.criteria.type("F")], (err, files) => {
  // Load alle files, en delete require cache
  if (err) throw err;
  for (let i = 0; i < files.length; i++) {
    const event = new (require(files[i]))(client);
    if (event.name === "message") event.name = "cnMessage";
    client.on(event.help.name, (...args) => {
      event.run(client, ...args)
    });
  }
});

client.on("message", async (message) => {
  require("./util/messageHandler.js")(message);
  delete require.cache[require.resolve("./util/messageHandler.js")];
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
