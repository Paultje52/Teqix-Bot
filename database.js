module.exports = class DataBase {
  constructor({development = false, cwd = __dirname, name ="database"} = {development: false, cwd: __dirname, name: "database"}) {
    if (development) {
      this.database = new (require("json-config-store"))({
        cwd: cwd,
        configName: `${name}.json`
      });
      this.database.isReady = () => new Promise((res) => res());
      return this.database;
    }
    this.memory = {};
    this.ready = false;
    const sqlite3 = require("sqlite3");
    this.sqlite = new sqlite3.Database(`${name}.sqlite`);
    let i = setInterval(() => {
      if (!this.sqlite.open) return;
      clearInterval(i);
      this.sqlite.run("CREATE TABLE IF NOT EXISTS cn_bot_table (key TEXT, value TEXT);", () => {
        this.sqlite.all("SELECT * FROM cn_bot_table;", (err, data) => {
          if (err) throw err;
          data.forEach(d => {
            this.memory[d.key] = JSON.parse(d.value);
          });
          this.ready = true;
        });
      });
    });
  }

  isReady() {
    return new Promise((res) => {
      let i = setInterval(() => {
        if (!this.ready) return;
        res();
        clearInterval(i);
      }, 10);
    })
  }

  get(key) {
    if (this.memory[key]) return this.memory[key];
    return new Promise((res) => {
      this.sqlite.all(`SELECT value FROM cn_bot_table WHERE key='${key}';`, [], (err, data) => {
        if (err) throw err;
        if (data.length === 0) return res(undefined);
        res(data[0].key);
      });
    }); 
  }

  set(key, value) {
    this.memory[key] = value;
    return new Promise((res) => {
      this.sqlite.all(`SELECT * FROM cn_bot_table where key='${key}'`, [], (err, data) => {
        if (err) throw err;
        let sql = "";
        if (data.length === 0) sql = `INSERT INTO cn_bot_table (key, value) VALUES ('${key}', '${JSON.stringify(value)}')`;
        else sql = `UPDATE cn_bot_table SET value='${JSON.stringify(value)}' WHERE key='${key}'`;
        this.sqlite.all(sql, [], (err) => {
          if (err) throw err;
          res(true);
        });
      });
    });
  }

  delete(key) {
    delete this.memory[key];
    return new Promise((res) => {
      this.sqlite.all(`DELETE FROM cn_bot_table WHERE key='${key}'`, [], (err) => {
        if (err) throw err;
        res(true);
      });
    });
  }
}