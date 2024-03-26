import fs from "node:fs/promises";
import path from "node:path";

export async function buggy(
  config = {
    commands: path.resolve(path.join(".", "commands")),
    exts: [".js"],
  },
) {
  await loadCommands(config);
}

async function loadCommands(config) {
  console.log(config);

  const cmds = [];

  const files = await fs.readdir(config.commands, {
    withFileTypes: true,
    recursive: true,
  });
  for (const file of files) {
    if (file.isFile() && config.exts.includes(path.extname(file.name))) {
      cmds.push(await import(path.join(file.path, file.name)));
    }
  }

  return cmds;
}
