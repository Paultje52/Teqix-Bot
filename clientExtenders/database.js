const chalk = require("chalk");

module.exports = {
  priority: 1,
  function: (client) => {
    let db = new (require("../database.js"))({
      development: true
    });
    db.isReady().then(() => {
      console.log(chalk.greenBright("Database is ready!"));
    });
    client.db = db;
  }
}