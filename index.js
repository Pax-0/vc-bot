const fs = require('fs');
const eris = require('eris');
const Datastore = require('nedb-promises');
const cron = require('node-cron');
const utils = require('./utils');

const {token} = require('./config.json');
const clientOptions = {
	autoreconnect: true,
	getAllUsers: true,
	restMode: true,
	defaultImageFormat: 'png',

};
const commandOptions = {
	description: 'a server-specific bot',
	name: 'VC-bot',
	owner: 'IronicTrqsh',
	prefix: ['@mention', '?'],
};

const bot = new eris.CommandClient(token, clientOptions, commandOptions);


bot.on('ready', async () => { // When the bot is ready
	console.log(`Logged is as ${bot.user.username}!`); // Log "Ready!"
	await loadCommands('./commands');
	await loadEvents('./events');
	await loadDB(bot);
	await utils.checkDBSettings(bot);
	await startVCHostTimeoutCheck(bot);
});

async function loadDB(bot){
	const settingsStore = Datastore.create('./data/settings.db');
	const sessionsStore = Datastore.create('./data/sessions.db');
	bot.db = {
		settings: settingsStore,
		sessions: sessionsStore
	};
	
	await bot.db.settings.load();
	await bot.db.sessions.load();
	return console.log('Connected to DB!');
}

async function loadEvents(dir){
	let events = await fs.readdirSync(dir);
	if(!events.length) return console.log('No events found!');

	for(const eventFile of events){
		let event = require(`./events/${eventFile}`);
		// console.log(`loading event: ${event.event}`)
		// console.log(eventFile);
		if (event.enabled) {
			bot[event.once ? 'once' : 'on'](event.event, event.handler);
			console.log('Loaded handler for ' + event.event);
		}
	}
}
async function loadCommands(dir){
	let commands = await fs.readdirSync(dir);
	if(!commands.length) return console.log('Error: no commands found.');
	for(const commandFile of commands){
		let command = require(`./commands/${commandFile}`);
		if(command.options.enabled && command.options.hasSubCommands && command.options.subCommands.length ){
			console.log(`loading parent command: ${command.options.name}`);
			let parent = await bot.registerCommand(command.options.name, command.generator, command.options);
			command.options.subCommands.forEach(async element => {
				let subcmd = require(`./commands/${command.options.name}_${element}`);
				await parent.registerSubcommand(element, subcmd.generator, subcmd.options);    
				console.log(`loading sub command: ${subcmd.options.name} of ${parent.label}`);
			});
		}
		else if(command.options.enabled && !command.options.isSubCommand){
			console.log(`loading command: ${command.options.name}`);
			await bot.registerCommand(command.options.name, command.generator, command.options);
		}
	}
}
async function startVCHostTimeoutCheck(bot){
	const settings = await bot.db.settings.findOne({});
	if(!settings) return console.log('there was an error, please try again later.');
	let guild = bot.guilds.get(settings.mainGuildID);
	if(!guild) return;

	cron.schedule('* * * * *', async () => {
		const sessions = await bot.db.sessions.find({});
		if(!sessions.length) return;
		for(const session of sessions){
			let host = await utils.resolveUser(session.host, bot);
			if(!host) return;
			let vc = guild.channels.get(session.channelID);
			if(!vc) return;

			if(vc.voiceMembers.find(m => m.id === session.host)) return; // console.log('the host is still in the channel');
			if( !isNaN(session.lastSeen) && Date.now() - session.lastSeen > 120000){ // the limit for timeout
				await vc.delete('Host timed out.');
				console.log('a host timed out');
				return bot.db.sessions.remove({host: host.id}, {}, {});
			}
		}
	});
}
bot.connect();

module.exports = bot;
