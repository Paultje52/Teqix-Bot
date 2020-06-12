const loader = require("../util/loader.js");
const discord = require("discord.js");
const autoReload = require("../util/autoReload.js");

module.exports = {
  priority: 2,
  function: async (client) => {
    const commands = new discord.Collection();
    client.commands = commands;

    await client.db.isReady();

    // Commands laden
    client.cmds = await loader("/commands", (file, path) => {
      let command = new file(client);
      commands.set(command.help.name, command);
      new autoReload(path).isClass().onChange((f) => {
        command = new f(client);
        commands.set(command.help.name, command);
        console.log(chalk.cyan(`Command ${command.help.name} is herladen!`));
      });
    });
    
    // Events laden
    client.events = await loader("/events", (file, path) => {
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
  }
}