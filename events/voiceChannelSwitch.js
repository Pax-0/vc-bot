const bot = require('../index');

async function handler(member, newChannel, oldChannel){
    let session = await bot.db.sessions.findOne({host: member.id});
    if(!session) return;
    
    if(await bot.db.sessions.findOne({channelID: newChannel.id})){
        let session = await bot.db.sessions.findOne({channelID: newChannel.id})
        if(!session) return;
        return bot.db.sessions.update({host: member.id}, { $set: { lastSeen: Date.now() } }, {});
    }
    if(await bot.db.sessions.findOne({channelID: oldChannel.id})){
        let session = await bot.db.sessions.findOne({channelID: oldChannel.id})
        if(!session) return;
        return bot.db.sessions.update({host: member.id}, { $set: { lastSeen: Date.now() } }, {});
    }
}
module.exports = {
	event: 'voiceChannelSwitch',
	enabled: true,
	handler: handler,
};