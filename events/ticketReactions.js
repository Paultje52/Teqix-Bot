const moment = require("moment");

module.exports = class TicketReactions {
  constructor(client) {
    this.client = client;
    this.name = "messageReactionAdd";
  }

  async run(reaction, user) {
    let ticketData = await this.client.db.get(`ticket-${reaction.message.channel.id}`);
    if (!ticketData) return;
    let message = await this.client.message(reaction.message);

    switch (message.id) {
      // First message, claim or close
      case ticketData.msg.first:
        reaction.users.remove(user);
        if (reaction.emoji.name === "📌") {
          // Claim ticket
          message.channel.createOverwrite(message.guild.roles.cache.find(r => r.name.toLowerCase().includes(this.client.config.roles.support.toLowerCase())).id, { VIEW_CHANNEL: false });
          message.channel.createOverwrite(user.id, { VIEW_CHANNEL: true });
          let msg = await message.channel.send(message.embed()
            .setTitle("Ticket Claim")
            .setDescription(`Dit ticket is geclaimt door ${user}!\nDruk op ❌ om terug te draaien!`)
          );
          msg.pin();
          await msg.react("❌");
          setTimeout(() => {
            ticketData.msg.claimed = msg.id;
            ticketData.claimed = user.id;
            this.client.db.set(`ticket-${message.channel.id}`, ticketData);
          }, 1000);
        } else if (reaction.emoji.name === "🔒") {
          message.channel.createOverwrite(message.guild.roles.cache.find(r => r.name.toLowerCase().includes(this.client.config.roles.support.toLowerCase())).id, { VIEW_CHANNEL: true, SEND_MESSAGES: false });
          message.channel.createOverwrite(user.id, { VIEW_CHANNEL: true, SEND_MESSAGES: false });
          let msg = await message.channel.send(message.embed()
            .setTitle("Ticket Gesloten")
            .setDescription(`Dit ticket is gesloten door ${user}!\n◀️ Maak ticket open\n📑 Sla ticket transscript op\n⛔ Verwijder kanaal`)
          );
          msg.pin();
          await msg.react("◀️");
          await msg.react("📑");
          await msg.react("⛔");
          setTimeout(() => {
            ticketData.msg.closed = msg.id;
            this.client.db.set(`ticket-${message.channel.id}`, ticketData);
          }, 1000);
        }
        break;

      // Claimed message
      case ticketData.msg.claimed:
        if (reaction.emoji.name !== "❌") return;
        message.delete();
        message.channel.createOverwrite(message.guild.roles.cache.find(r => r.name.toLowerCase().includes(this.client.config.roles.support.toLowerCase())).id, { VIEW_CHANNEL: true });
        message.channel.createOverwrite(user.id, { });
        message.channel.send(message.embed()
          .setTitle("Ticket Claim")
          .setDescription(`Ticket claim is teruggedraaid door ${user}!`)
        ).then(m => m.delete({timeout: 5000}));
        delete ticketData.msg.claimed;
        delete ticketData.claimed;
        this.client.db.set(`ticket-${message.channel.id}`, ticketData);
        break;

      // Closed ticket message
      case ticketData.msg.closed:
        reaction.users.remove(user);
        if (reaction.emoji.name === "◀️") { // Reopen ticket
          message.channel.createOverwrite(message.guild.roles.cache.find(r => r.name.toLowerCase().includes(this.client.config.roles.support.toLowerCase())).id, { VIEW_CHANNEL: true, SEND_MESSAGES: true });
          message.channel.createOverwrite(user.id, { VIEW_CHANNEL: true, SEND_MESSAGES: true });
          message.delete();
          delete ticketData.msg.closed;
          this.client.db.set(`ticket-${message.channel.id}`, ticketData);
          let msg = await message.channel.send(message.embed()
            .setTitle("Ticket Gesloten")
            .setDescription(`Dit ticket is heropend door ${user}!`)
          );
          msg.delete({timeout: 5000});
        } else if (reaction.emoji.name === "📑") { // Save transscript
          let msg = await message.channel.send(message.embed()
            .setTitle("Ticket Transscript")
            .setDescription(`${user}, ik maak het ticket transscript...`)
          );

          // Get the data
          let owner = this.client.users.cache.get(ticketData.owner);
          if (owner) owner = owner.username;
          else owner = "???";
          let claimed = "Niet geclaimed";
          if (ticketData.claimed) claimed = this.client.users.cache.get(ticketData.owner);
          if (claimed) claimed = claimed.username;
          else claimed = "???";
          let data = await this.client.messages.getChannel(message.channel.id).getMessages();

// Make the base output
let output = `
+====================+
| Ticket transscript |
+====================+
| © Teqix Community  |
\n
Ticket gemaakt op: ${moment(ticketData.created).format("YYYY-MM-DD [om] HH:mm")}
Ticket gemaakt door: ${owner}
Onderwerp: ${ticketData.subject}
Geclaimt: ${claimed}
\n
+===========+
| Berichten |
+===========+
`;
          // Set the messages in the output
          let lastAuthor = "";
          data = data.array();
          for (let msg of data) {
            if (!msg.author) msg = await message.channel.messages.fetch(msg.id);
            if (msg.author.id === lastAuthor) output += `> ${msg.content}\n`;
            else output += `\n={${msg.author.username}}=\n> ${msg.content}\n`;
            lastAuthor = msg.author.id;
          }

          // Send the output
          this.client.cache.set(`transscript-${message.channel.id}.txt`, output);
          try {
            await user.send(message.embed()
              .setTitle("Ticket transscript")
              .setDescription(`Hier is het ticket transscript van **${message.channel.name}**!`)
            );
            user.send({
              files: [{
                attachment: this.client.cache._getPath(`transscript-${message.channel.id}.txt`),
                name: `Ticket transscript: ${message.channel.name}.txt`
              }]
            });
            msg = await msg.edit(message.embed()
              .setTitle("Ticket Transscript")
              .setDescription(`${user}, ik stuur het transscript in je PM!`)
            );
            msg.delete({timeout: 5000});
          } catch(e) {
            msg.edit(message.embed()
              .setTitle("Ticket Transscript")
              .setDescription(`${user}, je PM's zijn dicht, dus ik stuur de transscript hier!`)
            );
            message.channel.send({
              files: [{
                attachment: this.client.cache._getPath(`transscript-${message.channel.id}.txt`),
                name: `Ticket transscript: ${message.channel.name}.txt`
              }]
            });
          }
        } else if (reaction.emoji.name === "⛔") {
          let menu = new message.menu(await message.channel.send(message.embed().setDescription("Laden...")), {
            "✅": "ja",
            "❌": "nee"
          });
          menu.filter((_reaction, usr) => usr.id === user.id);
          await menu.create();
          menu.reactie((reactie) => {
            menu.stop();
            menu.clearEmojis();
            if (reactie.naam === "nee") return menu.message.delete();
            menu.message.edit(message.embed()
              .setTitle("Kanaal verwijderen")
              .setDescription("Ik verwijder dit kanaal in 5 seconden!")
              .setColor("#ff0000")
            );
            setTimeout(() => {
              message.channel.delete();
            }, 5000);
          });
          menu.message.edit(message.embed()
            .setTitle("⚠️ Kanaal verwijderen ⚠️")
            .setDescription("Weet je zeker dat je dit kanaal wilt verwijderen?")
            .setColor("#ff0000")
          );
        }
        break;

      default:
        break;
    }
  }
}