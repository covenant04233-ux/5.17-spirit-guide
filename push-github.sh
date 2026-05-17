#!/bin/bash
# 用法：bash push-github.sh

cd "$(dirname "$0")"

REPO="covenant04233-ux/5.17-spirit-guide"

urlencode() {
  python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1], safe=''))" "$1"
}

echo ""
echo "=== 上传到 GitHub ==="
printf "用户名: "
read USER
printf "Token (必须是 ghp_ 或 github_pat_ 开头，不是登录密码): "
read -s TOKEN
echo ""
echo ""

USER=$(echo "$USER" | tr -d '[:space:]')
TOKEN=$(echo "$TOKEN" | tr -d '[:space:]')

if [ -z "$USER" ] || [ -z "$TOKEN" ]; then
  echo "❌ 用户名和 Token 不能为空"
  exit 1
fi

case "$TOKEN" in
  ghp_*|github_pat_*|gho_*|ghu_*|ghs_*|ghr_*) ;;
  *)
    echo "❌ 这不像 GitHub Token（应以 ghp_ 或 github_pat_ 开头）"
    echo "   不能用 GitHub 登录密码。去这里生成："
    echo "   https://github.com/settings/tokens"
    exit 1
    ;;
esac

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

USER_ENC=$(urlencode "$USER")
TOKEN_ENC=$(urlencode "$TOKEN")

echo "正在上传..."
if GIT_TERMINAL_PROMPT=0 GIT_CONFIG_SYSTEM=/dev/null GIT_CONFIG_GLOBAL=/dev/null \
  git -c credential.helper= push "https://${USER_ENC}:${TOKEN_ENC}@github.com/${REPO}.git" HEAD:main; then
  echo ""
  echo "✅ 上传成功 → https://github.com/${REPO}"
else
  echo ""
  echo "❌ 上传失败，常见原因："
  echo "   1. 填的是登录密码，不是 Token"
  echo "   2. Token 已过期或被删除 → 重新生成"
  echo "   3. Token 没勾 repo 权限（Classic）或没授权这个仓库（Fine-grained）"
  echo "   4. GitHub 上还没建空仓库 → https://github.com/new 名字: 5.17-spirit-guide"
  exit 1
fi
