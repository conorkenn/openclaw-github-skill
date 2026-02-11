# OpenClaw GitHub Skill

A skill that lets your AI assistant query and manage GitHub repositories.

## Features

- 📋 **List Repos** — View your repositories with filters
- 📊 **Get Repo Details** — Stars, forks, language, last updated
- 🔄 **Check CI Status** — Monitor CI/CD pipelines
- 📝 **Create Issues** — Open issues from conversation
- 🔍 **Search Repos** — Find repos by name/query
- 📊 **Recent Activity** — View recent commits

## Prerequisites

- OpenClaw gateway running
- Node.js 18+
- GitHub account with a Personal Access Token (PAT)

## Setup

### 1. Generate a GitHub Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: `openclaw-github-skill`
4. Scopes (permissions): `repo`, `read:user`
5. Copy the token

### 2. Configure Environment Variables

Add to your shell profile (`~/.zshrc` or `~/.bashrc`):

```bash
# GitHub Token for OpenClaw Skills
export GITHUB_TOKEN="ghp_your_token_here"
export GITHUB_USERNAME="your_github_username"
```

Then run:
```bash
source ~/.zshrc
```

### 3. Install the Skill

Copy to your OpenClaw skills directory:

```bash
git clone https://github.com/YOUR_USERNAME/openclaw-github-skill.git ~/.openclaw/skills/github-skill
```

Or download and extract manually.

### 4. Restart OpenClaw

```bash
openclaw gateway restart
```

## Usage

```
You: List my Python repositories
Bot: [lists your Python repositories]

You: Check CI status on my-project
Bot: [shows CI/CD status]

You: Create an issue in my-project about the login bug
Bot: [creates the issue and returns the link]

You: What's the recent activity on my-project?
Bot: [shows recent commits]

You: Search my repos for "trading"
Bot: [shows matching repositories]
```

## Directory Structure

```
openclaw-github-skill/
├── SKILL.md       # Skill documentation for OpenClaw
├── README.md      # This file
├── index.js       # Skill implementation
└── package.json   # NPM package metadata
```

## Commands Reference

| Command | Description |
|---------|-------------|
| `list_repos` | List repositories (filter by type, language, sort) |
| `get_repo` | Get detailed repo info (stars, forks, etc.) |
| `check_ci_status` | Check CI/CD pipeline status |
| `create_issue` | Create a new issue |
| `search_repos` | Search your repositories |
| `get_recent_activity` | View recent commits |

## Security

⚠️ **IMPORTANT: Never commit your GitHub token to version control!**

This skill uses **environment variables** for authentication:

- `GITHUB_TOKEN` — Your personal access token
- `GITHUB_USERNAME` — Your GitHub username

**Never:**
- ❌ Commit tokens to git
- ❌ Share tokens in code or config files
- ❌ Add tokens to the README or examples

**Always:**
- ✅ Use environment variables
- ✅ Rotate tokens if compromised
- ✅ Use minimal required scopes (`repo`, `read:user`)

## Rate Limits

- **Unauthenticated requests:** 60/hour
- **Authenticated requests:** 5,000/hour

The skill automatically uses your token for authentication.

## Requirements

- OpenClaw 2024+
- Node.js 18+
- GitHub Personal Access Token with `repo` and `read:user` scopes

## Contributing

Contributions welcome! To contribute:

1. Fork this repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

## Acknowledgments

Built for the OpenClaw ecosystem.
