const moment = require("moment");

module.exports = class RoleBot {
  constructor(client) {
    this.client = client;
    this.name = "raw";
    this.channelName = "rollen";
    this.emojis = [
      { emoji: "🎮", name: "Spellen Tag" },
      { emoji: "🎤", name: "Event Tag" },
      { emoji: "📰", name: "Nieuws Tag" },
      { emoji: "💻", name: "Developer Tag" },
      { emoji: "🎉", name: "Giveaway Tag" },
    ];
    this.guildName = "teqix community";
  }

  async run(event) {
    return;
    let client = this.client;

    if (event.t == "READY") {
      setTimeout(async () => {
        console.log(
          `[INFO] ${
          moment().format("HH:mm")
          } De rolebot is nu geladen en actief!`,
        );
        const client = this.client;
        const guild = client.guilds.find((g) =>
          g.name.toLowerCase().includes(this.guildName)
        );
        if (!guild) return;
        const channel = guild.channels.find((ch) =>
          ch.name.includes(this.channelName)
        );
        if (!channel || !guild) return;

        // GET message id
        let dbMessage = await this.client.db.get("rolebot-message");
        if (!dbMessage) {
          let string = "";
          this.emojis.forEach((emoji) => {
            string += `${emoji.emoji}: ${emoji.name}\n`;
          });
          dbMessage = await channel.send(
            "Reageer hierop om een role te krijgen:\n" + string,
          );
        } else {
          try {
            dbMessage = await channel.fetchMessage(dbMessage);
          } catch (error) {
            // Message bestaat niet meer, reloaden
            let string = "";
            this.emojis.forEach((emoji) => {
              string += `${emoji.emoji}: ${emoji.name}\n`;
            });
            dbMessage = await channel.send(
              "Reageer hierop om een role te krijgen:\n" + string,
            );
          }
        }
        // console.log(dbMessage)
        await this.client.db.set("rolebot-message", dbMessage.id);
        // Message is nu ingesteld
        // Reacten
        for (let i = 0; i < this.emojis.length; i++) {
          let emoji = this.emojis[i];
          // console.log(dbMessage.react)
          await dbMessage.react(emoji.emoji);
        }
      }, 1000);
    }

    const { d: data } = event;
    if (
      event.t !== "MESSAGE_REACTION_ADD" &&
      event.t !== "MESSAGE_REACTION_REMOVE"
    ) {
      return;
    }
    const guild = client.guilds.cache.find((g) =>
      g.name.toLowerCase().includes("teqix community")
    );
    if (!guild) return;
    const channel = guild.channels.cache.find((ch) =>
      ch.name.includes(this.channelName)
    );
    if (!channel || !guild) return;
    const msg = data.message_id;
    // GET message id
    let dbMessage = await this.client.db.get("rolebot-message");
    if (!dbMessage) return;
    const message = await channel.fetchMessage(dbMessage);
    if (msg != message.id) return;
    this.emojis.forEach((emoji) => {
      // console.log("Hier kom ik")
      const emojiKey = data.emoji.id === null
        ? data.emoji.name
        : `${data.emoji.name}:${data.emoji.id}`;
      const em = message.reactions.get(emojiKey).emoji;
      if (emoji === undefined) {
        console.log(`Could not retrieve emoji ${emojiKey}`);
        return;
      }

      if (emoji.emoji == em.toString()) {
        // emoji komt overeen, role getten:
        const role = guild.roles.find((r) =>
          r.name.toLowerCase().includes(emoji.name.toLowerCase())
        );
        if (!role) return;
        // Role is gevonden
        const user = client.users.get(event.d.user_id);
        const member = guild.members.get(user.id);
        if (event.t == "MESSAGE_REACTION_ADD") member.addRole(role);
        else member.removeRole(role);
      }
    });
  }
};
