const autoReload = require("../util/autoReload.js");
const MessageStorage = require("../util/MessageStorage.js");
const MessageObject = require("../util/messageObject.js");
const CacheManager = require("../util/cacheManager.js");

module.exports = {
  priority: 0,
  function: (client) => {
    client.messages = new MessageStorage(client);
    client.message = MessageObject;
    client.cache = new CacheManager();

    let configPath = __dirname.split("/");
    if (configPath.length === 1) configPath = __dirname.split("\\"); // For windows
    configPath.pop();
    client.config = new autoReload(configPath.join("/"), "config.json").onChange((c) => config = c).getFile();
    client.prefix = client.config.prefix;
    client.login(client.config.token);
    
    Array.prototype.removeByValue = function(val) {
      for (let i = 0; i < this.length; i++) {
        if (this[i] === val) {
          this.splice(i, 1);
          i--;
        }
      }
      return this;
    }
  }
}