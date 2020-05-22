module.exports = function memberAddons(message) {
  message.member.isStaff = () => {
    return !!message.member.roles.cache.find(r => r.name.toLowerCase().includes("staff"));
  };
  message.member.staffTests = () => {
    let memberPosition = message.member.highestPosition();
    return {
      isDeveloper: () => {
        return !!message.member.roles.cache.find(r => r.name.toLowerCase().includes("developer"));
      },
      isEventTeam: () => {
        return !!message.member.roles.cache.find(r => r.name.toLowerCase().includes("event team"));
      },
      isMCTeam: () => {
        return !!message.member.roles.cache.find(r => r.name.toLowerCase().includes("mc team"));
      },
      isHelper: () => {
        let helperPosition = message.guild.roles.cache.find(r => r.name.toLowerCase().includes("helper")).rawPosition;
        return memberPosition >= helperPosition;
      },
      isMod: () => {
        let modPosition = message.guild.roles.cache.find(r => r.name.toLowerCase().includes("moderator")).rawPosition;
        return memberPosition >= modPosition;
      },
      isAdmin: () => {
        let adminPosition = message.guild.roles.cache.find(r => r.name.toLowerCase().includes("admin")).rawPosition;
        return memberPosition >= adminPosition;
      },
      isTeamleider: () => {
        let teamleiderPosition = message.guild.roles.cache.find(r => r.name.toLowerCase().includes("teamleider")).rawPosition;
        return memberPosition >= teamleiderPosition;
      },
      isManagement: () => {
        let managementPosition = message.guild.roles.cache.find(r => r.name.toLowerCase().includes("management")).rawPosition;
        return memberPosition >= managementPosition;
      },
      isEigenaar: () => {
        let eigenaarPosition = message.guild.roles.cache.find(r => r.name.toLowerCase().includes("eigenaar")).rawPosition;
        return memberPosition >= eigenaarPosition;
      }
    }
  }
  message.member.highestPosition = () => {
    return message.member.roles.cache.sort((a, b) => a.rawPosition-b.rawPosition).last().rawPosition;
  }
  return message.member;
}