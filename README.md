# UpgradeSkills

Upgraide's curated collection of Claude Code skills. Quality over quantity.

## Philosophy

- **Start small**: Add skills one by one, evaluate before committing
- **Best practices first**: Every skill follows Anthropic's guidelines
- **Tested**: Skills are validated with real usage before inclusion

## Structure

```
UpgradeSkills/
├── docs/
│   └── best-practices.md    # Anthropic's official skill authoring guide
├── templates/
│   └── SKILL.template.md    # Copy-paste starter
├── skills/
│   └── (curated skills)
└── CONTRIBUTING.md          # How to add/evaluate skills
```

## Setup

### 1. Clone the repo
```bash
git clone git@github.com:upgraide/internal-upgraide-skills.git
cd internal-upgraide-skills
```

### 2. Configure Doppler (for skills that need secrets)

Some skills require secrets (e.g., `managing-github` needs Notion access).

```bash
# Install Doppler CLI
brew install dopplerhq/cli/doppler

# Create a service token in Doppler UI:
# Project: internal-upgraide-skills → Environment: dev → Access → Service Tokens
# Name: <your-name>-<machine>-dev (e.g., joao-macbook-dev)

# Configure locally
doppler configure set token YOUR_SERVICE_TOKEN
doppler setup
```

See [SECRETS.md](SECRETS.md) for the full list of required secrets.

### 3. Run scripts with Doppler
```bash
doppler run -- ./skills/managing-github/scripts/codename list
```

## Using Skills

### In Claude Code

Link skills to your project's `.claude/skills/` directory or copy them directly.

### In OpenClaw

Skills can be loaded via the skill system. See OpenClaw docs.

## Adding Skills

See [CONTRIBUTING.md](CONTRIBUTING.md) for the evaluation checklist and process.

## Origin

Many skills originated from [Spielberg](https://github.com/upgraide/spielberg) and were refined for general use.

---

*Maintained by Upgraide*
