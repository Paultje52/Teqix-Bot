module.exports = class Status {
    constructor(client) {
        this.client = client;
        this.name = "ready";
    }



    async run() {
        const api = require('novelcovid');

        async function updateData(m) {
            return new Promise(function (sendSuccess, sendError) {

                api.countries({ country: ['belgium', 'netherlands'] }).then(info => {
                    let belgie = info[0];
                    let nederland = info[1];
                    let dateb = new Date(belgie.updated).toISOString().replace(/T/, ' ').replace(/-/, ' ').replace(/\..+/, '');
                    let daten = new Date(nederland.updated).toISOString().replace(/T/, ' ').replace(/-/, ' ').replace(/\..+/, '');

                    let embed = m.embed()
                        .setTitle("Corona updates")
                        .addField("België", `Laatst geüpdatet: ${dateb}\nBesmetten: ${belgie.cases}(+ ${belgie.todayCases})\nGenezen personen: ${belgie.recovered}\nZwaar intensieven: ${belgie.critical}\nOverleden personen: ${belgie.deaths}(+ ${belgie.todayDeaths})`)
                        .addField("Nederland", `Laatst geüpdatet: ${daten}\nBesmetten: ${nederland.cases}(+ ${nederland.todayCases})\nGenezen personen: ${nederland.recovered}\nZwaar intensieven: ${nederland.critical}\nOverleden personen: ${nederland.deaths}(+ ${nederland.todayDeaths})`)
                        .setTimestamp(Date.now());
                    m.edit("Corona updates", embed)
                })
            });

        }

        let i = setInterval(async () => {
            let dbChannel = await this.client.db.get("coronaChannel");
            let channel = client.channels.cache.get(dbChannel);
            if (!channel) return console.log("geen corona kanaal");
            let dbmsg = await this.client.db.get("coronaMsg")
            let msg = channel.messages.fetch(dbmsg);
            if (msg) updateData(msg);
            else console.log("geen corona msg")
        }, 10e3);
    }
}