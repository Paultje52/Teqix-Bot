module.exports = class tellen extends require(`${process.cwd()}/util/spel.js`) {
  constructor(client) {
    super(client, {
      name: "tellen",
      test: (message) => {
        return message.channel.name.toLowerCase().includes("tellen");
      },
      enabled: false
    });
  }

  run(message) {
    // Tellen check
    if (!message.channel.settings) message.channel.settings = {
      at: 1,
      lastUser: ""
    };
    if (message.author.id === message.channel.settings.lastUser
      || message.content.toLowerCase() != message.channel.settings.at) return message.delete();

    // Channel settings updaten
    message.channel.settings = {
      at: message.channel.settings.at+1,
      lastUser: message.author.id
    };
    message.channel.updateDatabase();

    // Author settings updaten
    message.author.settings.eventPunten += .1;
    message.author.updateDatabase();
  }
}