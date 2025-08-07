#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from "fs";
import { basename, join, dirname } from "path";
import { fileURLToPath } from "url";
import { glob } from "glob";
import { RULE_OF_REPLACER, QIITA_MAP } from "../config/mapping.config.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export function each(targetDir, filename) {
  if (!targetDir || !filename) {
    return;
  }

  const baseFilename = basename(filename, ".md");
  const filepath = join(targetDir, `${baseFilename}.md`);

  if (baseFilename === "*") {
    console.log(`No *.md file is not found at ${targetDir}`);
    process.exit(1);
  }

  if (!QIITA_MAP[baseFilename]) {
    return;
  }

  console.log(
    `Going to replace words against '${filepath}' based on the mapping number(s): ${QIITA_MAP[baseFilename]}`,
  );

  const keys = QIITA_MAP[baseFilename].split(";");

  let content = readFileSync(filepath, "utf8");

  for (const key of keys) {
    const rule = RULE_OF_REPLACER[key];
    if (!rule) continue;

    const [before, after] = rule;

    if (content.includes(before)) {
      console.log(`Replacing: '${before}' -> '${after}' at '${filepath}'`);
      content = content.replace(new RegExp(escapeRegExp(before), "g"), after);
    } else {
      console.log(
        `Info: '${before}' is not found at '${filepath}', so skipped.`,
      );
    }
  }

  writeFileSync(filepath, content);
}

export async function all(targetDir) {
  if (!targetDir) {
    return;
  }

  try {
    const files = await glob(join(targetDir, "*.md"));
    for (const filepath of files) {
      each(targetDir, filepath);
    }
  } catch (error) {
    console.error("Error processing files:", error);
  }
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , targetDir, target] = process.argv;

  if (!targetDir || !target) {
    console.log("Need argument");
    console.log(
      'Arg1: directory path that have *.md files like "qiita/public" or anything',
    );
    console.log('Arg2: "*.md" file name of target of doing replacer');
    console.log('If you set "all" as arg2, replacing text for all *.md files.');
    process.exit(1);
  }

  if (target === "all") {
    await all(targetDir);
  } else {
    each(targetDir, target);
  }
}
