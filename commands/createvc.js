
const bot = require('../index');
module.exports.generator = async (msg, args) => {
    const settings = await bot.db.settings.findOne({});
    if(!settings) return msg.channel.createMessage('there was an error, please try again later.');
    let currenSession = await bot.db.sessions.findOne({host: msg.author.id});
    if(currenSession) return msg.channel.createMessage('You have already created a voice channel.');

    let sent = await msg.channel.createMessage('Creating voice channel...');
    let vc = await createVC(msg.channel.guild, msg.author.username, settings, args[0] ? args[0] : 5);
    let session = {
        host: msg.author.id,
        channelID: vc.id,
        lastSeen: Date.now(),
        invited: []
    }
    await bot.db.sessions.insert(session);
    return sent.edit('Voice channel created!')
};

async function createVC(guild, name, settings, slots){
    let mainCategory = guild.channels.get(settings.mainCategory);
    if(!mainCategory) return msg.channel.createMessage('Couldnt find the main VC category, please let an admin know.');
    return guild.createChannel(name, 2, {parentID: mainCategory.id, userLimit: slots});
}
module.exports.options = {
	name: 'createvc',
	description: 'Creates a voice channel.',
	enabled: true,
	fullDescription:'This can be used by hosts to create a voice channel with a specific member limit.',
    usage:'2',
    requirements: {
		custom: async (msg) => {
			const settings = await bot.db.settings.findOne({});
			if(settings.owners.includes(msg.author.id)) return true;
			if( msg.member.roles.includes(settings.roles.hosts) ) return true;
			return false;
		}
	}
};