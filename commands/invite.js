const bot = require('../index');
const utils = require('../utils');

module.exports.generator = async (msg, args) => {
    const settings = await bot.db.settings.findOne({});
    if(!settings) return msg.channel.createMessage('there was an error, please try again later.');

    let currenSession = await bot.db.sessions.findOne({host: msg.author.id});
    if(!currenSession) return msg.channel.createMessage('You arent hosting a voice session currently.');
    
    let invited = utils.resolveMember(args.join(''), msg.channel.guild);
    if(!invited) return msg.channel.createMessage('Couldnt find that user.');
    if(!msg.channel.guild.members.get(invited.id)) return msg.channel.createMessage('Please mention a valid guild member.');

    let DM = await invited.getDMChannel();
    let sent = await DM.createMessage(`You have been invited to join ${msg.author.mention}'s voice session, please react below to accept/deny the invitation.`);
    await sent.addReaction('✅');
    await sent.addReaction('❌');
    return bot.db.sessions.update({host: msg.author.id}, { $addToSet: { invited : invited.id } }, {});
};

module.exports.options = {
	name: 'inv',
	description: 'invites a user to a voice channel.',
	enabled: true,
	fullDescription:'Sends an invite to a user.',
    usage:'@Someone',
    requirements: {
		custom: async (msg) => {
			const settings = await bot.db.settings.findOne({});
			if(settings.owners.includes(msg.author.id)) return true;
			if( msg.member.roles.includes(settings.roles.hosts) ) return true;
			return false;
		}
	}
};