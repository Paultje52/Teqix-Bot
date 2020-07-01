module.exports = class Ping extends require(`${process.cwd()}/util/command.js`) {
    constructor(client) {
        super(client, {
            name: "stats",
            description: "Bekijk de server stats!",
            dir: __dirname,
            alias: ["statistieken"]
        });
    }
    async run(message, args) {
        return;
        function Last7Days() {
            var result = [];
            for (var i = 0; i < 7; i++) {
                var d = new Date();
                d.setDate(d.getDate() - i);
                result.push(d)
            }

            return (result);
        }
        function formatDate(date) {

            var dd = date.getDate();
            // var mm = date.getMonth()+1;
            // var yyyy = date.getFullYear();
            // if(dd<10) {dd='0'+dd}
            // if(mm<10) {mm='0'+mm}
            // date = mm+'/'+dd+'/'+yyyy;
            return dd
        }

        let dates = await Last7Days()
        // console.log(dates)

        // for (let d of dates) { 
        //     let messages = client.messages
        //         .getYear(d.getFullYear())
        //         .getMonth(d.getMonth()+1)
        //         .getDate(d.getDay());
        //     let m = await messages.getSize()
        //     console.log(m)
        // }
        let messages = this.client.messages
            .getYear("2020")
            .getMonth("6")
            .getDay("24");
            let m = await messages.getSize();
            console.log(m)
    }
}