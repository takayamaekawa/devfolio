#!/bin/bash

declare -A RULE_OF_REPLACER=(
  ["1"]="https://maekawa.dev/blog/posts/8821/;https://qiita.com/takaya_maekawa/items/f563b57505808f5bfaeb"
  ["2"]="https://maekawa.dev/blog/posts/30026/;https://qiita.com/takaya_maekawa/items/ec148675aff054350867"
  ["3"]="https://maekawa.dev/blog/posts/14653/;https://qiita.com/takaya_maekawa/items/522d6bd4666d9537c27f"
  ["4"]="/images/deploy_to_qiita_sh.png;https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/3628758/e2858c39-162b-4446-80eb-0e73220a9e48.png"
  ["5"]="/images/jack_graph.png;https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/3628758/e1e25ade-583d-4dfe-8a88-0181888877f7.png"
  ["6"]="https://maekawa.dev/blog/posts/47392/;https://qiita.com/takaya_maekawa/items/65452a2b670b6cc7114a"
  ["x"]="If there are any replaced words(before replacing);add here(after replacing)"
)

declare -A QIITA_MAP=(
  ["生成AIとの共生1"]="1;x"
  ["生成AIとの共生2"]="2"
  ["WSLを使う！-Windows開発環境構築"]="3;6"
  ["QiitaとHexoで同時投稿をするために"]="3;4"
  ["OBSやVBCableを使わずに音声を内部ルーティング"]="5"
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
    IFS=';' read -r before after <<<"${RULE_OF_REPLACER[$key]}"
    if grep -qF "$before" "$filepath"; then
      echo "Replaceing: '$before' -> '$after' at '$filepath'"
      sed -i "s|$before|$after|g" "$filepath"
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
