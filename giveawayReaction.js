const reactionAdd = {
  run: async (reaction, user, client) => {
    try {
      let member = client.guilds.cache.find(g => g.id === "699987768318755138").members.cache.find(m => m.id === user.id);
      client.giveaways[reaction.message.id]
        .onReactionAdd(member, reaction) // Register reaction change
        .updateDB(client.db) // Update database
        .update(); // Update message
    } catch(e) {}
  },
  name: "messageReactionAdd"
}
const reactionRemove = {
  run: async (reaction, user, client) => {
    try {
      let member = client.guilds.cache.find(g => g.id === "699987768318755138").members.cache.find(m => m.id === user.id);
      client.giveaways[reaction.message.id]
        .onReactionRemove(member, reaction)
        .updateDB(client.db)
        .update();
    } catch(e) {}
  },
  name: "messageReactionRemove"
}
module.exports = [
  reactionAdd,
  reactionRemove
]