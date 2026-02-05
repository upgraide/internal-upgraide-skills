# Creating a New Repo

**Owner:** Tech Lead (approves) + Developer (executes)

## Pre-Creation

- [ ] Verify codename exists in [Notion Codename Mapping](https://www.notion.so/Codename-Mapping-a6051920c0144a4a8d189e7dfa391813)
- [ ] If new client, create codename first
- [ ] Get Tech Lead approval

## Creation Checklist

- [ ] Name follows convention: `<category>-<codename>`
- [ ] Repository set to **private** (default)
- [ ] README with project description added
- [ ] CODEOWNERS file added

## Post-Creation

- [ ] Assigned to correct team:
  - Founders → Admin
  - Engineering → Write
  - External → Read (or limited Write)
- [ ] Branch protection enabled on `main`:
  - [ ] Require PR review (min 1)
  - [ ] Require status checks to pass
  - [ ] No force-push
  - [ ] No direct commits
- [ ] Topics added:
  - [ ] `client-<codename>` (required)
  - [ ] Type tag: `mobile`, `backend`, `infra`, `ai`, `frontend` (required)
  - [ ] Status: `active`, `maintenance`, `poc`
- [ ] Codename Mapping updated in Notion (if new)

## README Template

```markdown
# project-<codename>

Brief description of the project.

## Owner

Team/person responsible.

## Setup

Steps to run locally.

## Deployment

How code gets to production.
```

## CODEOWNERS Template

```
# Default owners for everything
* @upgraide/engineering
```
