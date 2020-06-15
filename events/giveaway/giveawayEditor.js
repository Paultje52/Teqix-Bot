module.exports = class GiveawayEditor {
  constructor(client) {
    this.client = client;
    this.name = "ready";
  }

  async run() {
    let giveaways = await this.client.db.get("giveaways");
    if (!giveaways) giveaways = [];
    giveaways.forEach(async (giveaway) => {
      giveaway = await this.client.db.get(`giveaway-${giveaway}`);
      if (!giveaway) return;
      let channel = this.client.channels.cache.find(c => c.id === giveaway.message.channel);
      if (!channel) return;
      giveaway.message = await channel.messages.fetch(giveaway.message.message);
      if (!giveaway.message) return;
      giveaway.message = await this.client.message(giveaway.message);
      this.client.giveaways[giveaway.message.id] = new this.client.giveawayObject(giveaway).updateDB(this.client.db);
    });

    setInterval(() => {
      for (let giveaway in this.client.giveaways) {
        this.client.giveaways[giveaway].update();
      }
    }, 10000);
  }
}