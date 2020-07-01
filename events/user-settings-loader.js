module.exports = class UserSettingsLoader {
  constructor(client) {
    this.client = client;
    this.name = "ready";
  }

  async run() {
    this.client.users.cache.forEach(async (user) => {
      user.settings = await this.client.db.get(`author-${user.id}`);
      if (!user.settings) user.settings = this.client.config.authorSettings;
      user.updateDatabase = () => {
        return global.client.db.set(`author-${user.id}`, usersettings);
      }
      console.log(user.username, Object.keys(user.settings));
    });
  }
}