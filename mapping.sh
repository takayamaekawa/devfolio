#!/bin/bash

declare -A RULE_OF_REPLACER=(
  ["1"]="https://verazza.f5.si/posts/8821/;https://qiita.com/verazza/items/f563b57505808f5bfaeb"
  ["2"]="https://verazza.f5.si/posts/30026/;https://qiita.com/verazza/items/ec148675aff054350867"
  ["3"]="https://verazza.dev/posts/14653/#nvm%E3%81%AB%E3%82%88%E3%82%8Bnpm-node%E7%92%B0%E5%A2%83%E6%A7%8B%E7%AF%89;https://qiita.com/verazza/items/1561e33b12f83d650f8f#nvm%E3%81%AB%E3%82%88%E3%82%8Bnpmnode%E7%92%B0%E5%A2%83%E6%A7%8B%E7%AF%89"
  ["4"]="/images/deploy_to_qiita_sh.png;https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/3628758/e2858c39-162b-4446-80eb-0e73220a9e48.png"
  ["5"]="/images/jack_graph.png;https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/3628758/e1e25ade-583d-4dfe-8a88-0181888877f7.png"
  ["x"]="If there are any replaced words(before replacing);add here(after replacing)"
)

declare -A QIITA_MAP=(
  ["生成AIとの共生1"]="1;x"
  ["生成AIとの共生2"]="2"
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
