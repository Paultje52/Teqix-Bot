module.exports = class Status {
  constructor(client) {
    this.client = client;
    this.name = "ready";
  }

  async run() {
    // Scrolling statussen
    let statusses = [{ text: "Teqix Community", type: "WATCHING" }]
    let i = setInterval(() => {
      let random = statusses[Math.floor(Math.random() * statusses.length)];
      this.client.user.setActivity(random.text, { type: random.type })
        .catch(error => {
          console.error(error);
          clearInterval(i);
          console.log(3);
        });
    }, 10e3);
  }
}