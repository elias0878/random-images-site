#!/usr/bin/env bash
# restore-git.sh — يعيد تهيئة إعدادات git المحلية
# (ملف .git/config يُستبعد من النسخ الاحتياطية، فيلزم إعادة إنشائه)
set -euo pipefail
cd "$(dirname "$0")/.."

mkdir -p .git/refs/heads .git/refs/tags

if [ ! -f .git/config ]; then
  cat > .git/config <<'EOF'
[core]
	repositoryformatversion = 0
	filemode = false
	bare = false
	logallrefupdates = true
[remote "origin"]
	url = https://github.com/elias0878/random-images-site.git
	fetch = +refs/heads/*:refs/remotes/origin/*
[branch "main"]
	remote = origin
	merge = refs/heads/main
EOF
  echo "✓ أُنشئ .git/config"
fi

git config user.name  "elias0878"
git config user.email "elias0878@users.noreply.github.com"
git config core.fileMode false
echo "✓ git جاهز"

# الرفع: يلزم رمز الوصول في المتغير GITHUB_TOKEN
if [ -n "${GITHUB_TOKEN:-}" ]; then
  git push "https://x-access-token:${GITHUB_TOKEN}@github.com/elias0878/random-images-site.git" main:main
else
  echo "ℹ️  للرفع: GITHUB_TOKEN=... ./scripts/restore-git.sh"
fi
