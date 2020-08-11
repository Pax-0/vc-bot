function resolveMember(string, guild){
	let member = guild.members.get(string) || guild.members.find(m => m.user.mention === string) || guild.members.find(m => m.username === string) || guild.members.find(m => m.nick === string);
	return member;
}
async function resolveUser(string, bot){
	let user;
	try {
		user = bot.users.get(string) || bot.users.find(m => m.mention === string) || bot.users.find(m => m.username === string) || await bot.getRESTUser(string);	
	} catch (error) {
		console.log(error);
		return null;
	}
	return user;
}
async function loadDefaultDbSettings(bot){
	const doc = {
		setup: false,
        mainGuildID: null,
		hosts: null,
		viewers: null,
        owners: ['411282954250092564', '143414786913206272'],
        mainCategory: null
	}; // add the doc if it dosnt exist already.
	await bot.db.settings.insert(doc);
	return;
}
async function checkDBSettings(bot){
	const settings = await bot.db.settings.findOne({});
	if(!settings) return loadDefaultDbSettings(bot);
}
module.exports = {
	resolveMember,
	resolveUser,
	loadDefaultDbSettings,
	checkDBSettings
};