module.exports = class Help extends require(`${process.cwd()}/util/command.js`) {
  constructor(client) {
    super(client, {
      name: "giveaway",
      description: "Start een giveaway!",
      dir: __dirname,
      alias: ["m"]
    });
  }
  async run(message, args) {
    let title = await ask("Nieuwe giveaway - stap 1", "Wat gaan we winnen? (titel van de giveaway)")
    let description = await ask("Nieuwe giveaway - stap 2", "Wat is de volledige beschrijving van de giveaway?")
    let duration = await ask("Nieuwe giveaway - stap 3", "Hoe lang moet de giveaway duren?")
    let channel = await ask("Nieuwe giveaway - stap 4", "In welk kanaal moet de giveaway komen?")
    if (!channel.mentions.channels.first()) {
      message.channel.send(message.embed().setTitle("Dat is geen kanaal!").setDescription("Giveaway aanmaken gestopt."))
      return;
    }
    let winners = await ask("Nieuwe giveaway - stap 5", "Hoeveel winnaars zijn er?")
    if (!parseInt(winners)) {
      message.channel.send(message.embed().setTitle("Dat is geen getal!").setDescription("Giveaway aanmaken gestopt."))
      return;
    }

    

    async function ask(title, description) {
      return new Promise(async (resolve) => {
        await message.channel.send(message.embed()
          .setTitle(title)
          .setDescription(description));

        message.channel.createMessageCollector(m => m.author.id == message.author.id).on("collect", (msg) => {
          resolve(msg)
        })
      })
    }
  }
}

// Eisen(Rol hebben / niet hebben, x aantal berichten gestuurd, in Discord zitten) -> Met een menu
// Beloning(PM bericht(per winnaar / alle winnaars hetzelfde), Rol(In huidige discord of in andere discord), JavaScript eval) -> Met een menu