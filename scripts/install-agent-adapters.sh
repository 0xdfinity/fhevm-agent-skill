#!/usr/bin/env bash
set -euo pipefail

TARGET="${1:-.}"
FORCE="${FORCE:-0}"
SKILL_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_ROOT="$(cd "$TARGET" && pwd)"
INSTALLED_SKILL="$TARGET_ROOT/.agent-skills/fhevm-agent-skill"

mkdir -p "$TARGET_ROOT/.agent-skills"
rsync -a \
  --exclude node_modules \
  --exclude artifacts \
  --exclude cache \
  --exclude types \
  --exclude fhevmTemp \
  --include ".env.example" \
  --exclude ".env*" \
  --exclude .vercel \
  --exclude deployments \
  --exclude .git \
  "$SKILL_ROOT/" "$INSTALLED_SKILL/"

write_file() {
  local rel="$1"
  local content="$2"
  local dest="$TARGET_ROOT/$rel"
  mkdir -p "$(dirname "$dest")"
  if [[ -f "$dest" && "$FORCE" != "1" ]]; then
    printf "%s\n" "$content" > "$dest.fhevm-agent-skill"
    echo "Existing $rel found; wrote sidecar $dest.fhevm-agent-skill"
  else
    printf "%s\n" "$content" > "$dest"
    echo "Installed $rel"
  fi
}

write_file "AGENTS.md" '# AGENTS.md

Use the installed FHEVM Agent Skill for any Zama FHEVM confidential app work.

Read `.agent-skills/fhevm-agent-skill/skills/use-fhevm/SKILL.md` before coding, then route to the relevant skill under `.agent-skills/fhevm-agent-skill/skills/`.
'

write_file "CLAUDE.md" '# Claude Code Memory

Use @./.agent-skills/fhevm-agent-skill/skills/use-fhevm/SKILL.md for Zama FHEVM work. Route to the relevant installed skill under @./.agent-skills/fhevm-agent-skill/skills/.
'

write_file ".cursor/rules/fhevm-agent-skill.mdc" '---
description: Use the installed FHEVM Agent Skill for Zama FHEVM confidential app development, ERC-7984, input proofs, ACL, decryption, tests, and frontend integration.
alwaysApply: true
---

Read `.agent-skills/fhevm-agent-skill/skills/use-fhevm/SKILL.md` before FHEVM work. Route to the relevant installed skill.
'

write_file ".windsurf/rules/fhevm-agent-skill.md" '---
trigger: model_decision
description: Use for Zama FHEVM confidential app development, ERC-7984, fhevmjs, ACL, proofs, decryption, tests, and deployment.
---

Read `.agent-skills/fhevm-agent-skill/skills/use-fhevm/SKILL.md` before FHEVM work. Route to the relevant installed skill.
'

write_file ".clinerules/fhevm-agent-skill.md" '# FHEVM Agent Skill

For Zama FHEVM work, read `.agent-skills/fhevm-agent-skill/skills/use-fhevm/SKILL.md`, then route to the relevant installed skill under `.agent-skills/fhevm-agent-skill/skills/`.
'

write_file ".github/copilot-instructions.md" '# FHEVM Agent Skill

For Zama FHEVM confidential app work, follow `.agent-skills/fhevm-agent-skill/skills/use-fhevm/SKILL.md` and the relevant installed skill under `.agent-skills/fhevm-agent-skill/skills/`.
'

echo "FHEVM Agent Skill adapter install complete at $INSTALLED_SKILL"
