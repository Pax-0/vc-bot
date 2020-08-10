
const bot = require('../index');

module.exports.generator = async (msg, args) => {
    const settings = await bot.db.settings.findOne({});
    if(!settings) return msg.channel.createMessage('there was an error, please try again later.');
    if(!settings.setup) return msg.channel.createMessage('Please use the setup command first.');
    let currenSession = await bot.db.sessions.findOne({host: msg.author.id});
    if(currenSession) return msg.channel.createMessage('You have already created a voice channel.');
    try {
        let sent = await msg.channel.createMessage('Creating voice channel...');
        let vc = await createVC(msg.channel.guild, msg.author.username, settings, args[0] ? args[0] : 5);
        await vc.editPermission('462687980981846036', 1048576, 0, "role", "session started."); // give hosts and viewers the connect perm, and deny it for @everyone
        await vc.editPermission('367316843318345739', 1048576, 0, "role", "session started.");
        await vc.editPermission(msg.channel.guild.id, 0, 1048576, "role", "session started.");
        let session = {
            host: msg.author.id,
            channelID: vc.id,
            lastSeen: Date.now(),
            invited: []
        }
        await bot.db.sessions.insert(session);
        return sent.edit('Voice channel created!')
    } catch (error) {
        console.log(error);
        return msg.channel.createMessage('There was an error when creating the channel, check my perms and try again.')
    }
};

async function createVC(guild, name, settings, slots){
    let mainCategory = guild.channels.get(settings.mainCategory);
    if(!mainCategory) return msg.channel.createMessage('Couldnt find the main VC category, please let an admin know.');
    let vc = await guild.createChannel(name, 2, {parentID: mainCategory.id, userLimit: slots});
    return vc;
}
module.exports.options = {
    name: 'createvc',
    aliases: ['makevc', 'cvc', 'addvc', 'createvoicechannel'],
    guildOnly: true,
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