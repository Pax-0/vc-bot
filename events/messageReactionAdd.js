async function handler(msg, emoji, userID){
	let sessions = await bot.db.sessions.find();
	if(!sessions.length) return;

	let session = sessions.find(session => session.invited.includes(userID));
	if(!session) return;

	console.log(emoji);

}
module.exports = {
	event: 'messageReactionAdd',
	enabled: true,
	handler: handler,
};