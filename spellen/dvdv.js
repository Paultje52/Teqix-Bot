module.exports = class tellen extends require(`${process.cwd()}/util/spel.js`) {
  constructor(client) {
    super(client, {
      name: "De vraag der vragen",
      test: (message) => {
        return message.channel.name.toLowerCase().includes("dvdv");
      }
    });
  }
  async run(message) {
    let date = Date.now()
    if (!message.author.settings.dvdvCooldown) message.author.settings.dvdvCooldown = date;
    let cooldown = message.author.settings.dvdvCooldown + 3600000;
    if (cooldown > date) return;
    message.author.settings.spelpunten++;
    message.author.settings.dvdvCooldown = date;
    message.author.updateDatabase()
  }
}