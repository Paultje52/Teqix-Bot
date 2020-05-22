module.exports = class Galgje extends require(`${process.cwd()}/util/spel.js`) {
    constructor(client) {
        super(client, {
            name: "galgje",
            test: (message) => {
                return message.channel.name.toLowerCase().includes("galgje");
            }
        });
    }

    async run(message) {

        if (!message.channel.settings) message.channel.settings = {
            word: null,
            lastUser: "",
            guesses: 0,
            levens: 10,
            msg: undefined,
            vooruitgang: [],
            fouteLetters: []
        };

        let words = ["pizza", "moeder", "vader", "broer", "zus"]
        let word = message.channel.settings.word;
        let vooruitgang = message.channel.settings.vooruitgang;
        let content = message.content.toLowerCase()




        if (message.channel.settings.word === null) return nieuwWoord();
        if (message.author.id === message.channel.settings.lastUser) return message.delete();
        message.channel.settings.lastUser = message.author.id;
        message.channel.updateDatabase();
        
        if (message.content.length == 1) {

            let juist = false;
            for (var i = 0; i < word.length; i++) {
                if (word.charAt(i) == content) {
                    juist = true;
                    message.channel.settings.vooruitgang[i] = content
                    message.channel.updateDatabase();
                }
            }

            if (juist == true) { // juist
                message.react("556440979150864384")
                updateMessage()

            } else { // fout
                message.react("556441024281575444")
                message.channel.settings.guesses += 1
                message.channel.settings.levens -= 1

                let fout = true;
                for (var i = 0; i < message.channel.settings.fouteLetters.length; i++) {
                    if (message.channel.settings.fouteLetters[i] == content) {
                        fout = false
                    }
                }
                if (fout == true) message.channel.settings.fouteLetters.push(content)


                message.channel.updateDatabase();
                updateMessage()


            }
        } else {

            if (message.content.toLowerCase() == message.channel.settings.word) { // woord geraden!
                message.channel.messages.fetch(message.channel.settings.msg).then(async msg => {
                    msg.edit(message.embed()
                        .setTitle("Galgje")
                        .setDescription(`Het woord is geraden door ${message.author}. Het was \`${message.content.toLowerCase()}\`!`)
                    );
                    nieuwWoord();
                });
                message.react("556440979150864384")
            } else { // fout
                message.react("556441024281575444")
                message.channel.settings.fouteLetters.push(content)
                message.channel.updateDatabase();
            }

        }


        async function nieuwWoord() {

            let msg = await message.channel.send(message.embed()
                .setTitle("Galgje")
                .setDescription("Ik heb een nieuw woord gekozen, veel succes met raden!")
                .setColor("#2cfc03")
            );

            let word = words[Math.floor(Math.random() * words.length)]
            let levens = word.length + 1

            message.channel.settings = {
                word: word,
                lastUser: "",
                guesses: 0,
                levens: levens,
                msg: msg.id,
                vooruitgang: [],
                fouteLetters: []
            };
            message.channel.updateDatabase();

            for (var x = 0; x < word.length; x++) {
                message.channel.settings.vooruitgang.push("_")
            }
            await message.channel.updateDatabase();
        }

        async function updateMessage() {
            message.channel.messages.fetch(message.channel.settings.msg).then(async msg => {

                let levens = message.channel.settings.levens;
                let juist = true
                for (var i = 0; i < word.length; i++) {
                    if (word.charAt(i) !== vooruitgang[i]) juist = false;
                }
                let geradenLetters = "`";
                for (var i = 0; i < vooruitgang.length; i++) {
                    geradenLetters += vooruitgang[i] + " ";
                }
                geradenLetters += "`"

                let fouteLettersBericht = "`";
                for (var i = 0; i < message.channel.settings.fouteLetters.length; i++) {
                    fouteLettersBericht += message.channel.settings.fouteLetters[i] + ", ";
                }
                fouteLettersBericht += " `"

                if (levens < 1) {
                    msg.edit(message.embed()
                        .setTitle("Galgje - Jullie hebben het woord niet geraden, ik win!")
                        .setColor("#ff0000")
                        .setDescription(`**Vooruitgang:** ${geradenLetters}\n**Foute letters:** ${fouteLettersBericht}\n**Levens over:** ${levens}`)

                    );
                    nieuwWoord();
                } else if (juist == true) {
                    await msg.edit(message.embed()
                        .setTitle("Galgje - Jullie hebben het woord geraden, jullie winnen!")
                        .setColor("#ff0000")
                        .setDescription(`**Vooruitgang:** ${geradenLetters}\n**Foute letters:** ${fouteLettersBericht}\n**Levens over:** ${levens}\n**Het woord is geraden door ${message.author}!**`)

                    );
                    nieuwWoord();
                } else {
                    msg.edit(message.embed()
                        .setTitle("Galgje")
                        .setDescription(`**Vooruitgang:** ${geradenLetters}\n**Foute letters:** ${fouteLettersBericht}\n**Levens over:** ${levens}`)
                        .setColor("#2cfc03")
                    );
                }
            });
        }
    }
}
