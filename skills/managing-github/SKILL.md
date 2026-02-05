---
name: managing-github
description: Manages GitHub repositories following Upgraide conventions - naming, branches, commits, PRs, and security. Use when creating repos, making commits, opening PRs, or any GitHub operations.
---

# Managing GitHub (Upgraide)

## Repo Naming

```
<category>-<codename>[-<component>]
```

| Prefix | Use Case | Example |
|--------|----------|---------|
| `project-*` | Client/product monorepos | `project-apollo` |
| `internal-*` | Company ops, tools | `internal-ops` |
| `research-*` | Experiments, POCs | `research-ocr-eval` |
| `archive-*` | Deprecated code | `archive-old-prototype` |

**Codenames:** All client names use codenames for security. Ask the user for the codename if not provided — do not use real client names in repo names.

## GitHub Topics (Required)

Every repo needs **at least 1 client tag + 1 type tag**:

| Type | Examples |
|------|----------|
| Client | `client-apollo`, `client-phoenix` |
| Tech | `mobile`, `backend`, `infra`, `ai`, `frontend` |
| Status | `active`, `maintenance`, `poc` |

## Branch Naming

| Branch | Pattern | Example |
|--------|---------|---------|
| Production | `main` | — |
| Feature | `feature/<description>` | `feature/user-auth` |
| Bug fix | `fix/<description>` | `fix/login-timeout` |
| Hotfix | `hotfix/<description>` | `hotfix/prod-crash` |

## Commit Convention

Format: `type(scope): description`

| Type | Use | Example |
|------|-----|---------|
| `feat` | New feature | `feat(auth): add password reset` |
| `fix` | Bug fix | `fix(api): resolve timeout issue` |
| `docs` | Documentation | `docs(readme): update setup steps` |
| `chore` | Maintenance, deps | `chore(deps): bump next to 14.1` |
| `refactor` | Code restructure | `refactor(utils): simplify helpers` |

## PR Workflow

1. **Branch** from `main`
2. **Commit** following convention
3. **PR** with Epic link in description (required)
4. **Squash merge** to `main`

**PR must include:**
- Link to Notion Epic
- Self-reviewed
- Build passes
- No secrets committed

See [resources/pr-template.md](resources/pr-template.md) for full template.

## Creating a New Repo

**Requires Tech Lead approval.**

Quick checklist:
1. Name follows `<category>-<codename>` convention
2. Codename exists in Notion mapping
3. README added
4. CODEOWNERS file added
5. Branch protection enabled on `main`
6. Topics added (client + type minimum)

See [resources/repo-checklist.md](resources/repo-checklist.md) for full checklist.

## Security Defaults (Non-negotiable)

**Org-level:**
- 2FA required for all members
- All repos private by default

**Branch protection on `main`:**
- Require PR review (min 1 reviewer)
- Require status checks to pass
- No force-push
- No direct commits to `main`

## Archiving Repos

Criteria: No commits for 90+ days, project completed/abandoned.

Steps:
1. Rename to `archive-<original-name>`
2. Mark as archived in GitHub settings
3. Update topics: add `archived`, remove `active`
4. Update Notion project status

## Resources

- [resources/pr-template.md](resources/pr-template.md) — PR template for `.github/PULL_REQUEST_TEMPLATE.md`
- [resources/repo-checklist.md](resources/repo-checklist.md) — Full repo creation checklist

**Note:** Codename mapping lives in Notion (internal). Always ask the user for the codename if creating a client repo.
