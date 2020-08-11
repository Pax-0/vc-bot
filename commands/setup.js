const bot = require('../index');
module.exports.generator = async (msg, args) => {
	if(args.length < 3) return 'Invalid usage, please use `?help setup` for detailed usage.';
	let hosts = resolveRole(args[0], msg.channel.guild);
	if(!hosts) return msg.channel.createMessage('i couldnt resolve the hosts\' role, please try again.');
	let viewers = resolveRole(args[1], msg.channel.guild);
	if(!viewers) return msg.channel.createMessage('i couldnt resolve the viewers\' role, please try again.');
	let mainCategory = resolveChannel(args[2], msg.channel.guild);
	if(!mainCategory) return msg.channel.createMessage('i couldnt find the main voice channel category, please try again.');
	try {
		await bot.db.settings.update({}, { $set: { mainGuildID : msg.channel.guild.id } }, {});
		await bot.db.settings.update({}, { $set: { hosts : hosts.id } }, {});
		await bot.db.settings.update({}, { $set: { viewers : viewers.id } }, {});
		await bot.db.settings.update({}, { $set: { mainCategory : mainCategory.id } }, {});
		await bot.db.settings.update({}, { $set: { setup : true } }, {});
		return msg.channel.createMessage('Finished!');	
	} catch (error) {
		console.log(error);
		return msg.channel.createMessage('There was an error during processing.');	
	}
};
function resolveChannel(string, guild){
	let channel = guild.channels.get(string) || guild.channels.find(channel => channel.mention === string) || guild.channels.find(channel => channel.name === string);

	return channel;
}
function resolveRole(string, guild){
	let channel = guild.roles.get(string) || guild.roles.find(role => role.mention === string) || guild.roles.find(role => role.name === string);

	return channel;
}
module.exports.options = {
	name: 'setup',
	description: 'gathers important info.',
	enabled: true,
	fullDescription:'save important info to db.',
	usage:'@hosts @viewrs <Main VC category here>',
	aliases: ['s'],
	guildOnly: true,
	requirements: {
		custom: async (msg) => {
			const settings = await bot.db.settings.findOne({});
			if(settings.owners.includes(msg.author.id)) return true;
			return false;
		}
	}
};