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
    if (this.client.db.get(`ticket-${message.channel.id}`) == null) return message.error(`Dit is geen ticket!`);
    if (!message.member.isStaff()) return message.error("Alleen staff mogen tickets hernoemen!");
    await message.channel.setName(args.join(" "));
    message.channel.send(message.embed()
      .setTitle("Ticket hernoemt")
      .setDescription(`Dit ticket is hernoemd naar \`${args.join("-")}\``)
    );
  }
}