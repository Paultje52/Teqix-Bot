module.exports = class VoiceStats {
  constructor(client) {
    this.client = client;
    this.name = "raw";
    this.client.db.isReady().then(async () => {
      let userData = await client.db.get("voicestats-users");
      if (!userData) userData = [];
      this.userData = [];
      this.client.db.set("voicestats-users", userData);
      setInterval(() => {
        this.client.db.set("voicestats-users", userData);
      }, 15000);
    });
    this.activeSessions = new Map();
    this.voiceSessions = new Map();
  }

  async run(event) {
    return; // Staat tijdelijk uit.
    if (event.t !== "VOICE_STATE_UPDATE") return;
    this.client = global.client;
    let user = this.client.users.cache.find(u => u.id === event.d.user_id);
    
    let deaf = event.d.self_deaf || event.d.deaf;
    let joined = !!(event.d.channel_id ? event.d.channel_id : false);
    // TODO: Channel stats
    if (joined && !deaf) {
      if (this.activeSessions.has(user.id)) this.updateMinutes(Date.now()-this.activeSessions.get(user.id), user.id, );
      this.activeSessions.set(user.id, Date.now());
      // JOIN
    } else {
      if (this.activeSessions.has(user.id)) this.updateMinutes(Date.now()-this.activeSessions.get(user.id), user.id);
      // LEAVE
    }
  }

  async updateMinutes(time, user, channel) {
    if (!this.userData.includes(user)) {
      this.userData.push(user);
      this.client.db.set("voicestats", this.userData);
    }
    let existingData = await this.client.db.get(`voicestats-${user}`);
    if (!existingData) existingData = {};
    let date = new Date();
    if (!existingData[date.getFullYear()]) existingData[date.getFullYear()] = {};
    if (!existingData[date.getFullYear()][date.getMonth()]) existingData[date.getFullYear()][date.getMonth()] = {};
    if (!existingData[date.getFullYear()][date.getMonth()][date.getDay()]) existingData[date.getFullYear()][date.getMonth()][date.getDay()] = {
      total: 0,
      channels: {}
    };
    existingData[date.getFullYear()][date.getMonth()][date.getDay()] += time;
    this.client.db.set(`voicestats-${user}`, existingData);
    this.activeSessions.delete(user);
  }
};
