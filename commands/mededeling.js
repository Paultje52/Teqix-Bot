module.exports = class Mededeling extends require(`${process.cwd()}/util/command.js`) {
	constructor(client) {
		super(client, {
			name: "mededeling",
			description: "Stuur een mededeling naar de mededeling kanaal.",
			dir: __dirname,
			alias: ["md"]
		}, {}, {
      cmdArgs: [{
        name: "Mededeling",
        test: (_message, arg) => !!arg
      }],
      examples: [
        "<cmd> Een nieuwe botupdate!"
      ]
    });
	}

	async run(message, args) {
    
    if (!message.member.hasPermission("MANAGE_ROLES")) return message.channel.send(message.embed().setDescription("Je hebt hier geen permissions voor."));
    
    let md = args[0];
    if (!md) return message.channel.send(message.embed().setDescription("Geef een mededeling op."));


    let mdChannel = message.guild.channels.cache.find(c => c.name.toLowerCase().includes("mededelingen"));
    if (!mdChannel) return message.channel.send(message.embed().setDescription("Er is geen mededelingen channel gevonden."))

    //message.channel.send(message.embed().setDescription("Controleer of er nog fouten in het bericht zitten.\nKlik op ❌ als er een fout is die je moet aanpassen.\nKopieer je bericht en stuur opnieuw met de verbeteringen.\nAnders klik je op ✅."));
    
    let menu = new message.menu(await message.channel.send(message.embed().setDescription("Laden...")), {

      "✅": "ja",
      "❌": "nee"

    });
    
    menu.filter((_reaction, user) => user.id === message.author.id);
    menu.reactie((reactie) => {
      menu.stop();
      menu.clearEmojis();
      if (reactie.naam === "ja") return mdChannel.send(message.embed()
        .setTitle("Nieuwe mededeling")
        .addField(`**Mededeling van:**`, message.author)
        .addField("**Mededeling:**\n", md)
      ) && menu.message.edit(message.embed().setDescription("Je mededeling is verzonden!"));

      else if (reactie.naam === "nee") return menu.message.edit(message.embed().setDescription("Mededeling niet verzonden."));

    });
    menu.create().then(() => {
      menu.message.edit((message.embed().setDescription("Controleer of er nog fouten in het bericht zitten.\nKlik op ❌ als er een fout is die je moet aanpassen.\nKopieer je bericht en stuur opnieuw met de verbeteringen.\nAnders klik je op ✅.")));
    });
      //await message.mdChannel.send(message.embed().setTitle("Nieuwe mededeling").addField(`Mededeling van: ${message.author}`).addField(`Mededeling:\n${md}`));

    return;

  }
}