module.exports = class Manage extends require(`${process.cwd()}/util/command.js`) {
	constructor(client) {
		super(client, {
			name: "manage",
			description: "Het main moderatie command!",
			dir: __dirname,
			alias: ["m", "beheer"]
		}, {
			// test: (message) => message.member.isStaff()
		}, {
			cmdArgs: [{
				name: "member",
				test: (message, argument) => !!(message.mentions.members.first() || message.guild.member(argument))
			}],
			examples: [
				"<cmd> <@327462385361092621>"
			]
		});
	}

	async run(message, args) {
		let member = message.mentions.members.first() || message.guild.member(args[0]);
		if (!member) return message.error("Gebruiker niet gevonden!");
		member = { ...member }; // Nieuw object maken om conflicten te voorkomen!
		member.actions = 0;
		// if (member.user.id === message.author.id) return message.error("Je kan jezelf niet managen!");
		if (args[1] && args[1].toLowerCase() === "mod") return this.modMenu(message, await message.channel.send(message.embed().setDescription("Laden...")), member);
		else if (args[1] && args[1].toLowerCase() === "rollen") return this.roleMenu(message, await message.channel.send(message.embed().setDescription("Laden...")), member);
		else if (args[1] && args[1].toLowerCase().includes("overig")) return this.utilMenu(message, await message.channel.send(message.embed().setDescription("Laden...")), member);
		else if (args[1] && this[args[1]]) return this[args[1]](message, await message.channel.send(message.embed().setDescription("Laden...")), member);
		this.hoofdmenu(message, await message.channel.send(message.embed().setDescription("Laden...")), member);
	}


	/*
	   Menu's
	*/
	hoofdmenu(message, msg, member) {
		msg.edit(message.embed().setDescription("Laden..."));
		let menu = new message.menu(msg, {
			"🔨": "mod",
			"⚖️": "rollen",
			"🗑️": "overige",
			"🛑": "stop"
		});
		menu.filter((_reaction, user) => user.id === message.author.id);
		menu.reactie((reactie) => {
			menu.stop();
			menu.clearEmojis();
			if (reactie.naam === "stop") return this.stopMenu(menu, member, message.embed);
			menu.message.edit(message.embed().setDescription("Laden..."));
			if (reactie.naam === "mod") this.modMenu(message, msg, member);
			else if (reactie.naam === "rollen") this.roleMenu(message, msg, member);
			else this.utilMenu(message, msg, member);
		});
		menu.create().then(() => {
			menu.message.edit(message.embed()
				.setAuthor(member.user.username, member.user.displayAvatarURL())
				.setTitle("Manage")
				.setDescription("**Wat wil je doen?**\n🔨 Moderatie acties (Inc. Geschiedenis)\n⚖️ Rollen veranderen\n🗑️ Overige")
				.setFooter("Druk op 🛑 om te stoppen • © Teqix Community")
			);
		});
	}
	modMenu(message, msg, member) {
		let menu = new message.menu(msg, {
			"⚠️": "warn",
			"😶": "mute",
			"🦵": "kick",
			"⛔": "ban",
			"📚": "geschiedenis",
			"🛑": "stop",
			"◀️": "return"
		});
		menu.filter((_reaction, user) => user.id === message.author.id);
		menu.reactie((reactie) => {
			menu.stop();
			menu.clearEmojis();
			if (reactie.naam === "stop") return this.stopMenu(menu, member, message.embed);
			if (reactie.naam === "return") return this.hoofdmenu(message, msg, member);
			if (reactie.naam === "warn") return this.warn(message, msg, member);
			if (reactie.naam === "mute") return this.mute(message, msg, member);
			if (reactie.naam === "kick") return this.kick(message, msg, member);
			if (reactie.naam === "ban") return this.ban(message, msg, member);
			if (reactie.naam === "geschiedenis") return this.history(message, msg, member);
		});
		menu.create().then(() => {
			menu.message.edit(message.embed()
				.setAuthor(member.user.username, member.user.displayAvatarURL())
				.setTitle("Manage: Moderatie acties")
				.setDescription("**Wat wil je doen?**\n⚠️ Waarschuwen\n😶 Muten\n🦵 Kicken\n⛔ Bannen")
				.setFooter("🛑 > Stoppen • ◀️ > Ga terug • © Teqix Community")
			);
		});
	}

	roleMenu(message, msg, member) {
		return msg.edit("Sorry, deze functie is nog niet beschikbaar. Het developersteam is hier druk mee bezig!");
		// Utility array
		let numbers = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']

		if (!message.member.hasPermission("MANAGE_ROLES")) return message.error("Je moet de Manage Roles permissie hebben om dit te kunnen doen!");
		msg.edit(message.embed().setDescription("Rollen van gebruiker laden, dit kan even duren..."));

		// Embed
		let embed = message.embed().setTitle(`Rollen beheren van ${member.user.tag}`)
			.setAuthor(member.user.username, member.user.displayAvatarURL())
			.setFooter("🛑 > Stoppen • ◀️ > Ga terug • © Teqix Community");
		embed.setDescription("Kies hieronder om de roles toe te voegen of te verwijderen.\nVoeg toe of verwijder door op de corresponderende emoji te klikken.");

		// TODO: Voeg roles toe
		let rolesArray = ["699988748821200907", "699988749303414846"];
		rolesArray = rolesArray.map(r => message.guild.roles.cache.get(r));

		let roleGroups = { present: [], missing: [] };
		rolesArray.forEach(role => {
			if (message.member.roles.cache.has(role.id)) roleGroups.present.push(role);
			else roleGroups.missing.push(role)
		})

		// Create fields
		let presentString = "", missingString = "";
		let i = 0;
		roleGroups.present.forEach(role => {
			let number = i.toString().split("").map(n => numbers[parseInt(n)]).join("");
			presentString += `${role} ${number}\n`
			i++;
		})
		roleGroups.missing.forEach(role => {
			let number = i.toString().split("").map(n => numbers[parseInt(n)]).join("");
			missingString += `${role} ${number}\n`;
			i++;
		})
		embed.addField("Aanwezig", presentString == "" || !presentString ? "Geen" : presentString);
		embed.addField("Missend", missingString == "" || !missingString ? "Geen" : missingString);
		// Menu
		let emojisArr = numbers.slice(0, i);
		let emojis = {};
		// 0 emote = 0 bijvoorbeeld
		emojisArr.forEach(emoji => emojis[emoji] = numbers.indexOf(emoji))

		let menu = new message.menu(msg, emojis);
		menu.filter((_reaction, user) => user.id === message.author.id);
		menu.time(1000 * 60); // één minuut de tijd
		menu.create().then(() => {
			msg.edit(embed);
		});
		menu.reactie(r => {
			let role = rolesArray[r.naam];
			console.log(role.id)
		});

	}
	utilMenu(message, msg, member) {

		// level, notes, history

		let menu = new message.menu(msg, {
			"⭐": "reset_review",
			"📝": "notities",
			"🍪": "cookies",
			"🎚️": "levels",
			"🗞️": "message",
			"🛑": "stop",
			"◀️": "return"
		});
		menu.filter((_reaction, user) => user.id === message.author.id);
		menu.reactie((reactie) => {
			menu.stop();
			menu.clearEmojis();
			if (reactie.naam === "stop") return this.stopMenu(menu, member, message.embed);
			if (reactie.naam === "return") return this.hoofdmenu(message, msg, member);
			if (reactie.naam === "reset_review") return this.resetReview(message, msg, member);
			if (reactie.naam === "notities") return this.notes(message, msg, member);
			if (reactie.naam === "cookies") return this.cookies(message, msg, member);
			if (reactie.naam === "levels") return this.levels(message, msg, member);
			if (reactie.naam === "message") return this.anonymousMessage(message, msg, member);
		});
		menu.create().then(() => {
			menu.message.edit(message.embed()
				.setAuthor(member.user.username, member.user.displayAvatarURL())
				.setTitle("Manage: Overige acties")
				.setDescription("**Wat wil je doen?**\n⭐ Reviews resetten\n📝 Notities\n🍪 Cookies (Soon)\n🎚️ Levels\n🗞️ Annoniem bericht")
				.setFooter("🛑 > Stoppen • ◀️ > Ga terug • © Teqix Community")
			);
		});
	}

	/* 
		Overige acties
	*/
	async resetReview(message, msg, member) {
		let sure = await this.isSure(msg, message, `Weet je zeker dat je de reviewstatus wilt resetten?\n<@${member.user.id}> kan dan weer een review plaatsen!`, (_reaction, user) => user.id === message.author.id);
		if (!sure) return this.utilMenu(message, msg, member);

		member.actions++;
		if (!member.user.settings) member.user.settings = await this.client.db.get(`author-${member.user.id}`);
		if (!member.user.settings) member.user.settings = this.client.config.authorSettings;
		member.user.settings.didReview = false;
		await this.client.db.set(`author-${member.user.id}`, member.user.settings);

		msg.edit(message.embed()
			.setTitle("Manage: Review reset")
			.setAuthor(member.user.username, member.user.displayAvatarURL())
			.setDescription(`De reviewstatus is gereset! Je gaat over vijf seconden terug!`)
		);
		setTimeout(() => {
			this.utilMenu(message, msg, member);
		}, 5000);
	}
	anonymousMessage(message, msg, member) {
		msg.edit(message.embed()
			.setTitle("Manage: Annoniem bericht")
			.setAuthor(member.user.username, member.user.displayAvatarURL())
			.setDescription(`Hiermee wordt er een "annoniem" bericht verstuurt naar <@${member.user.id}>, namens het staffteam.\n_Stuur het bericht dat je wilt sturen in de chat!_`)
		);
		let menu = new message.menu(msg, {
			"🛑": "stop"
		});
		menu.filter((_reaction, user) => user.id === message.author.id);
		menu.reactie((reactie) => {
			menu.stop();
			menu.clearEmojis();
			collector.stop();
			this.utilMenu(message, msg, member);
		});
		menu.create();

		// Collector
		let collector = message.channel.createMessageCollector(m => m.author.id === message.author.id, { time: 1000 * 60 * 60 });
		collector.on("collect", async (m) => {
			let msgContent = m.content;
			menu.stop();
			await menu.clearEmojis();
			collector.stop();
			m.delete();
			let sure = await this.isSure(msg, message, `Moet ik het volgende naar <@${member.user.id}> sturen?\n\`\`\`${msgContent}\`\`\``, (_reaction, user) => user.id === message.author.id);
			if (!sure) return this.utilMenu(message, msg, member);
			try {
				member.user.send(message.embed()
					.setTitle("Bericht van Teqix Staff")
					.setDescription(msgContent)
				);
				member.actions++;
				msg.edit(message.embed()
					.setTitle("Verstuurt!")
					.setDescription(`Het bericht is verstuurt naar <@${member.user.id}>!`)
					.setFooter("Je gaat over 5 sec terug!")
				);
			} catch (e) {
				msg.edit(message.embed()
					.setTitle("Oeps!")
					.setDescription(`Ik kan geen berichten sturen naar <@${member.user.id}>!`)
					.setFooter("Je gaat over 5 sec terug!")
				);
			}
			setTimeout(() => {
				this.utilMenu(message, msg, member);
			}, 5000);
		});
	}
	levels(message, msg, member) {
		return msg.edit("De developers zijn hier nog druk mee bezig!");
		// Flor
		// TODO: Levelsysteem. Hier kan je het aantal XP aanpassen, bijvoorbeeld de gebruiker levelup of leveldown laten gaan. 
		// Ook kan de gebruiker worden gereset.
	}
	cookies(message, msg, member) {
		return msg.edit(message.embed()
			.setTitle("Manage: Cookies")
			.setDescription("De developers zijn nog bezig met het cookies systeem. Zodra dit af is, zal dit deel van manage werken!")
		);
		// Cookies komen in een latere release!
	}
	notes(message, msg, member) {
		return msg.edit("De developers zijn hier nog druk mee bezig!");
		// Flor
		// TODO: Notities menu. Hier staan de notities van de gebruiker (max 5, elke notitie maximaal 300 tekens (STRING.length))
		// Hier kan je ook notities aanpassen (met nummers).
		// Bij het aanpassen kan je 'm vervangen of verwijderen. Ook zie je dan wie de notitie daar heeft neergezet.
		// Als er nog geen vijf notities zijn, dan een + om dr 1tje toe te voegen
	}
	/*
		Moderatie acties
	*/
	history(message, msg, member) {
		// TODO: History gedoe. Hier kan je zien hoeveel mutes, warns, kicks en bans een gebruiker heeft, met de redenen. Maximaal 5 per ding.
		// Ook kan je hier dingen weghalen of redenen veranderen.

		let menu = new message.menu(msg, {
			"⚠️": "warns",
			"😶": "mutes",
			"🦵": "kicks",
			"⛔": "bans",
			"🛑": "stop",
			"◀️": "return"
		});
		menu.filter((_reaction, user) => user.id === message.author.id);
		menu.reactie((reactie) => {
			menu.stop();
			menu.clearEmojis();
			if (reactie.naam === "stop") return this.stopMenu(menu, member, message.embed);
			if (reactie.naam === "return") return this.utilMenu(message, msg, member);
			if (reactie.naam === "warns") {
				let warns = member.user.settings.warns;
				if (warns.length == 0) {
					msg.edit(message.embed()
						.setTitle(`Warns ${member.user.username}`)
						.setDescription(`${member.user.tag} heeft 0 warns!`)
					);
				} else {
					msg.edit(message.embed()
						.setTitle(`Warns ${member.user.username}`)
						.setDescription(`${member.user.tag} heeft ${warns.length} warns!\nKlik op 📚 om ze allemaal te bekijken.`)
					);
					let menu = new message.menu(msg, {
						"📚": "bekijk",
						"🖊️": "bewerk",
						"🛑": "stop",
						"◀️": "return"
					});
					menu.filter((_reaction, user) => user.id === message.author.id);
					menu.reactie((reactie) => {
						menu.stop();
						menu.clearEmojis();
						if (reactie.naam === "stop") return this.stopMenu(menu, member, message.embed);
						if (reactie.naam === "return") return this.utilMenu(message, msg, member);
						if (reactie.naam === "bekijk") {
							let txt = "";
							warns.forEach(w => {
								txt += `**Warn ${w.actionSessionNumber}**\nDoor <@${w.by.id}>\nReden: \`${w.reason}\`\nDatum: ${new Date(w.time).toLocaleString()}\n`
							})
							msg.edit(message.embed()
								.setTitle(`Warns ${member.user.username}`)
								.setDescription(txt)
							);
						} else if (reactie.naam == "bewerk") {
							return msg.edit(message.embed()
								.setDescription("Dit is nog in onderhoud!")
							)
						}
					});
					menu.create().then(() => {
						menu.message.edit(message.embed()
							.setTitle(`Warns ${member.user.username}`)
							.setDescription(`${member.user.tag} heeft ${warns.length} warn(s)!\nKlik op 📚 om ze allemaal te bekijken.`)
						);
					});
				}
			}
			if (reactie.naam === "mutes") {
				let mutes = member.user.settings.mutes;
				if (mutes.length == 0) {
					msg.edit(message.embed()
						.setTitle(`Mutes ${member.user.username}`)
						.setDescription(`${member.user.tag} heeft 0 mutes!`)
					);
				} else {
					msg.edit(message.embed()
						.setTitle(`Mutes ${member.user.username}`)
						.setDescription(`${member.user.tag} heeft ${mutes.length} mute(s)!\nKlik op 📚 om ze allemaal te bekijken.`)
					);
					let menu = new message.menu(msg, {
						"📚": "bekijk",
						"🖊️": "bewerk",
						"🛑": "stop",
						"◀️": "return"
					});
					menu.filter((_reaction, user) => user.id === message.author.id);
					menu.reactie((reactie) => {
						menu.stop();
						menu.clearEmojis();
						if (reactie.naam === "stop") return this.stopMenu(menu, member, message.embed);
						if (reactie.naam === "return") return this.utilMenu(message, msg, member);
						if (reactie.naam === "bekijk") {
							let txt = "";
							mutes.forEach(w => {
								txt += `**Mute ${w.actionSessionNumber}**\nDoor <@${w.by.id}>\nReden: \`${w.reason}\`\nDatum: ${new Date(w.time).toLocaleString()}\n`
							})
							msg.edit(message.embed()
								.setTitle(`Mutes ${member.user.username}`)
								.setDescription(txt)
							);
						} else if (reactie.naam == "bewerk") {
							return msg.edit(message.embed()
								.setDescription("Dit is nog in onderhoud!")
							)
						}
					});
					menu.create().then(() => {
						menu.message.edit(message.embed()
							.setTitle(`Mutes ${member.user.username}`)
							.setDescription(`${member.user.tag} heeft ${mutes.length} mute(s)!\nKlik op 📚 om ze allemaal te bekijken.`)
						);
					});
				}
			}
			if (reactie.naam === "kicks") {
				let kicks = member.user.settings.kicks;
				if (kicks.length == 0) {
					msg.edit(message.embed()
						.setTitle(`Kicks ${member.user.username}`)
						.setDescription(`${member.user.tag} heeft 0 kicks!`)
					);
				} else {
					msg.edit(message.embed()
						.setTitle(`Kicks ${member.user.username}`)
						.setDescription(`${member.user.tag} heeft ${kicks.length} kicks!\nKlik op 📚 om ze allemaal te bekijken.`)
					);
					let menu = new message.menu(msg, {
						"📚": "bekijk",
						"🖊️": "bewerk",
						"🛑": "stop",
						"◀️": "return"
					});
					menu.filter((_reaction, user) => user.id === message.author.id);
					menu.reactie((reactie) => {
						menu.stop();
						menu.clearEmojis();
						if (reactie.naam === "stop") return this.stopMenu(menu, member, message.embed);
						if (reactie.naam === "return") return this.utilMenu(message, msg, member);
						if (reactie.naam === "bekijk") {
							let txt = "";
							kicks.forEach(w => {
								txt += `**Kick ${w.actionSessionNumber}**\nDoor <@${w.by.id}>\nReden: \`${w.reason}\`\nDatum: ${new Date(w.time).toLocaleString()}\n`
							})
							msg.edit(message.embed()
								.setTitle(`Kicks ${member.user.username}`)
								.setDescription(txt)
							);
						} else if (reactie.naam == "bewerk") {
							return msg.edit(message.embed()
								.setDescription("Dit is nog in onderhoud!")
							)
						}
					});
					menu.create().then(() => {
						menu.message.edit(message.embed()
							.setTitle(`Kicks ${member.user.username}`)
							.setDescription(`${member.user.tag} heeft ${kicks.length} kick(s)!\nKlik op 📚 om ze allemaal te bekijken.`)
						);
					});
				}
			}
			if (reactie.naam === "bans") {
				let bans = member.user.settings.bans;
				if (bans.length == 0) {
					msg.edit(message.embed()
						.setTitle(`Bans ${member.user.username}`)
						.setDescription(`${member.user.tag} heeft 0 bans!`)
					);
				} else {
					msg.edit(message.embed()
						.setTitle(`Bans ${member.user.username}`)
						.setDescription(`${member.user.tag} heeft ${bans.length} bans!\nKlik op 📚 om ze allemaal te bekijken.`)
					);
					let menu = new message.menu(msg, {
						"📚": "bekijk",
						"🖊️": "bewerk",
						"🛑": "stop",
						"◀️": "return"
					});
					menu.filter((_reaction, user) => user.id === message.author.id);
					menu.reactie((reactie) => {
						menu.stop();
						menu.clearEmojis();
						if (reactie.naam === "stop") return this.stopMenu(menu, member, message.embed);
						if (reactie.naam === "return") return this.utilMenu(message, msg, member);
						if (reactie.naam === "bekijk") {
							let txt = "";
							bans.forEach(w => {
								txt += `**Ban ${w.actionSessionNumber}**\nDoor <@${w.by.id}>\nReden: \`${w.reason}\`\nDatum: ${new Date(w.time).toLocaleString()}\n`
							})
							msg.edit(message.embed()
								.setTitle(`Bans ${member.user.username}`)
								.setDescription(txt)
							);
						} else if (reactie.naam == "bewerk") {
							return msg.edit(message.embed()
								.setDescription("Dit is nog in onderhoud!")
							)
						}
					});
					menu.create().then(() => {
						menu.message.edit(message.embed()
							.setTitle(`Bans ${member.user.username}`)
							.setDescription(`${member.user.tag} heeft ${bans.length} bans(s)!\nKlik op 📚 om ze allemaal te bekijken.`)
						);
					});
				}
			}
		});
		menu.create().then(() => {
			menu.message.edit(message.embed()
				.setAuthor(member.user.username, member.user.displayAvatarURL())
				.setTitle("Manage: Moderatie acties")
				.setDescription("**Wat wil je doen?**\n⚠️ Warns bekijken/aanpassen\n😶 Mutes bekijken/aanpassen\n🦵 Kicks bekijken/aanpassen\n⛔ Bans bekijken/aanpassen")
				.setFooter("🛑 > Stoppen • ◀️ > Ga terug • © Teqix Community")
			);
		});
		function viewActions(name) {
			let actions = message.author.settings
			console.log(actions)
		}

	}

	warn(message, msg, member) {
		msg.edit(message.embed()
			.setAuthor(member.user.username, member.user.displayAvatarURL())
			.setTitle("Manage: Moderatie acties: Waarschuwen")
			.setDescription(`Waarvoor wil je ${member.user.username} waarschuwen? Typ het antwoord in de chat!`)
			.setFooter("Druk op 🛑 om terug te gaan • © Teqix Community")
		);
		let menu = new message.menu(msg, {
			"🛑": "stop"
		});
		menu.filter((_reaction, user) => user.id === message.author.id);
		menu.reactie((reactie) => {
			menu.stop();
			menu.clearEmojis();
			collector.stop();
		});
		menu.create();

		// Collector
		let collector = message.channel.createMessageCollector(m => m.author.id === message.author.id, { time: 1000 * 60 * 60 });
		let canDo = true;
		collector.on("collect", async (m) => {
			if (!canDo) return;
			let reason = m.content;
			canDo = false;
			await menu.stop();
			await menu.clearEmojis();
			m.delete();
			let sure = await this.isSure(msg, message, `Weet je zeker dat je ${member.user.username} wilt waarschuwen voor **${reason}**?`, (_reaction, user) => user.id === message.author.id);
			if (!sure) {
				canDo = true;
				return collector.stop();
			}
			await msg.edit(message.embed()
				.setAuthor(member.user.username, member.user.displayAvatarURL())
				.setTitle("Manage: Moderatie acties: Waarschuwen")
				.setDescription(`Ik ben bezig met ${member.user.username} te waarschuwen voor **${reason}**, geef me een momentje, ik ben niet meer de jongste!`)
			);
			setTimeout(async () => { // In een functie voor betere error catching

				// Userdata updaten
				member.actions++;
				if (!member.user.settings) member.user.settings = await this.client.db.get(`author-${member.user.id}`);
				if (!member.user.settings) member.user.settings = this.client.config.authorSettings;
				member.user.settings.warns.push({
					by: {
						id: message.author.id,
						username: message.author.username,
						displayAvatarURL: message.author.displayAvatarURL
					},
					time: Date.now(),
					reason: reason,
					channel: {
						id: message.channel.id,
						name: message.channel.name
					},
					actionSessionNumber: member.actions,
					highestRole: message.guild.member(message.author.id).roles.highest.name
				});
				await this.client.db.set(`author-${member.user.id}`, member.user.settings);

				// User bericht sturen
				try {
					member.user.send(message.embed()
						.setTitle("Waarschuwing!")
						.setDescription(`Oei, je hebt een waarschuwing gekregen van ${message.author}, de reden hiervoor is **${reason}**!\n_Niet mee eens?_ Maak een ticket!`)
					);
					// TODO: Met één klik automatisch ticket maken!
				} catch (e) { }

				// Modlogs
				let modlogs = message.guild.channels.cache.find(c => c.name === this.client.config.channels.modlogs);
				if (modlogs) {
					modlogs.send(message.embed()
						.setAuthor(member.user.username, member.user.displayAvatarURL())
						.setTitle(`Waarschuwing voor ${member.user.username}`)
						.setDescription(`Gewaarschuwde: ${member.user}\nDoor: ${message.author} (Hoogste rol: **${message.guild.member(message.author.id).roles.highest.name}**)\nKanaal: ${message.channel}\nReden: **${reason}**\n\nActie nummer: **${member.actions}**\nTimestamp: \`${Date.now()}\``)
					);
				}

				// Succes!
				await msg.edit(message.embed()
					.setAuthor(member.user.username, member.user.displayAvatarURL())
					.setTitle("Manage: Moderatie acties: Waarschuwen")
					.setDescription(`${member.user} is successvol gewaarschuwd voor **${reason}**!`)
					.setFooter("Druk op ✅ om terug te gaan!")
				);
				let menu = new message.menu(msg, {
					"✅": "terug"
				});
				menu.filter((_reaction, user) => user.id === message.author.id);
				menu.reactie(() => {
					menu.stop();
					menu.clearEmojis();
					this.modMenu(message, msg, member);
				});
				menu.create();
			}, 1000); // 1 sec wachten om de bot "rust" te geven
		});
		collector.on("end", () => {
			if (!canDo) return;
			this.modMenu(message, msg, member);
			msg.edit(message.embed().setDescription("Laden..."));
		});
	}
	mute(message, msg, member) {
		// TODO: Menu maken met tijd (5 minuten, 1 uur, 24 uur, 7 dagen, 30 dagen, permanent en anders)
		// TODO: Reden opgeven, net zoals bij warn
		// TODO: Mute rol stuff
	}
	kick(message, msg, member) {
		msg.edit(message.embed()
			.setAuthor(member.user.username, member.user.displayAvatarURL())
			.setTitle("Manage: Moderatie acties: Kicken")
			.setDescription(`Waarvoor wil je ${member.user.username} kicken? Typ het antwoord in de chat!`)
			.setFooter("Druk op 🛑 om terug te gaan • © Teqix Community")
		);
		let menu = new message.menu(msg, {
			"🛑": "stop"
		});
		menu.filter((_reaction, user) => user.id === message.author.id);
		menu.reactie((reactie) => {
			menu.stop();
			menu.clearEmojis();
			collector.stop();
		});
		menu.create();

		// Collector
		let collector = message.channel.createMessageCollector(m => m.author.id === message.author.id, { time: 1000 * 60 * 60 });
		let canDo = true;
		collector.on("collect", async (m) => {
			if (!canDo) return;
			let reason = m.content;
			canDo = false;
			await menu.stop();
			await menu.clearEmojis();
			m.delete();
			let sure = await this.isSure(msg, message, `Weet je zeker dat je ${member.user.username} wilt kicken voor **${reason}**?`, (_reaction, user) => user.id === message.author.id);
			if (!sure) {
				canDo = true;
				return collector.stop();
			}
			await menu.stop();
			await menu.clearEmojis();
			m.delete();
			let invite = await this.isSure(msg, message, `Wil je deze user ook een invitelink sturen?`, (_reaction, user) => user.id === message.author.id);
			await msg.edit(message.embed()
				.setAuthor(member.user.username, member.user.displayAvatarURL())
				.setTitle("Manage: Moderatie acties: Kicken")
				.setDescription(`Ik ben bezig met ${member.user.username} te kicken voor **${reason}**, geef me een momentje, ik ben niet meer de jongste!`)
			);
			setTimeout(async () => { // In een functie voor betere error catching

				// Userdata updaten
				member.actions++;
				if (!member.user.settings) member.user.settings = await this.client.db.get(`author-${member.user.id}`);
				if (!member.user.settings) member.user.settings = this.client.config.authorSettings;
				member.user.settings.kicks.push({
					by: {
						id: message.author.id,
						username: message.author.username,
						displayAvatarURL: message.author.displayAvatarURL
					},
					time: Date.now(),
					reason: reason,
					channel: {
						id: message.channel.id,
						name: message.channel.name
					},
					actionSessionNumber: member.actions,
					highestRole: message.guild.member(message.author.id).roles.highest.name
				});
				await this.client.db.set(`author-${member.user.id}`, member.user.settings);

				// User bericht sturen
				try {
					member.user.send(message.embed()
						.setTitle("Kick!")
						.setDescription(`Oei, je hebt een kick gekregen van ${message.author}, de reden hiervoor is **${reason}**!\n_Niet mee eens?_ Maak een ticket!`)
					);
					if (invite) {
						message.user.send("https://discord.gg/UmkdrVm")
					}
					// TODO: Met één klik automatisch ticket maken!
				} catch (e) { }

				// Modlogs
				let modlogs = message.guild.channels.cache.find(c => c.name === this.client.config.channels.modlogs);
				if (modlogs) {
					modlogs.send(message.embed()
						.setAuthor(member.user.username, member.user.displayAvatarURL())
						.setTitle(`Kick voor ${member.user.username}`)
						.setDescription(`Gekicked: ${member.user}\nDoor: ${message.author} (Hoogste rol: **${message.guild.member(message.author.id).roles.highest.name}**)\nKanaal: ${message.channel}\nReden: **${reason}**\n\nActie nummer: **${member.actions}**\nTimestamp: \`${Date.now()}\``)
					);
					member.user.kick(reason).then(console.log).catch(console.error);
				}

				// Succes!
				await msg.edit(message.embed()
					.setAuthor(member.user.username, member.user.displayAvatarURL())
					.setTitle("Manage: Moderatie acties: Kicken")
					.setDescription(`${member.user} is successvol gekicked voor **${reason}**!`)
					.setFooter("Druk op ✅ om terug te gaan!")
				);
				let menu = new message.menu(msg, {
					"✅": "terug"
				});
				menu.filter((_reaction, user) => user.id === message.author.id);
				menu.reactie(() => {
					menu.stop();
					menu.clearEmojis();
					this.modMenu(message, msg, member);
				});
				menu.create();
			}, 1000); // 1 sec wachten om de bot "rust" te geven
		});
		collector.on("end", () => {
			if (!canDo) return;
			this.modMenu(message, msg, member);
			msg.edit(message.embed().setDescription("Laden..."));
		});
	}
	ban(message, msg, member) {
		// TODO: Menu maken met hoelang (Alleen als het geen softkick is) (5 minuten, 1 uur, 24 uur, 7 dagen, 30 dagen, permanent en anders)
		// TODO: Menu maken met hv dagen terug berichten moeten worden verwijderd (0 (geen) t/m 7)
		msg.edit(message.embed()
			.setAuthor(member.user.username, member.user.displayAvatarURL())
			.setTitle("Manage: Moderatie acties: Bannen")
			.setDescription(`Waarvoor wil je ${member.user.username} bannen? Typ het antwoord in de chat!`)
			.setFooter("Druk op 🛑 om terug te gaan • © Teqix Community")
		);
		let menu = new message.menu(msg, {
			"🛑": "stop"
		});
		menu.filter((_reaction, user) => user.id === message.author.id);
		menu.reactie((reactie) => {
			menu.stop();
			menu.clearEmojis();
			collector.stop();
		});
		menu.create();

		// Collector
		let collector = message.channel.createMessageCollector(m => m.author.id === message.author.id, { time: 1000 * 60 * 60 });
		let canDo = true;
		collector.on("collect", async (m) => {
			if (!canDo) return;
			let reason = m.content;
			canDo = false;
			await menu.stop();
			await menu.clearEmojis();
			m.delete();
			let sure = await this.isSure(msg, message, `Weet je zeker dat je ${member.user.username} wilt bannen voor **${reason}**?`, (_reaction, user) => user.id === message.author.id);
			if (!sure) {
				canDo = true;
				return collector.stop();
			}
			await menu.stop();
			await menu.clearEmojis();
			m.delete();
			let softban = await this.isSure(msg, message, `Wil je deze server softbannen?`, (_reaction, user) => user.id === message.author.id);
			await menu.stop();
			await menu.clearEmojis();
			if (softban) {
				let invite = await this.isSure(msg, message, `Wil je deze user ook een invitelink sturen?`, (_reaction, user) => user.id === message.author.id);
				await menu.stop();
				await menu.clearEmojis();
			}
			await msg.edit(message.embed()
				.setAuthor(member.user.username, member.user.displayAvatarURL())
				.setTitle("Manage: Moderatie acties: Kicken")
				.setDescription(`Ik ben bezig met ${member.user.username} te bannen voor **${reason}**, geef me een momentje, ik ben niet meer de jongste!`)
			);
			setTimeout(async () => { // In een functie voor betere error catching

				// Userdata updaten
				member.actions++;
				if (!member.user.settings) member.user.settings = await this.client.db.get(`author-${member.user.id}`);
				if (!member.user.settings) member.user.settings = this.client.config.authorSettings;
				member.user.settings.bans.push({
					by: {
						id: message.author.id,
						username: message.author.username,
						displayAvatarURL: message.author.displayAvatarURL
					},
					time: Date.now(),
					reason: reason,
					channel: {
						id: message.channel.id,
						name: message.channel.name
					},
					actionSessionNumber: member.actions,
					highestRole: message.guild.member(message.author.id).roles.highest.name
				});
				await this.client.db.set(`author-${member.user.id}`, member.user.settings);

				// User bericht sturen
				try {
					member.user.send(message.embed()
						.setTitle("Ban!")
						.setDescription(`Oei, je hebt een ban gekregen van ${message.author}, de reden hiervoor is **${reason}**!\n_Niet mee eens?_ Stuur Jesse#5127 een berichtje!`)
					);
					if (invite) {
						message.user.send("https://discord.gg/UmkdrVm")
					}
					// TODO: Met één klik automatisch ticket maken!
				} catch (e) { }

				// Modlogs
				let modlogs = message.guild.channels.cache.find(c => c.name === this.client.config.channels.modlogs);
				if (modlogs) {
					modlogs.send(message.embed()
						.setAuthor(member.user.username, member.user.displayAvatarURL())
						.setTitle(`Ban voor ${member.user.username}`)
						.setDescription(`Gebanned: ${member.user}\nDoor: ${message.author} (Hoogste rol: **${message.guild.member(message.author.id).roles.highest.name}**)\nKanaal: ${message.channel}\nReden: **${reason}**\n\nActie nummer: **${member.actions}**\nTimestamp: \`${Date.now()}\``)
					);
					await member.user.ban({ days: days, reason: reason }).then(console.log).catch(console.error);
					if (softban) {
						await member.user.unban();
					}
				}

				// Succes!
				await msg.edit(message.embed()
					.setAuthor(member.user.username, member.user.displayAvatarURL())
					.setTitle("Manage: Moderatie acties: Bannen")
					.setDescription(`${member.user} is successvol gebanned voor **${reason}**!`)
					.setFooter("Druk op ✅ om terug te gaan!")
				);
				let menu = new message.menu(msg, {
					"✅": "terug"
				});
				menu.filter((_reaction, user) => user.id === message.author.id);
				menu.reactie(() => {
					menu.stop();
					menu.clearEmojis();
					this.modMenu(message, msg, member);
				});
				menu.create();
			}, 1000); // 1 sec wachten om de bot "rust" te geven
		});
		collector.on("end", () => {
			if (!canDo) return;
			this.modMenu(message, msg, member);
			msg.edit(message.embed().setDescription("Laden..."));
		});
	}


	// Weet je het zeker?
	isSure(msg, message, content, filter) {
		return new Promise((res) => {
			msg.edit(message.embed().setDescription("Laden..."));
			let menu = new message.menu(msg, {
				"✅": "ja",
				"❌": "nee"
			});
			menu.filter(filter);
			menu.reactie((reactie) => {
				menu.stop();
				menu.clearEmojis();
				res(reactie.naam === "ja");
			});
			menu.create().then(() => {
				menu.message.edit(message.embed()
					.setTitle("Wacht even!")
					.setDescription(content)
				);
			});
		});
	}



	// Stop functie, met bericht als t is gestopt!
	stopMenu(menu, member, embed) {
		let acties = "acties";
		if (member.actions === 1) acties = "actie";
		menu.message.edit(embed()
			.setAuthor(member.user.username, member.user.displayAvatarURL())
			.setTitle("Manage")
			.setDescription(`Gestopt, ${member.actions} ${acties} ondernomen.`)
		);
	}
}
