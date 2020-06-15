module.exports = class Status {
  constructor(client) {
    this.client = client;
    this.name = "ready";
  }

  async run() {
    // Scrolling statussen
    let guild = this.client.guilds.cache.get("699987768318755138");
    if (!guild) guild = {roles: {cache: {find: () => {return {members: {size: 50}}}}}}
    let statusses = [
      { text: "Teqix Community", type: "WATCHING" },
      { text: "Minecraft", type: "PLAYING" },
      { text: `naar ${this.client.users.cache.size}`, type: "WATCHING" },
      { text: `naar ${guild.roles.cache.find(r => r.name.toLowerCase().includes("staff")).members.size}`, type: "LISTENING" },
      { text: `naar ${this.client.channels.cache.size}`, type: "WATCHING" },
      { text: `met ${client.commands.size} commands`, type: "PLAYING" },
    ];
    let i = setInterval(() => {
      let random = statusses[Math.floor(Math.random() * statusses.length)];
      this.client.user.setActivity(random.text, { type: random.type })
        .catch(error => {
          console.error(error);
          clearInterval(i);
          console.log(3);
        });
    }, 5e3);
  }
}