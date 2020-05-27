const ytdl = require("ytdl-core");
const fs = require("fs");
const path = require("path");
const { MessageAttachment } = require("discord.js");
const ffmpeg = require("fluent-ffmpeg");
const request = require("request");

module.exports = class Download extends require(`${process.cwd()}/util/command.js`) {
  constructor(client) {
    super(client, {
      name: "download",
      description: "Download muziek van youtube!",
      dir: __dirname
    }, {}, {
      cmdArgs: [{
        name: "Youtube URL",
        test: (_message, arg) => arg && arg.match(/^(https?\:\/\/)?((www\.)?youtube\.com\/watch\?v=.+|youtu\.be\/.+)/)
      }],
      examples: [
        "<cmd> https://www.youtube.com/watch?v=zaIsVnmwdqg"
      ]
    });
  }
  async run(message, args, client) {
    if (args.length < 1) return message.channel.send("Vul een geldige YouTube URL in!");
    if (!args[0].match(/^(https?\:\/\/)?((www\.)?youtube\.com\/watch\?v=.+|youtu\.be\/.+)/)) return message.channel.send("Dat is geen geldige YouTube URL!");
    let id = args[0];
    if (args[0].toLowerCase().includes("youtu.be") && args[0].split("youtu.be/")[1]) id = args[0].split("youtu.be/")[1];
    else if (args[0].toLowerCase().includes("youtube") && args[0].split("v=")[1]) id = args[0].split("v=")[1].split("&")[0];
    let cached = await this.client.db.get(`downloadcache-${id}`);
    if (cached) {
      request(`http://tinyurl.com/api-create.php?url=${cached}`, (err, _res, url) => {
        if (err) url = cached;
        message.channel.send(`Ik heb de video al een keer voor iemand anders omgezet en speciaal voor jou bewaard, wat ben ik toch aardig!\nHier kan je het downloaden: ${url}`,);
      });
      return;
    }

    let msg = await message.channel.send("Ik steel de audio van YouTube...");
    let start = Date.now();
    const url = args[0];
    const stream = ytdl(url, {
      filter: "audioonly",
    });
    let size = 0;
    let filePath, info, frmt;

    stream.on("data", (chunk) => {
      size += chunk.length;
      let mbs = Math.round(size * Math.pow(2, -20));
      if (mbs > 8) {
        stream.unpipe();
        stream.removeAllListeners("data");
        stream.removeAllListeners("info");
        stream.pause();
        stream.emit("end");
        stream.destroy();
      }
    });
    stream.on("info", (inf, format) => {
      info = inf;
      frmt = format;
      this.client.cache.set(`download.${info.player_response.videoDetails.title}.${format.container}`, "");
      filePath = this.client.cache._getPath(`download.${info.player_response.videoDetails.title}.${format.container}`);
      stream.pipe(fs.createWriteStream(filePath));
    });
    stream.on("end", async () => {
      let mbs = Math.round(size * Math.pow(2, -20));
      if (mbs > 8) return msg.edit(`Het bestand is te groot om over Discord te versturen! Het spijt me enorm dat je teleurgesteld bent in mij, ik ben ook teleurgesteld in mijzelf :-( `);
      msg.edit("Ik zet de audio om in iets wat bestendig is voor menselijke consumptie...");
      let attachmentSpamChannel = client.channels.cache.get("709773093601542275");
      let mp3Path = await this.webmToMp3(filePath, `download.${info.player_response.videoDetails.title}`);
      let m = await attachmentSpamChannel.send(new MessageAttachment(mp3Path, `${info.player_response.videoDetails.title}.mp3`));
      let fullURL = m.attachments.first().url;
      request(`http://tinyurl.com/api-create.php?url=${fullURL}`, (err, _res, url) => {
        if (err) url = fullURL;
        msg.edit(`Kijk eens hoe aardig ik toch ben!? Ik heb speciaal voor jou een video gestolen van YouTube en omgezet voor menselijke consumptie in ${Date.now() - start}ms!\nHier kan je het downloaden: ${url}`);
        this.client.cache.remove(`download.${info.player_response.videoDetails.title}.${frmt.container}`);
        this.client.cache.remove(`download.${info.player_response.videoDetails.title}`);
      });
      this.client.db.set(`downloadcache-${id}`, fullURL);
    });
  }

  webmToMp3(fullPath, name) {
    return new Promise((res, rej) => {
      this.client.cache.set(`download.${name}.mp3`, "");
      let p = this.client.cache._getPath(`download.${name}.mp3`);
      let proc = new ffmpeg({
        source: fullPath,
        nolog: true
      })
        .noVideo();
      let ffmpegPath;
      switch (process.platform) {
        case "win32":
          ffmpegPath = path.join(process.cwd(), "ffmpeg", "windows.exe");
          break;
        case "linux":
          ffmpegPath = path.join(process.cwd(), "ffmpeg", "linux");
          break;
        default:
          return rej("Platform niet ondersteund!");
      }
      proc.setFfmpegPath(ffmpegPath);
      proc.toFormat("mp3");
      proc.on("end", () => {
        res(p);
      });
      proc.on("error", rej);
      proc.saveToFile(p);
    });
  }
};
