#!/bin/bash
# 用法：bash push-github.sh
# 连不上 GitHub 时，先开 VPN/代理，再执行：
#   export https_proxy=http://127.0.0.1:7890
#   export http_proxy=http://127.0.0.1:7890
#   bash push-github.sh

cd "$(dirname "$0")"

REPO="covenant04233-ux/5.17-spirit-guide"

urlencode() {
  python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1], safe=''))" "$1"
}

try_github() {
  local proxy_args=()
  if [ -n "$https_proxy" ] || [ -n "$http_proxy" ]; then
    local p="${https_proxy:-$http_proxy}"
    proxy_args=(-x "$p")
  fi
  curl -sf "${proxy_args[@]}" --connect-timeout 12 -o /dev/null https://github.com 2>/dev/null
}

auto_detect_proxy() {
  [ -n "$https_proxy" ] || [ -n "$http_proxy" ] && return 0
  for port in 7890 7897 1087 10809 33210; do
    if curl -sf --connect-timeout 3 -x "http://127.0.0.1:${port}" -o /dev/null https://github.com 2>/dev/null; then
      export https_proxy="http://127.0.0.1:${port}"
      export http_proxy="http://127.0.0.1:${port}"
      echo "✓ 已自动检测到本地代理 127.0.0.1:${port}"
      return 0
    fi
  done
  return 1
}

echo ""
echo "=== 上传到 GitHub ==="

if ! try_github; then
  auto_detect_proxy || true
fi

if ! try_github; then
  echo ""
  echo "❌ 当前网络连不上 github.com（不是 Token 问题）"
  echo ""
  echo "请先开 VPN/Clash/Surge，再在终端执行（端口按你的软件改，常见 7890）："
  echo '  export https_proxy=http://127.0.0.1:7890'
  echo '  export http_proxy=http://127.0.0.1:7890'
  echo "  bash push-github.sh"
  echo ""
  echo "或长期给 Git 设代理："
  echo '  git config --global http.proxy http://127.0.0.1:7890'
  echo '  git config --global https.proxy http://127.0.0.1:7890'
  echo ""
  echo "测试能否连通：curl -I --connect-timeout 10 https://github.com"
  exit 1
fi

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

GIT_PROXY_ARGS=()
if [ -n "$https_proxy" ] || [ -n "$http_proxy" ]; then
  P="${https_proxy:-$http_proxy}"
  GIT_PROXY_ARGS=(-c "http.proxy=${P}" -c "https.proxy=${P}")
fi

echo "正在上传..."
if GIT_TERMINAL_PROMPT=0 GIT_CONFIG_SYSTEM=/dev/null GIT_CONFIG_GLOBAL=/dev/null \
  git "${GIT_PROXY_ARGS[@]}" -c credential.helper= \
  push "https://${USER_ENC}:${TOKEN_ENC}@github.com/${REPO}.git" HEAD:main 2>&1; then
  echo ""
  echo "✅ 上传成功 → https://github.com/${REPO}"
else
  echo ""
  echo "❌ 上传失败"
  echo "   Couldn't connect / timed out → 开代理后 export https_proxy=... 再试"
  echo "   Invalid username or token → 重新生成 Token（勾选 repo）"
  exit 1
fi
