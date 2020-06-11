module.exports = (message, client) => {
  return async (msg, showReport = true) => {
    if (!msg.includes("`")) msg = `\`\`\`${msg}\`\`\``;
    if (!showReport) {
      return message.channel.send(message.embed()
        .setTitle("Oeps!")
        .setColor("#ff0000")
        .setDescription(`Er ging iets niet helemaal goed.\n${msg}\nDit lijkt op een fout in de code van de bot, de fout is automatisch gerapporteerd. Sorry voor het ongemak.`)
      );
    }
    let menu = new message.menu(
      await message.channel.send(message.embed()
        .setTitle("Oeps!")
        .setColor("#ff0000")
        .setDescription(`Er ging iets niet helemaal goed.\n${msg}\nIs dit een fout in de bot? Reageer dan met :warning:!`)
      ), {
      "⚠️": "warning",
      "❌": "stopMenu"
    }
    );
    menu.filter((_reaction, user) => user.id === message.author.id);
    let edited = false;
    menu.reactie((r) => {
      if (r.naam === "warning") edited = true;
      menu.stop();
      if (r.naam === "stopMenu") return;
      let errorLogs = client.channels.cache.find(c => c.name.includes("boterror-logs"));
      errorLogs.send(message.embed()
        .setTitle(`Error report (Man.${message.author.username})`)
        .setDescription(`\`\`\`${msg}\`\`\``)
        .addField("**__Informatie__**", `**Message**\n\`\`\`${message.content}\`\`\`\n**Timestamp:** \`${Date.now()}\`\n**Channel:** ${message.channel}\n**Author:** ${message.author}\n**Link** [Klik hier](https://discordapp.com/channels/${menu.message.guild.id}/${menu.message.channel.id}/${menu.message.id})`)
      );
      menu.message.edit(message.embed()
        .setTitle("Oeps!")
        .setColor("#ff0000")
        .setDescription(`Er ging iets niet helemaal goed.\`\`\`${msg}\`\`\`De fout is gerapporteerd, sorry voor het ongemak!`)
      );
    });
    menu.time(1000 * 10);
    menu.create();
    menu.einde(() => {
      menu.clearEmojis();
      if (!edited) menu.message.edit(message.embed()
        .setTitle("Oeps!")
        .setColor("#ff0000")
        .setDescription(`Er ging iets niet helemaal goed.\`\`\`${msg}\`\`\``)
      );
    });
  }
}