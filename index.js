const chalk = require("chalk");
console.log(chalk.blue("Bot opstarten..."));
const autoReload = require("./util/autoReload.js");

const discord = require("discord.js");
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
  console.log(chalk.greenBright("Database is ready!"));
});
client.db = db;
client.cache = new (require("./util/cacheManager.js"))();
client.messages = new (require("./util/MessageStorage.js"))(client);

// Ready event
client.on("ready", async () => {
  await db.isReady();

  // Spellen laden
  let spellen = await loader("/spellen", (file, path) => {
    new file(client);
    new autoReload(path).isClass().onChange((f) => {
      let spel = new f(client);
      console.log(chalk.cyan(`Spel ${spel.name} is herladen!`));
    });
  });

  // Commands laden
  let cmds = await loader("/commands", (file, path) => {
    let command = new file(client);
    commands.set(command.help.name, command);
    new autoReload(path).isClass().onChange((f) => {
      command = new f(client);
      commands.set(command.help.name, command);
      console.log(chalk.cyan(`Command ${command.help.name} is herladen!`));
    });
  });
  
  // Events laden
  let events = await loader("/events", (file, path) => {
    let event = new file(client);
    if (event.name === "msg") event.name = "TeqixMessage";
    if (event.name === "ready") event.run();
    else client.on(event.name, (...args) => {
      event.run(...args);
    });
    new autoReload(path).isClass().onChange((f, path) => {
      client.removeListener(event.name, event.run);

      event = new f(client);
      if (event.name === "msg") event.name = "TeqixMessage";
      if (event.name === "ready") {
        return console.log(chalk.keyword("orange")(`Om de verandering van ${path.split("events")[1]} actief te maken, zal de bot opnieuw moeten opstarten!`));
      }
      client.on(event.name, event.run);
      console.log(chalk.cyan(`Event ${path.split("events")[1]} is herladen!`));
    });
  });


  // Bot is online!
  console.log(chalk.black.bgGreen(`\n\n${chalk.bold(client.user.username)} is online!`), `\n\n[${chalk.bold("TEQIX STATS")}]\nServers: ${chalk.red(client.guilds.cache.size)}\nGebruikers: ${chalk.red(client.users.cache.size)}\nKanalen: ${chalk.red(client.channels.cache.size)}\nBot: ${chalk.red(cmds)} commands, ${chalk.red(spellen)} spellen en ${chalk.red(events)} events!`);
});

let msgHandler = require("./util/messageHandler.js");
setInterval(() => {
  delete require.cache[require.resolve("./util/messageHandler.js")];
  msgHandler = require("./util/messageHandler.js");
}, 60*1000);

client.on("message", (message) => {
  message.recievedDate = Date.now();
  msgHandler(message);
});

// Message reactions laten werken
client.on("raw", (packet) => {
  if (packet.t === "MESSAGE_UPDATE") {
    // Message update stuff
    client.messages._addEdit(packet.d);
  }
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
