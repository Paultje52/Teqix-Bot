module.exports = class MessageMenu {
  constructor(message, reactions = {}, ) {
    this.message = message;
    this.reactions = reactions;
    this._filter = () => true;
    this._time = 1000*60*60;
    this._events = {
      reactie: [],
      einde: []
    };
    // TODO: One-line optie toevoegen om filter, menu stoppen en emojis cleren automatisch te doen!
  }

  filter(filter) {
    if (!filter) return this._filter;
    this._filter = filter;
  }
  time(time) {
    if (!time) return this._time;
    this._time = time;
  }

  create() {
    return new Promise(async (res) => {
      this.collector = this.message.createReactionCollector(this._filter, {time: this._time});
      this.collector.on("collect", (reaction, user) => {
        if (this.reactions[reaction.emoji.name] === null || this.reactions[reaction.emoji.name] === undefined) return;
        this._events.reactie.forEach((f) => {
          f({
            naam: this.reactions[reaction.emoji.name],
            emoji: reaction.emoji.name,
            count: reaction.count,
            me: reaction.me,
            message: this.message,
            user: user,
            remove: reaction.remove,
            _reaction: reaction
          });
        });
      });
      this.collector.on("end", (collected, reason) => {
        this._events.einde.forEach((f) => {
          f(collected, reason);
          // TODO: Format net zoals menu.reactie()!!!
        });
      });
      for (let i in this.reactions) {
        await this.message.react(i);
      }
      res(this);
    });
  }

  reactie(func) {
    this._events.reactie.push(func);
  }
  einde(func) {
    this._events.einde.push(func);
  }
  // TODO: unreact functie toevoegen

  stop(reason = false) {
    this.collector.stop(reason);
  }
  clearEmojis() {
    this.message.reactions.removeAll();
  }

  // TODO: Rebuild (Met nieuwe emojis etc) en add emoji toevoegen!
}