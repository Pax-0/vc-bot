const bot = require('../index');

async function handler(member){
	let session = await bot.db.sessions.findOne({host: member.id});
	if(!session) return;
    
	return bot.db.sessions.update({host: member.id}, { $set: { lastSeen: Date.now() } }, {});
}
module.exports = {
	event: 'voiceChannelLeave',
	enabled: true,
	handler: handler,
};