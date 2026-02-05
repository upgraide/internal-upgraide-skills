# Secrets

This repo uses [Doppler](https://www.doppler.com) for secret management.

**Doppler Project:** `internal-upgraide-skills`

## Usage Philosophy

Following [Araujo's Doppler Guide](https://www.notion.so/SOP-Doppler):

- **Dev environment (this project):** Shared API keys for local development and agent work
- **Staging/Production:** Each deployable service has its own Doppler project with the keys it needs

This project provides a single source for dev API keys used across multiple skills. When deploying a service to Railway, copy the required secrets to that service's Doppler project.

## Required Secrets

| Secret | Skill | Service | Source |
|--------|-------|---------|--------|
| `NOTION_CODENAME_TOKEN` | managing-github | Notion | Notion Integrations |
| `ASSEMBLY_AI_API_KEY` | transcribing-audio | AssemblyAI | assemblyai.com/dashboard |
| `FISH_AUDIO_API_KEY` | generating-audio | Fish Audio | fish.audio |
| `ELEVENLABS_API_KEY` | generating-audio | ElevenLabs | elevenlabs.io |
| `RUNPOD_AVATAR_API_KEY` | generating-avatar | RunPod | runpod.io |
| `GEMINI_API_KEY` | generating-images | Google AI Studio | aistudio.google.com |
| `GOOGLE_GENAI_API_KEY` | generating-video | Google AI Studio | aistudio.google.com |
| `REPLICATE_API_TOKEN` | generating-images, generating-video | Replicate | replicate.com |
| `OPENAI_API_KEY` | generating-video | OpenAI | platform.openai.com |
| `OPENROUTER_API_KEY` | analyzing-video | OpenRouter | openrouter.ai |
| `DASHSCOPE_API_KEY` | analyzing-video, generating-video | Alibaba Cloud | dashscope.console.aliyun.com |
| `BFL_API_KEY` | generating-images | Black Forest Labs | blackforestlabs.ai |
| `LOGO_PUBLIC_TOKEN` | generating-images | Logo.dev | logo.dev |

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

# Login (opens browser)
doppler login

# Setup project (run from repo root)
cd /path/to/internal-upgraide-skills
doppler setup
# Select: internal-upgraide-skills / dev
```

### 4. Verify

```bash
doppler secrets
# Should list all secrets
```

## Running Scripts

Always use `doppler run` to inject secrets:

```bash
# From repo root (uses .doppler.yaml)
doppler run -- ./skills/managing-github/scripts/codename list

# Or specify project explicitly
doppler run --project internal-upgraide-skills --config dev -- ./script
```

## Adding New Secrets

When a skill needs a new secret:

1. Add it to Doppler: **Project → dev → Add Secret**
2. Add a note in Doppler UI with:
   - **Source:** Where to get/regenerate this key
   - **Owner:** Who manages this credential (default: admin@upgraide.ai)
   - **Scope:** What permissions/limits the key has
3. Update this file with the secret name, skill, and service
4. Document usage in the skill's SKILL.md

## Deploying Services

When a service goes to staging/production:

1. Create a Doppler project for that service (e.g., `project-spielberg-backend`)
2. Copy only the secrets that service needs from here
3. Create environment-specific values where needed (prod vs dev API keys)

**Never use dev keys in production.** Many services have separate sandbox/production keys.

## Secret Rotation

Per Araujo's guide:
- Review and rotate API keys every 3-6 months
- Immediately rotate any secret that may have been exposed
- Document rotation dates in Doppler secret notes

## Notes

- ❌ Never commit secrets to git
- ❌ Never paste secrets in Slack/Notion/GitHub issues  
- ✅ Use `doppler run -- <command>` to inject secrets at runtime
- ✅ Each team member should have their own service token
- ✅ Add notes to secrets in Doppler UI for documentation
