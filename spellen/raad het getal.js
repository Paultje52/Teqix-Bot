module.exports = class RaadHetGetal extends require(`${process.cwd()}/util/spel.js`) {
  constructor(client) {
    super(client, {
      name: "raad het getal",
      test: (message) => {
        return message.channel.name.toLowerCase().includes("raad-het-getal");
      }
    });
  }

  async run(message) {
    if (!message.channel.settings) message.channel.settings = {
      number: null,
      lastUser: "",
      guesses: 0,
      msg: undefined
    };
    if (message.author.id === message.channel.settings.lastUser) return message.delete();
    if (number === null) {
      let msg = await message.channel.send(message.embed()
        .setTitle("Raad het getal")
        .setDescription("Ik heb een nieuw nummer in mijn hoofd, veel succes met raden!")
      );
      message.channel.settings.msg = msg.id;
      message.channel.settings.number = Math.floor(Math.random() * 10000);
      return message.channel.updateDatabase();
    }

    if (message.content.toLowerCase() == message.channel.settings.number) {
      message.channel.fetchMessage(message.channel.settings.id).then(msg => {
        msg.edit(message.embed()
          .setTitle("Raad het getal")
          .setDescription(`Het getal is geraden door ${message.author}. Het was ${message.content.toLowerCase()}!`)
        );
      });


      
      // message.channel.settings = {
      //   at: message.channel.settings.at+1,
      //   lastUser: message.author.id
      // };
      // message.channel.updateDatabase();
    }
  }
}