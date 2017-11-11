const Discord = require('discord.js');
const run = require('./run');
const config = require('./config');

config.startString = config.startString || "$";

const client = new Discord.Client();

client.on('message', function(msg) {
	const content = msg.content;
	if(content && content.startsWith(config.startString)) {
		let expr = content.substring(config.startString.length);
		console.log(expr);
		if(expr.startsWith(" ")) {
			expr = expr.substring(1);
			run(expr, msg);
		}
		else if(expr.startsWith("^C")) {
			run.cache[expr.substring(2).trim()].proc.kill("SIGTERM");
		}
		else if(expr.startsWith("-9")) {
			run.cache[expr.substring(2).trim()].kill();
		}
	}
});

client.login(config.token);
