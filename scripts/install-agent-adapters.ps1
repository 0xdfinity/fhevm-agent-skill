param(
  [string]$TargetPath = ".",
  [switch]$Force
)

$ErrorActionPreference = "Stop"

$skillRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$target = Resolve-Path $TargetPath
$installedSkill = Join-Path $target ".agent-skills\fhevm-agent-skill"

$excludeDirs = @("node_modules", "artifacts", "cache", "types", "fhevmTemp", ".git", ".vercel", "deployments")

function Copy-TreeFiltered {
  param([string]$Source, [string]$Destination)

  if (!(Test-Path $Destination)) {
    New-Item -ItemType Directory -Path $Destination | Out-Null
  }

  Get-ChildItem -LiteralPath $Source -Force | ForEach-Object {
    if ($excludeDirs -contains $_.Name) { return }
    if ($_.Name.StartsWith(".env") -and $_.Name -ne ".env.example") { return }
    $dest = Join-Path $Destination $_.Name
    if ($_.PSIsContainer) {
      Copy-TreeFiltered -Source $_.FullName -Destination $dest
    } else {
      Copy-Item -LiteralPath $_.FullName -Destination $dest -Force
    }
  }
}

function Install-File {
  param([string]$RelativePath, [string]$Content)

  $dest = Join-Path $target $RelativePath
  $parent = Split-Path $dest -Parent
  if (!(Test-Path $parent)) {
    New-Item -ItemType Directory -Path $parent | Out-Null
  }

  if ((Test-Path $dest) -and -not $Force) {
    $sidecar = "$dest.fhevm-agent-skill"
    Set-Content -LiteralPath $sidecar -Value $Content -Encoding UTF8
    Write-Host "Existing $RelativePath found; wrote sidecar $sidecar"
  } else {
    Set-Content -LiteralPath $dest -Value $Content -Encoding UTF8
    Write-Host "Installed $RelativePath"
  }
}

Copy-TreeFiltered -Source $skillRoot -Destination $installedSkill
Write-Host "Installed skill payload to $installedSkill"

Install-File "AGENTS.md" @"
# AGENTS.md

Use the installed FHEVM Agent Skill for any Zama FHEVM confidential app work.

Read `.agent-skills/fhevm-agent-skill/skills/use-fhevm/SKILL.md` before coding, then route to the relevant skill under `.agent-skills/fhevm-agent-skill/skills/`.

Validate generated FHEVM code with compile and tests. Do not invent FHEVM APIs.
"@

Install-File "CLAUDE.md" @"
# Claude Code Memory

Use @./.agent-skills/fhevm-agent-skill/skills/use-fhevm/SKILL.md for Zama FHEVM work. Route to the relevant installed skill under @./.agent-skills/fhevm-agent-skill/skills/.
"@

Install-File ".cursor/rules/fhevm-agent-skill.mdc" @"
---
description: Use the installed FHEVM Agent Skill for Zama FHEVM confidential app development, ERC-7984, input proofs, ACL, decryption, tests, and frontend integration.
alwaysApply: true
---

Read `.agent-skills/fhevm-agent-skill/skills/use-fhevm/SKILL.md` before FHEVM work. Route to the relevant installed skill.
"@

Install-File ".windsurf/rules/fhevm-agent-skill.md" @"
---
trigger: model_decision
description: Use for Zama FHEVM confidential app development, ERC-7984, fhevmjs, ACL, proofs, decryption, tests, and deployment.
---

Read `.agent-skills/fhevm-agent-skill/skills/use-fhevm/SKILL.md` before FHEVM work. Route to the relevant installed skill.
"@

Install-File ".clinerules/fhevm-agent-skill.md" @"
# FHEVM Agent Skill

For Zama FHEVM work, read `.agent-skills/fhevm-agent-skill/skills/use-fhevm/SKILL.md`, then route to the relevant installed skill under `.agent-skills/fhevm-agent-skill/skills/`.
"@

Install-File ".github/copilot-instructions.md" @"
# FHEVM Agent Skill

For Zama FHEVM confidential app work, follow `.agent-skills/fhevm-agent-skill/skills/use-fhevm/SKILL.md` and the relevant installed skill under `.agent-skills/fhevm-agent-skill/skills/`.
"@

Write-Host "FHEVM Agent Skill adapter install complete."
