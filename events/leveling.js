module.exports = class Leveling {
  constructor(client) {
		this.client = client;
		this.name = "message";
  }
  
  async run(message) {
    // if (message.author.id !== "327462385361092621") return; // Voor testen
    message.author.settings.leveling.xp += Math.floor(Math.random()*10)+5; // Tussen 5 en 15
    let newLevel = Math.floor(0.2 * Math.sqrt(message.author.settings.leveling.xp));
    if (newLevel !== message.author.settings.leveling.level) {
      message.author.settings.leveling.level = newLevel;
      message.channel.send(message.embed()
        .setTitle("Levelup!")
        .setDescription(`:tada: Gefeliciteerd ${message.author}, je bent nu level **${newLevel}**! :tada:`)
      );
    }
    message.author.updateDatabase();
	}
}