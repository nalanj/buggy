import fs from "node:fs/promises";
import path from "node:path";
import { meta } from "./meta.js";
import { serve } from "./serve.js";

export async function buggy(
	config = {
		commands: path.resolve(path.join(".", "commands")),
		exts: [".js"],
	},
) {
	if (!process.argv[2] || process.argv[2] === "help") {
		globalHelp();
		return;
	}

	const commands = await loadCommands(config);

	if (process.argv[2] === "run") {
		await run(commands, config);
		return;
	}

	if (process.argv[2] === "serve") {
		await serve(commands, config);
		return;
	}
}

async function loadCommands(config) {
	const cmds = [];

	const files = await fs.readdir(config.commands, {
		withFileTypes: true,
		recursive: true,
	});

	for (const file of files) {
		if (file.isFile() && config.exts.includes(path.extname(file.name))) {
			const cmd = await import(path.join(file.path, file.name));
			if (cmd.default) {
				cmds.push(cmd);
			}
		}
	}

	return cmds;
}

function globalHelp() {
	console.log(`Buggy ${meta.version}`);
	console.log();
	console.log("Usage: buggy [operation]");
	console.log();
	console.log("Operations:");
	console.log("  help\t\tShow this help message");
	console.log("  run\t\tRun a command");
	console.log("  serve\t\tStart the web server");
}

function runHelp(commands) {
	console.log(`Buggy ${meta.version}`);
	console.log();
	console.log("Usage: buggy run [command]");
	console.log();
	console.log("Commands:");
	for (const cmd of commands) {
		if (cmd.name) {
			console.log(`  ${cmd.name}\t\t${cmd.desc}`);
		}
	}
}

async function run(commands, config) {
	const wantCmd = process.argv[3];

	if (!wantCmd) {
		runHelp(commands, config);
		return;
	}

	const found = commands.find((cmd) => cmd.name === wantCmd);
	if (!found) {
		console.error(`Command ${wantCmd} not found`);
		return;
	}

	const args = process.argv.slice(4);
	const result = await found.default(...args);

	let output;
	let status;

	if (result.status) {
		output = result.payload;
		status = result.status;
	} else {
		output = result;
		status = 200;
	}

	if (status !== 200) {
		console.error(`Command returned error: ${StatusMessage[status]}`);
		process.exit(status || 2);
	} else {
		console.log(JSON.stringify(output, null, 2));
		process.exit(0);
	}
}

const Status = {
	OK: 200,
	NotFound: 404,
};

const StatusMessage = {
	200: "OK",
	404: "Not Found",
};

export function wrapOutput(status, payload) {
	return { status, payload };
}

export function ok(payload) {
	return wrapOutput(Status.OK, payload);
}

export function notFound() {
	return wrapOutput(Status.NotFound);
}

export function query(name) {
	return { type: "query", name };
}

export function route(name) {
	return { type: "route", name };
}
