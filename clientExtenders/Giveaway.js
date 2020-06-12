module.exports = {
  priority: 2,
  function: (client) => {
    class Giveaway {
      constructor({
        message, // MESSAGE OBJECT
        title, // TITEL
        description, // BESCHRIJVING
        until, // TOTDAT TIMESTAMP
        winners, // AANTAL WINNAARS
        requirements = {
          role: false // Requirements, role name
        },
        rewards = {
          role: false
        },
        author, // Username of the giveaway creator
        participants = [] // The ID's of the participants
      }) {
        this.message = message;
        this.settings = {
          title: title,
          description: description,
          until: until,
          winners: winners,
          requirements: requirements,
          rewards: rewards,
          author: author
        };
        this.participants = participants;
      }

      updateDB(db) {
        db.set(`giveaway-${this.message.id}`, {...this.settings,  participants: this.participants, message: {channel: this.message.channel.id, message: this.message.id}});
        this.db = db;
        return this;
      }

      getWinners(existing = []) {
        let winner = this.participants[Math.floor(Math.random()*this.participants.length)];
        existing.push(winner);
        this.participants.removeByValue(winner);
        if (existing.length < this.settings.winners) return this.getWinners(existing);
        else return existing;
      }
    
      async update() {
        let winnersVervoeging = "winnaars";
        if (this.settings.winners === 1) winnersVervoeging = "winnaar";
        
        let requirement = "";
        if (this.settings.requirements.role) requirements = `\n> Je moet role **<@&${this.settings.requirements.role}>** hebben!`;    
        let chance = this.participants == 0 ? 100 : Math.floor(this.settings.winners/this.participants.length*100*100)/100;

        if (Date.now() > this.settings.until) {
          if (this.done || await this.db.get(`giveaway-${this.message.id}-done`)) return;
          let winners = await this.getWinners();
          try {
            this.db.set(`giveaway-${this.message.id}-done`, true);
            this.done = true;
            let giveaways = await this.client.db.get("giveaways");
            if (!giveaways) giveaways = [];
            giveaways.removeByValue(this.message.id);
            await this.client.db.set("giveaways", giveaways);
          } catch(e) {}
          this.message.channel.send(this.message.embed()
            .setTitle(`🎉 ${this.settings.title} 🎉`)
            .setThumbnail("")
            .setDescription(`De giveaway is afgelopen.\n${toProperCase(winnersVervoeging)}: **<@${winners.join("> <@")}>**`)
          );
          this.message.edit(this.message.embed()
            .setTitle(`🎉 ${this.settings.title} 🎉`)
            .setThumbnail("https://images-ext-2.discordapp.net/external/bKIEW8t7SwsSXk8Kco-2SSaENV6WVWZ8lyOwj_g1ovM/https/images.emojiterra.com/mozilla/512px/1f389.png")
            .setDescription(`${this.settings.description}\n\n**AFGELOPEN**${requirement}\n_Winkans was: **${chance}%**_\nGefeliciteerd: **<@${winners.join("> <@")}>**`)
            .setFooter(`Door ${this.settings.author} • ${this.settings.winners} ${winnersVervoeging}`)
            .setColor("#ff0000")
          )
          return;
        }

        this.message.edit(this.message.embed()
          .setTitle(`🎉 ${this.settings.title} 🎉`)
          .setThumbnail("https://images-ext-2.discordapp.net/external/bKIEW8t7SwsSXk8Kco-2SSaENV6WVWZ8lyOwj_g1ovM/https/images.emojiterra.com/mozilla/512px/1f389.png")
          .setDescription(`${this.settings.description}\n\nTijd over: **${this.getTime()}**${requirement}\n_Winkans: **${chance}%**_`)
          .setFooter(`Door ${this.settings.author} • ${this.settings.winners} ${winnersVervoeging}`)
          .setColor("RANDOM")
        );
      }

      onReactionAdd(member, reaction) {
        if (this.settings.requirements.role && !member.roles.cache.find(r => r.id === this.settings.requirements.role)) {
          try {
            member.user.send(this.message.embed()
              .setTitle("Oeps!")
              .setDescription(`Je mag niet meedoen met de giveaway **${this.settings.title}** in **Teqix Community**, omdat je de role **<@&${this.settings.requirements.role}>** moet hebben!`)
            );
          } catch(e) {
            reaction.message.channel.send(this.message.embed()
              .setTitle("Oeps!")
              .setDescription(`<@${member.user.id}>, je mag niet meedoen met de giveaway, omdat je de role **<@&${this.settings.requirements.role}>** moet hebben!`)
            ).then(m => m.delete({timeout: 5000}));
          }
          return reaction.users.remove(member.user);
        }
        this.participants.push(member.user.id);
        return this;
      }
      onReactionRemove(member) {
        this.participants.removeByValue(member.user.id);
        return this;
      }
     
      getTime() {
        let totalSeconds = (this.settings.until-Date.now()) / 1000;
        let days = Math.floor(totalSeconds / 86400);
        let hours = Math.floor(totalSeconds / 3600-days*24);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = Math.floor(totalSeconds % 60);
    
        let daysVervoeging = "dagen";
        if (days === 1) daysVervoeging = "dag";
        let hoursVervoeging = "uren";
        if (hours === 1) hoursVervoeging = "uur";
        let minutesVervoeging = "minuten";
        if (minutes === 1) minutesVervoeging = "minuut";
        let secondsVervoeging = "seconden";
        if (seconds === 1) secondsVervoeging = "seconde";
        
        let output = [];
        if (days >= 1) output.push(`${days} ${daysVervoeging}`);
        if (hours >= 1) output.push(`${hours} ${hoursVervoeging}`);
        if (minutes >= 1) output.push(`${minutes} ${minutesVervoeging}`);
        if (seconds >= 1) output.push(`${seconds} ${secondsVervoeging}`);
    
        let finalOutput = "";
        for (let i = 0; i < output.length; i++) {
          if (i === output.length-1 && finalOutput.length > 1) finalOutput += `en ${output[i]}`;
          else finalOutput += `${output[i]}, `; 
        }
        if (output.length === 1) finalOutput = output[0];
    
    
        return finalOutput;
      }
    }

    client.giveawayObject = Giveaway;
    client.giveaways = {};
  }
}

function toProperCase(s) {
  return s.toLowerCase().replace( /\b((m)(a?c))?(\w)/g, ($1, $2, $3, $4, $5) => { if($2){return $3.toUpperCase()+$4+$5.toUpperCase();} return $1.toUpperCase(); });
}