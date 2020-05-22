const path = require("path");
const fs = require("fs");
const fsscanner = require("fsscanner");

module.exports = class CacheManager {
  constructor() {
    this.cacheFolder = path.join(process.cwd(), "cache");
    this._resetCache();
  }

  /*
    PRIVATE FUNCTIUONS
  */
  // Get a path to a cached file
  _getPath(name) {
    return path.join(this.cacheFolder, name);
  }
  // Removes all the cached files
  _resetCache() {
    fsscanner.scan(this.cacheFolder, [], (err, res) => {
      if (err || res.length === 0) return;
      res.forEach(file => {
        fs.unlinkSync(file);
      });
    });
  }

  /*
    PUBLIC FUNCTIUONS
  */
  // Caches a file
  set(name, data, expires = 0) {
    if (expires !== 0) this.remove(name, expires);
    return fs.writeFileSync(this._getPath(name), data);
  }
  // Gets a cached file
  get(name, toString = false) {
    if (!this.check(name)) return false;
    let file = fs.readFileSync(this._getPath(name));
    if (toString) return file.toString(toString);
    return file;
  }
  // Removes the cache of a file
  remove(name, timeout = 0) {
    setTimeout(() => {
      try {
        fs.unlinkSync(this._getPath(name));
      } catch(e) {}
    }, timeout);
  }
  // Check if a file exists
  check(name) {
    return !!fs.existsSync(this._getPath(name));
  }
}