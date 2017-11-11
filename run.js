const config = require('./config');
const childProcess = require('child_process');

if(typeof config.ssh === "string") config.ssh = [config.ssh];

module.exports = function(cmd, msg) {
	const id = Math.random().toString(36).substring(2, 5);
	const proc = childProcess.spawn('ssh', config.ssh.concat(cmd), {
		timeout: 1000000
	});
	let killed = false;

	module.exports.cache[id] = {
		proc,
		kill: function() {
			proc.kill("SIGKILL");
			killed = true;
		}
	};

	function reply(segment) {
		if(killed) return;
		return msg.reply("["+id+"] "+segment);
	}

	let lastCall = Promise.resolve();
	proc.stdout.on('data', data => {
		data = data.toString('utf8');
		for(let i = 0; i < data.length; i += 1950) {
			const segment = data.substring(i, i+1950).replace(/`/g, '\u1fef');
			lastCall = lastCall.then(() => reply("```"+segment+"```"));
		}
	});
	proc.stderr.on('data', data => {
		data = data.toString('utf8');
		for(let i = 0; i < data.length; i += 1950) {
			const segment = data.substring(i, i+1950).replace(/`/g, '\u1fef');
			lastCall = lastCall.then(() => reply("`"+segment+"`"));
		}
	});

	proc.on('close', code => {
		lastCall = lastCall.then(() => msg.reply("["+id+"] exited with code "+code));
		lastCall.then(function() {
			delete module.exports.cache[id];
		});
	});

	proc.stdin.end();
};

module.exports.cache = {};
