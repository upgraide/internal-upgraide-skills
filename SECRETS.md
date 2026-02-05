# Secrets

This repo uses [Doppler](https://www.doppler.com) for secret management.

**Doppler Project:** `internal-upgraide-skills`

## Required Secrets

| Secret | Used By | Description |
|--------|---------|-------------|
| `NOTION_CODENAME_TOKEN` | `managing-github` | Notion integration token for Codename Registry |

## Setup

### 1. Get Doppler Access

Log in to Doppler using the shared `admin@upgraide.ai` account.

### 2. Create Service Token

1. Navigate to **Projects → internal-upgraide-skills → dev**
2. Go to **Access → Service Tokens**
3. Click **Generate**
4. Name: `<your-name>-<machine>-dev` (e.g., `joao-macbook-dev`)
5. Expiration: 90 days (development environment)
6. Copy the token immediately

### 3. Configure Locally

```bash
# Install CLI (if needed)
brew install dopplerhq/cli/doppler

# Set your token
doppler configure set token dp.st.xxx

# Setup project (run from repo root)
cd /path/to/internal-upgraide-skills
doppler setup
# Select: internal-upgraide-skills / dev
```

### 4. Verify

```bash
doppler run -- printenv NOTION_CODENAME_TOKEN
# Should print the token value
```

## Adding New Secrets

When a skill needs a new secret:

1. Add it to Doppler (Project → dev → Add Secret)
2. Update this file with the secret name and description
3. Document usage in the skill's SKILL.md

## Notes

- Never commit secrets to git
- Never paste secrets in Slack/Notion/GitHub issues
- Use `doppler run -- <command>` to inject secrets at runtime
- Each team member should have their own service token
