const bot = require('../index');
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
		await vc.editPermission(userID, 1048576, 0, 'member', 'was invited by host.');
		await msg.channel.createMessage('you have accepted the invite, you should be able to connect now.');
		await msg.delete();
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