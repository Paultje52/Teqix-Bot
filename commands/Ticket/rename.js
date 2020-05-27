module.exports = class Ticket_Rename extends require(`${process.cwd()}/util/command.js`) {
	constructor(client) {
		super(client, {
			name: "hernoem",
			description: "Hernoem een ticket!",
			dir: __dirname,
			alias: ["rename"]
		}, {}, {
      cmdArgs: [{
        name: "Ticket naam",
        test: (_message, arg) => !!arg
      }],
      examples: [
        "<cmd> sollicitatie",
        "<cmd> partner"
      ]
    });
  }
  
  async run(message, args) {
    if (this.client.db.get(`ticket-${message.channel.id}`) == null) return message.channel.send(`:negative_squared_cross_mark: Dit is geen ticket!`);
    if (!message.member.isStaff()) return message.channel.send(":negative_squared_cross_mark: Je hebt geen permissies om een ticket te renamen!");
    if (args.length == 0) return message.channel.send(":negative_squared_cross_mark: Geef een naam op die het ticket moet krijgen!");
    message.channel.setName(args.join(" ")).then(async () => {
      let newName = (await message.channel.fetch()).name;
      message.channel.send(`:white_check_mark: ${newName} is de nieuwe naam van dit kanaal!`);
    });
  }
}