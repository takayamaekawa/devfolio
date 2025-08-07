#!/bin/bash

. scripts/mapping.sh

if [[ $# -le 1 ]]; then
  echo -e "Need argument\nArg1: directory path that have *.md files like \"qiita/public\" or anything\nArg2: \"*.md\" file name of target of doing replacer\nIf you set \"all\" as arg2, replacing text for all *.md files."
  exit
fi

TARGET_DIR="$1"

if [[ $2 == "all" ]]; then
  all "$TARGET_DIR"
else
  each "$TARGET_DIR" "$2"
fi
