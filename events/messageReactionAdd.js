const bot = require('../index');
const utils = require('../utils');
async function handler(msg, emoji, userID){
	if(userID === bot.id) return;
	
	let sessions = await bot.db.sessions.find({});
	if(!sessions.length) return;
	let settings = await bot.db.settings.findOne({});
	if(!settings) return;

	let session = sessions.find(session => session.invited.includes(userID));
	if(!session) return;

	let guild = bot.guilds.get(settings.mainGuildID);
	let vc = guild.channels.get(session.channelID);
	if(!guild || !vc ) return;

	if(emoji.name == '✅'){
		console.log('accept them');
		await vc.editPermission(userID, 1048576, 0, "member", "was invited by host."); // needs to be checked
	}
	if(emoji.name == '❌'){
		await msg.channel.createMessage('you have denied the invite.');
		await msg.delete();
		await bot.db.sessions.update({host: session.host}, { $pull: { invited : userID } }, {});
	}
}
module.exports = {
	event: 'messageReactionAdd',
	enabled: true,
	handler: handler,
};