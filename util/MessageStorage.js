const sqlite3 = require("sqlite3");
const path = require("path");
const chalk = require("chalk");
const discord = require("discord.js");

module.exports = class MessageStorage {
  constructor(client) {
    this.client = client;
    this._db = new sqlite3.Database(path.join(process.cwd(), "messages.sqlite"));
    this._filter = [];
    this._waitForReady().then(() => {
      this._db.run("CREATE TABLE IF NOT EXISTS messages (id TEXT, author TEXT, year TEXT, month TEXT, day TEXT, hour TEXT, date TEXT, channel TEXT, edits TEXT, content TEXT);", () => {
        this._db.run("CREATE TABLE IF NOT EXISTS edits (messageid TEXT, year TEXT, month TEXT, day TEXT, hour TEXT, date TEXT, content TEXT, channel TEXT);", () => {
          console.log(chalk.greenBright("Message Storage is ready!"));
        });
      });
    });
  }


  // Filter stuff
  getAuthor(id) {
    this._filter.push(`author='${id}'`);
    return this;
  }

  getChannel(id) {
    this._filter.push(`channel='${id}'`);
    return this;
  }

  getYear(year) {
    this._filter.push(`year='${year}'`);
    return this;
  }
  getMonth(month) {
    this._filter.push(`month='${month}'`);
    return this;
  }
  getDay(day) {
    this._filter.push(`day='${day}'`);
    return this;
  }
  getHour(hour) {
    this._filter.push(`hour='${hour}'`);
    return this;
  }

  getContent(text) {
    this._filter.push(`content='${text.split("'").join("\\'").split(";").join("\\;")}'`);
    return this;
  }



  // Get the amount of messages
  getSize(customFilter = false) {
    let filter;
    if (customFilter) filter = customFilter;
    else filter = this._formatFilter();
    if (!filter) throw "Geen filter toegevoegd!";
    return new Promise(async (res) => {
      res((await this._get(filter)).length);
    });
  }
  // Get the messages
  getMessages(customFilter = false) {
    let filter;
    if (customFilter) filter = customFilter;
    else filter = this._formatFilter();
    if (!filter) throw "Geen filter toegevoegd!";
    return new Promise(async (res) => {
      let data = await this._get(filter);
      let messages = [];
      for (let msg of data) {
        let channel = this.client.channels.cache.get(msg.channel);
        if (!channel) continue;
        messages.push(this._makeMessage(msg, channel));
      }
      let messagesCollection = new discord.Collection();
      messages.forEach(msg => {
        messagesCollection.set(msg.id, msg);
      });
      res(messagesCollection);
    });
  }
  // Get edits of a message
  async getEdits(message = {}) {
    if (Object.keys(message).length === 0) message = (await this.getMessages())[0];
    return new Promise(async (res) => {
      await this._waitForReady();
      this._db.all(`SELECT * FROM edits WHERE messageid='${message.id}'`, [], async (err, data) => {
        if (err) throw err;
        let edits = [];
        for (let msg of data) {
          let channel = this.client.channels.cache.get(msg.channel);
          if (!channel) continue;
          edits.push(this._makeMessage(msg, channel, false));
        }
        res(edits.sort((a, b) => a.createdTimestamp-b.createdTimestamp));
      });
    });
  }
  // Get the raw messages
  async getRawMessages(customFilter = false) {
    let filter;
    if (customFilter) filter = customFilter;
    else filter = this._formatFilter();
    if (!filter) throw "Geen filter toegevoegd!";
    return await this._get(filter);
  }
  // Get the raw edits
  async getRawEdits(message = {}) {
    if (Object.keys(message).length === 0) message = (await this.getMessages())[0];
    return new Promise(async (res) => {
      await this._waitForReady();
      this._db.all(`SELECT * FROM edits WHERE messageid='${message.id}'`, [], async (err, data) => {
        if (err) throw err;
        res(data);
      });
    });
  }




  // Internal stuff
  _formatFilter() {
    let filter = this._filter.join(" AND ");
    this._filter = [];
    return filter;
  }
  _get(filter) {
    return new Promise(async (res) => {
      await this._waitForReady();
      this._db.all(`SELECT * FROM messages WHERE ${filter}`, [], async (err, data) => {
        if (err) throw err;
        res(data);
      });
    });
  }
  _makeMessage(msg, channel, includingEdits = true) {
    let message = new discord.Message(this.client, {
      id: msg.id,
      channel_id: msg.channel,
      content: msg.content,
      timestamp: msg.date,
      edited_timestamp: null,
      tts: false,
      mentions: [],
      mention_roles: [],
      mention_everyone: false,
      mention_channels: [],
      attachments: [],
      embeds: [],
      pinned: false,
      type: "DEFAULT"
    }, channel);
    if (includingEdits) message.getEdits = async () => {
      return await this.getEdits(message);
    }
    return message;
  }
  _waitForReady() {
    return new Promise((res) => {
      if (this._db.open) return res(true);
      let i = setInterval(() => {
        if (!this._db.open) return;
        clearInterval(i);
        res(true);
      });
    });
  }
  _addMessage(message) {
    this._waitForReady().then(() => {
      let date = new Date(message.createdTimestamp);
      this._db.all(`INSERT INTO messages (id, author, year, month, day, hour, date, channel, edits, content) VALUES ('${message.id}', '${message.author.id}', '${date.getFullYear()}', '${date.getMonth()}', '${date.getDate()}', '${date.getHours()}', '${message.createdTimestamp}', '${message.channel.id}', '[]', '${message.content.split("'").join("\\'").split(";").join("\\;")}')`, (err) => {
        // if (err) throw err;
      });
    });
  }
  _addEdit(message) {
    this._waitForReady().then(() => {
      this._db.all(`SELECT edits FROM messages WHERE id='${message.id}'`, [], (err, data) => {
        if (err) throw err;
        if (data.length === 0) return;
        let date = new Date(message.edited_timestamp);
        let edits = JSON.parse(data[0].edits);
        this._db.all(`INSERT INTO edits (messageid, year, month, day, hour, date, content, channel) VALUES ('${message.id}', '${date.getFullYear()}', '${date.getMonth()}', '${date.getDate()}', '${date.getHours()}', '${date.getTime()}', '${message.content}', '${message.channel_id}')`, (err) => {
          if (err) throw err;
          edits.push(date.getTime());
          this._db.all(`UPDATE messages SET edits='${JSON.stringify(edits)}' WHERE id='${message.id}'`, (err) => {
            if (err) throw err;
          });
        });
      });
    });
  }
} 
