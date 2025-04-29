#!/bin/bash

declare -A QIITA_REPLACER=(
  ["1"]="https://verazza.f5.si/posts/8821/;https://qiita.com/verazza/items/f563b57505808f5bfaeb"
  ["2"]="If there are any replaced words;write here"
)

declare -A QIITA_MAP=(
  ["生成AIとの共生1"]="1;2"
)

each() {
  if [[ $# -le 1 ]]; then
    return
  fi

  target_dir=$1
  filename=$(basename "$2" ".md")
  filepath="${target_dir}/${filename}.md"

  if [[ $filename == "*" ]]; then
    echo "No *.md file is not found at ${target_dir}"
    exit
  fi

  if ! [[ -n "${QIITA_MAP[$filename]}" ]]; then
    return
  fi

  echo "Going to replace words against '$filepath' based on the mapping number(s): ${QIITA_MAP[$filename]}"

  IFS=';' read -ra keys <<<"${QIITA_MAP[$filename]}"

  for key in "${keys[@]}"; do
    IFS=';' read -r before after <<<"${QIITA_REPLACER[$key]}"
    if grep -qF "$before" "$filepath"; then
      echo "Replaceing: '$before' -> '$after' at '$filepath'"
      # sed -i "s|$before|$after|g" "$filepath"
    else
      echo "Info: '$before' is not found at '$filepath', so skipped."
    fi
  done
}

all() {
  if ! [[ $# -gt 0 ]]; then
    return
  fi

  target_dir=$1
  for filepath in "$target_dir"/*.md; do
    each "$target_dir" "$filepath"
  done
}
