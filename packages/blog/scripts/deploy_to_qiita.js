#!/usr/bin/env node

import { execSync } from "child_process";
import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  unlinkSync,
  copyFileSync,
} from "fs";
import { dirname, basename, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_QIITA = "../qiita";
const SOURCE = "../source/_posts";

// Change to project root directory
process.chdir(join(__dirname, ".."));

// Configure git quotepath for Japanese filenames
try {
  const currentQuotePath = execSync("git config --get core.quotepath", {
    encoding: "utf8",
  }).trim();
  if (currentQuotePath !== "false") {
    console.log(
      "Setting core.quotepath to false to handle Japanese filenames correctly.",
    );
    execSync("git config --global core.quotepath false");
  }
} catch (error) {
  // Config doesn't exist, set it
  console.log(
    "Setting core.quotepath to false to handle Japanese filenames correctly.",
  );
  execSync("git config --global core.quotepath false");
}

// Create directory
mkdirSync(`${ROOT_QIITA}/public`, { recursive: true });

// Get changed files
let changedFiles = "";
if (process.argv.includes("force")) {
  try {
    changedFiles = execSync(`git ls-files "${SOURCE}/*.md"`, {
      encoding: "utf8",
    });
  } catch (error) {
    changedFiles = "";
  }
} else {
  try {
    changedFiles = execSync(
      `git diff --name-only | grep "${SOURCE}/.*\\.md$"`,
      { encoding: "utf8" },
    );
  } catch (error) {
    changedFiles = "";
  }
}

if (!changedFiles.trim()) {
  console.log("No .md files changed since last commit.");
} else {
  console.log("Changed .md files:");
  const files = changedFiles
    .trim()
    .split("\n")
    .filter((file) => file.trim());

  for (const file of files) {
    console.log(`- ${file}`);

    const sourceFile = file;
    const targetFile = `${ROOT_QIITA}/public/${basename(sourceFile)}`;

    if (existsSync(targetFile)) {
      console.log(`File exists: ${sourceFile} -> ${targetFile}`);

      const tempFile = `${targetFile}.temp`;
      copyFileSync(targetFile, tempFile);
      copyFileSync(sourceFile, targetFile);

      // Extract metadata from temp file
      const tempContent = readFileSync(tempFile, "utf8");
      const tempLines = tempContent.split("\n").slice(0, 999);
      const tempFrontMatter = tempLines.filter((line) =>
        line.match(
          /^updated_at:|private:|id:|organization_url_name:|slide:|ignorePublish:/,
        ),
      );

      const extractValue = (pattern) => {
        const line = tempFrontMatter.find((l) => l.match(pattern));
        return line ? line.replace(pattern, "").trim() : "";
      };

      const tempUpdatedAt = extractValue(/^updated_at:\s*/);
      const tempPrivate = extractValue(/^private:\s*/);
      const tempId = extractValue(/^id:\s*/);
      const tempOrgUrl = extractValue(/^organization_url_name:\s*/);
      const tempSlide = extractValue(/^slide:\s*/);
      const tempIgnore = extractValue(/^ignorePublish:\s*/);

      // Update target file with metadata
      let targetContent = readFileSync(targetFile, "utf8");
      const targetLines = targetContent.split("\n");

      let insertIndex = 1;
      if (tempUpdatedAt) {
        targetLines.splice(insertIndex++, 0, `updated_at: ${tempUpdatedAt}`);
      }
      targetLines.splice(insertIndex++, 0, `private: ${tempPrivate}`);
      if (tempId) {
        targetLines.splice(insertIndex++, 0, `id: ${tempId}`);
      }
      if (tempOrgUrl) {
        targetLines.splice(
          insertIndex++,
          0,
          `organization_url_name: ${tempOrgUrl}`,
        );
      }
      targetLines.splice(insertIndex++, 0, `slide: ${tempSlide}`);
      targetLines.splice(insertIndex++, 0, `ignorePublish: ${tempIgnore}`);

      writeFileSync(targetFile, targetLines.join("\n"));
      unlinkSync(tempFile);
    } else {
      console.log(`New file: ${sourceFile} -> ${targetFile}`);

      copyFileSync(sourceFile, targetFile);
      let targetContent = readFileSync(targetFile, "utf8");
      const targetLines = targetContent.split("\n");
      const frontMatter = targetLines
        .slice(0, 999)
        .filter((line) => line.match(/^title:|tags:|abbrlink:|date:/));

      const dateLine = frontMatter.find((l) => l.match(/^date:/));
      const updatedAt = dateLine
        ? dateLine.replace(/^date:\s*/, "").trim()
        : "";

      let insertIndex = 1;
      targetLines.splice(insertIndex++, 0, `updated_at: "${updatedAt}"`);
      targetLines.splice(insertIndex++, 0, "private: false");
      targetLines.splice(insertIndex++, 0, "id: null");
      targetLines.splice(insertIndex++, 0, "organization_url_name: null");
      targetLines.splice(insertIndex++, 0, "slide: false");
      targetLines.splice(insertIndex++, 0, "ignorePublish: false");

      writeFileSync(targetFile, targetLines.join("\n"));
    }

    // Apply mapping rules
    const mdBasename = basename(sourceFile, ".md");
    if (existsSync("scripts/mapping.js")) {
      const { each } = await import("./mapping.js");
      each(`${ROOT_QIITA}/public`, mdBasename);
    }

    // Publish to Qiita
    try {
      execSync(
        `npx qiita publish --root "${ROOT_QIITA}" --force "${mdBasename}"`,
        { stdio: "inherit" },
      );
    } catch (error) {
      console.error(`Failed to publish ${mdBasename}:`, error.message);
    }
  }
}
