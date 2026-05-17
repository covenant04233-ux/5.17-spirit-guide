#!/bin/bash
# 用法：在项目目录执行  bash push-github.sh

cd "$(dirname "$0")"

REPO="covenant04233-ux/5.17-spirit-guide"

echo ""
echo "=== 上传到 GitHub ==="
printf "用户名: "
read USER
printf "Token (ghp_ 开头，粘贴后回车): "
read -s TOKEN
echo ""
echo ""

if [ -z "$USER" ] || [ -z "$TOKEN" ]; then
  echo "用户名和 Token 不能为空"
  exit 1
fi

if [ ! -d .git ]; then
  echo "初始化 git..."
  git init -b main
  git add -A
  git commit -m "Initial commit"
fi

git add -A
if ! git diff --staged --quiet 2>/dev/null; then
  printf "本次提交说明 (直接回车用 update): "
  read MSG
  MSG="${MSG:-update}"
  git commit -m "$MSG"
fi

echo "正在上传..."
GIT_TERMINAL_PROMPT=0 GIT_CONFIG_SYSTEM=/dev/null GIT_CONFIG_GLOBAL=/dev/null \
  git -c credential.helper= push "https://${USER}:${TOKEN}@github.com/${REPO}.git" HEAD:main

echo ""
echo "完成 → https://github.com/${REPO}"
