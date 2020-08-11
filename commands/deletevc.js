
const bot = require('../index');

module.exports.generator = async (msg) => {
	const settings = await bot.db.settings.findOne({});
	if(!settings) return msg.channel.createMessage('there was an error, please try again later.');
	if(!settings.setup) return msg.channel.createMessage('Please use the setup command first.');

	let currenSession = await bot.db.sessions.findOne({host: msg.author.id});
	if(!currenSession) return msg.channel.createMessage('You are not hosting a voice channel session currently.');

	let sent = await msg.channel.createMessage('Deleting voice channel...');
	let vc = msg.channel.guild.channels.get(currenSession.channelID);
	if(!vc) return 'Voice channel not found.';
	await vc.delete('Host finished their VC session.');

	await bot.db.sessions.remove(currenSession);
	return sent.edit('Voice channel deleted!');
};

module.exports.options = {
	name: 'delvc',
	aliases: ['deletevc', 'dvc', 'removevc', 'removevoicechannel'],
	guildOnly: true,
	description: 'deletes a voice channel.',
	enabled: true,
	fullDescription:'This can be used by hosts to delete a voice channel.',
	usage:'',
	requirements: {
		custom: async (msg) => {
			const settings = await bot.db.settings.findOne({});
			if(settings.owners.includes(msg.author.id)) return true;
			if( msg.member.roles.includes(settings.hosts) ) return true;
			return false;
		}
	}
};