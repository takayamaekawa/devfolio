#!/usr/bin/env node

import { each, all } from "./mapping.js";

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
