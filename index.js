const chalk = require("chalk");
console.log(chalk.blue("Bot opstarten..."));

const discord = require("discord.js");
const loader = require("./util/loader.js");

// Client
const client = new discord.Client();
global.client = client;

let clientExtenders = [];
loader("/clientExtenders", (file) => {
  // Priority = 0 > Load now!
  // Priority = 1 > Load before others
  // Priority = 2 > Load after
  if (file.priority === 0) file.function(client);
  else if (file.priority === 1) clientExtenders = [file.function, ...clientExtenders];
  else clientExtenders.push(file.function);
});

// Ready event
client.on("ready", async () => {
  // Client extenders laden
  for (let extender of clientExtenders) {
    await extender(client);
  }

  // Bot is online!
  console.log(chalk.black.bgGreen(`\n\n${chalk.bold(client.user.username)} is online!`), `\n\n[${chalk.bold("TEQIX STATS")}]\nServers: ${chalk.red(client.guilds.cache.size)}\nGebruikers: ${chalk.red(client.users.cache.size)}\nKanalen: ${chalk.red(client.channels.cache.size)}\nBot: ${chalk.red(client.cmds)} commands en ${chalk.red(client.events)} events!`);
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
