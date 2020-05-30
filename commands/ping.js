module.exports = class Ping extends require(`${process.cwd()}/util/command.js`) {
	constructor(client) {
		super(client, {
			name: "ping",
			description: "Ping pong!",
			dir: __dirname,
			alias: ["p"]
		});
	}

	async run(message) {
		let cmdHandlerSpeed = Math.floor(Date.now()-message.recievedDate);
		// Start
		let start = Date.now();
		let msg = await message.channel.send(":ping_pong:");
		start = Date.now() - start;
		// Database ping
		let dbPing = Date.now();
		await this.client.db.set("tmp", 1);
		await this.client.db.get("tmp");
		await this.client.db.delete("tmp");
		dbPing = Date.now() - dbPing;
		// Bericht
		await msg.edit(`:ping_pong: ${Math.floor(start)}ms\n:blue_heart: ${Math.floor(this.client.ws.ping)}ms\n🗒️ ${Math.floor(dbPing/3*10)/10}ms\n🤔 ${cmdHandlerSpeed}ms`);
	}
}