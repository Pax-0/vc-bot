const bot = require('../index');
module.exports.generator = async (msg) => {
    await bot.db.settings.update({}, { $set: { mainGuildID : msg.channel.guild.id } }, {});
    await bot.db.settings.update({}, { $set: { setup : true } }, {});
    await msg.channel.createMessage('Finished!');
};

module.exports.options = {
	name: 'setup',
	description: 'gathers important info.',
	enabled: true,
	fullDescription:'save important info to db.',
    usage:'',
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