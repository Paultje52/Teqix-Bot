console.log("Bot opstarten!");
const autoReload = require("./util/autoReload.js");

const discord = require("discord.js");
const fsscanner = require("fsscanner");
const path = require("path");
let loader = require("./util/loader.js");
let config = new autoReload(__dirname, "config.json").onChange((c) => config = c).getFile();

// Client
const client = new discord.Client();
client.login(config.token);
client.config = config;
global.client = client;

// Commands
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
  await loader("/spellen", (file, path) => {
    new file(client);
    new autoReload(path).isClass().onChange((f) => {
      let spel = new f(client);
      console.log(`Spel ${spel.name} is herladen!`);
    });
  });

  // Commands laden
  await loader("/commands", (file, path) => {
    let command = new file(client);
    commands.set(command.help.name, command);
    new autoReload(path).isClass().onChange((f) => {
      command = new f(client);
      commands.set(command.help.name, command);
      console.log(`Command ${command.help.name} is herladen!`);
    });
  });
  
  // Events laden
  loader("/events", (file, path) => {
    let event = new file(client);
    if (event.name === "msg") event.name = "TeqixMessage";
    if (event.name === "ready") event.run();
    else client.on(event.name, event.run);
    new autoReload(path).isClass().onChange((f, path) => {
      client.removeListener(event.name, event.run);

      event = new f(client);
      if (event.name === "msg") event.name = "TeqixMessage";
      if (event.name === "ready") {
        return console.log(`Om de verandering van ${path.split("events")[1]} actief te maken, zal de bot opnieuw moeten opstarten!`);
      }
      client.on(event.name, event.run);
      console.log(`Event ${path.split("events")[1]} is herladen!`);
    });
  });
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
