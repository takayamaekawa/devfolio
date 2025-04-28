#!/bin/bash

rm -rf ./public
cp -r ./source/_posts/ ./public

find ./public -type f -name '*.md' -exec bash -c '
  FILE="$1"
  FRONT_MATTER=$(head -n 999 "$FILE" | grep -E "^title:|tags:|abbrlink:|date:")
  UPDATED_AT=$(echo "$FRONT_MATTER" | grep -oE "date: (.*)" | sed -E "s/^date: //")

  sed -i "1a updated_at: \"${UPDATED_AT}\"" "$FILE"
  sed -i "2a private: false" "$FILE"
  sed -i "3a id: null" "$FILE"
  sed -i "4a organization_url_name: null" "$FILE"
  sed -i "5a slide: false" "$FILE"
  sed -i "6a ignorePublish: false" "$FILE"
' _ {} \;

# 個別処理したい場合は以下を使用
# declare -a basenames
# while IFS= read -r -d $'\0' file; do
#   basename=$(basename "$file" .md)
#   basenames+=("$basename")
# done < <(find ./source/_posts -type f -name '*.md' -print0)

# for basename in "${basenames[@]}"; do
#   echo "Publishing: $basename.md"
#   npx qiita publish "$basename"
# done

npx qiita publish --all
