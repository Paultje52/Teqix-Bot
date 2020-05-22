// Dit is een message event die checkt of er een spel in een channel moet worden uitgevoerd
module.exports = exports = class spel {
  constructor(client, {
    name,
    test = () => {
      return true;
    },
    enabled = true
  }) {
    this.client = client;
    this.test = test;
    this.name = name;
    this.enabled = enabled;

    if (!client.spellen) client.spellen = {};
    client.spellen[name] = this;
  }
} 

exports.event = async (client, message) => {
  for (let i in client.spellen) {
    if (client.spellen[i].enabled && client.spellen[i].test(message, client)) {
      message.channel.settings = await client.db.get(`channel-${message.channel.id}`);
      message.channel.updateDatabase = () => {
        return client.db.set(`channel-${message.channel.id}`, message.channel.settings);
      }
      client.spellen[i].run(message, client);
    }
  }
}