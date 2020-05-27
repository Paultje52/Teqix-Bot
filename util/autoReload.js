const path = require("path");
const fs = require("fs");

module.exports = class autoReload {
  constructor(...dir) {
    this.path = path.join(...dir);
    this._onChange = () => {};
    this._getContent();

    this._timeout = null;
    fs.watch(this.path, (type) => {
      if (this._timeout !== null) clearTimeout(this._timeout);
      this._timeout = setTimeout(() => {
        if (type !== "change") return;
        this._getContent();
        this._onChange(this._content, this.path);
      }, 500);
    });
  }

  isClass() {
    this._getContent = () => {
      this._content = require(this.path);
      delete require.cache[require.resolve(this.path)];
    }
    this._getContent();
    return this;
  }

  _getContent() {
    this._content = {...require(this.path)};
    delete require.cache[require.resolve(this.path)];
  }

  onChange(callback) {
    this._onChange = callback;
    return this;
  }

  getFile() {
    return this._content;
  }
} 