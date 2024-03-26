import fs from "node:fs/promises";
import path from "node:path";
import { meta } from "./meta.js";

export async function buggy(
  config = {
    commands: path.resolve(path.join(".", "commands")),
    exts: [".js"],
  },
) {
  const commands = await loadCommands(config);

  if (process.argv[2] === "help") {
    globalHelp(commands, config);
    return;
  } else if (process.argv[2] === "run") {
    await run(commands, config);
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
      if (cmd.route && cmd.default) {
        cmds.push(cmd);
      }
    }
  }

  return cmds;
}

function globalHelp() {
  console.log(`Buggy ${meta.version}`);
  console.log();
  console.log(`Usage: buggy [operation]`);
  console.log();
  console.log("Operations:");
  console.log("  help\t\tShow this help message");
  console.log("  run\t\tRun a command");
  console.log("  serve\t\tStart the web server");
}

function runHelp(commands) {
  console.log(`Buggy ${meta.version}`);
  console.log();
  console.log(`Usage: buggy run [command]`);
  console.log();
  console.log("Commands:");
  for (const cmd of commands) {
    console.log(`  ${cmd.route}\t\t${cmd.desc}`);
  }
}

async function run(commands, config) {
  const wantCmd = process.argv[3];

  if (!wantCmd) {
    runHelp(commands, config);
    return;
  }

  const found = commands.find((cmd) => cmd.route === wantCmd);
  if (!found) {
    console.error(`Command ${wantCmd} not found`);
    return;
  }

  const args = process.argv.slice(4);
  const result = await found.default(...args);
  console.log(result);
}
