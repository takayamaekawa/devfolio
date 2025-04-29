#!/bin/bash

ROOT_QIITA="qiita"
SOURCE="source/_posts"

cd "$(dirname "$0")"

current_quotepath=$(git config --get core.quotepath)
if [ "$current_quotepath" != "false" ]; then
  echo "Setting core.quotepath to false to handle Japanese filenames correctly."
  git config --global core.quotepath false
fi

mkdir -p "${ROOT_QIITA}/public"

if [[ $# -gt 0 && $1 == "force" ]]; then
  CHANGED_FILES=$(git ls-files "${SOURCE}/*.md")
else
  CHANGED_FILES=$(git diff --name-only | grep "${SOURCE}/.*\.md$")
fi

if [ -z "$CHANGED_FILES" ]; then
  echo "No .md files changed since last commit."
else
  echo "Changed .md files:"
  while IFS= read -r file; do
    echo "- $file"

    source_file="$file"
    target_file="${ROOT_QIITA}/public/$(basename "$source_file")"

    if [[ -f "$target_file" ]]; then
      echo "File exists: $source_file -> $target_file"

      temp_file="${target_file}.temp"
      mv "$target_file" "$temp_file"

      cp "$source_file" "$target_file"

      TEMP_FRONT_MATTER=$(head -n 999 "$temp_file" | grep -E "^updated_at:|private:|id:|organization_url_name:|slide:|ignorePublish:")
      TEMP_UPDATED_AT=$(echo "$TEMP_FRONT_MATTER" | grep -oE "^updated_at: (.*)$" | sed -E "s/^updated_at: //")
      TEMP_PRIVATE=$(echo "$TEMP_FRONT_MATTER" | grep -oE "^private: (.*)$" | sed -E "s/^private: //")
      TEMP_ID=$(echo "$TEMP_FRONT_MATTER" | grep -oE "^id: (.*)$" | sed -E "s/^id: //")
      TEMP_ORG_URL=$(echo "$TEMP_FRONT_MATTER" | grep -oE "^organization_url_name: (.*)$" | sed -E "s/^organization_url_name: //")
      TEMP_SLIDE=$(echo "$TEMP_FRONT_MATTER" | grep -oE "^slide: (.*)$" | sed -E "s/^slide: //")
      TEMP_IGNORE=$(echo "$TEMP_FRONT_MATTER" | grep -oE "^ignorePublish: (.*)$" | sed -E "s/^ignorePublish: //")

      if [ -n "$TEMP_UPDATED_AT" ]; then
        sed -i "1a updated_at: ${TEMP_UPDATED_AT}" "$target_file"
      fi
      sed -i "2a private: ${TEMP_PRIVATE}" "$target_file"
      if [ -n "$TEMP_ID" ]; then
        sed -i "3a id: ${TEMP_ID}" "$target_file"
      fi
      if [ -n "$TEMP_ORG_URL" ]; then
        sed -i "4a organization_url_name: ${TEMP_ORG_URL}" "$target_file"
      fi
      sed -i "5a slide: ${TEMP_SLIDE}" "$target_file"
      sed -i "6a ignorePublish: ${TEMP_SLIDE}" "$target_file"

      rm "$temp_file"
    else
      echo "New file: $source_file -> $target_file"

      cp "$source_file" "$target_file"
      FRONT_MATTER=$(head -n 999 "$target_file" | grep -E "^title:|tags:|abbrlink:|date:")
      UPDATED_AT=$(echo "$FRONT_MATTER" | grep -oE "^date: (.*)$" | sed -E "s/^date: //")
      sed -i "1a updated_at: \"${UPDATED_AT}\"" "$target_file"
      sed -i "2a private: false" "$target_file"
      sed -i "3a id: null" "$target_file"
      sed -i "4a organization_url_name: null" "$target_file"
      sed -i "5a slide: false" "$target_file"
      sed -i "6a ignorePublish: false" "$target_file"
    fi

    md_basename=$(basename "$source_file" .md)
    if [ -f "mapping.sh" ]; then
      . mapping.sh
      each "$ROOT_QIITA/public" "$md_basename"
    fi
    npx qiita publish --root "${ROOT_QIITA}" --force "$md_basename"
  done <<<"$CHANGED_FILES"
fi
