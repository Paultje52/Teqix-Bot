module.exports = class TestMenu extends require(`${process.cwd()}/util/command.js`) {
	constructor(client) {
		super(client, {
			name: "testmenu",
			description: "Een testmenu, als voorbeeld!",
			dir: __dirname
		});
	}

	async run(message) {
    let menu = new message.menu(await message.channel.send("Laden..."), {
      "👍": "+",
      "👎": "-"
    });
    menu.filter((_reaction, user) => user.id === message.author.id);
    menu.reactie((reactie) => {
      menu.stop();
      menu.clearEmojis();
      if (reactie.naam === "+") menu.message.edit("Je stemt voor!");
      else menu.message.edit("Je stemt tegen!");
    });
    menu.einde((reacties) => {
      console.log(reacties);
    });
    menu.create().then(() => {
      menu.message.edit("Stem je voor of tegen?");
    });
	}
}