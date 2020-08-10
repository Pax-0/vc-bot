
module.exports.generator = async (msg) => {
	// console.log(msg, args);
	let time = Date.now();
	const sent = await msg.channel.createMessage('Pong!');
	return sent.edit(`Pong! ${Date.now() - time}\`ms\``);
};

module.exports.options = {
	name: 'ping',
	description: 'Pings the bot.',
	enabled: true,
	fullDescription:'Tests the bots latency',
	usage:'',
};