const path = require("path");
const fsscanner = require("fsscanner");

module.exports = function loader(dir, callback) {
  return new Promise((res, rej) => {
    fsscanner.scan(path.join(process.cwd(), dir), [fsscanner.criteria.pattern(".js"), fsscanner.criteria.type("F")], async (err, files) => {
      // Load alle files, en delete require cache
      if (err) return rej(err);
      for (let i = 0; i < files.length; i++) {
        await callback(require(files[i]), files[i]);
        delete require.cache[require.resolve(files[i])];
      }
      console.log(`${files.length} ${dir.split("/")[dir.split("/").length-1]} succesvol geladen.`);
      res(files.length);
    });
  });
}