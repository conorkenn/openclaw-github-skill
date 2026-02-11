# GitHub Integration Skill

Query and manage GitHub repositories directly from your AI assistant.

## Capabilities

| Capability | Description |
|------------|-------------|
| `list_repos` | List your repositories with filters |
| `get_repo` | Get detailed info about a specific repo |
| `get_repo_status` | Check stars, forks, last updated |
| `check_ci_status` | Check CI/CD pipeline status |
| `create_issue` | Create a new issue in a repo |
| `search_repos` | Search your repositories |
| `get_recent_activity` | Get recent commits, PRs, issues |

## Usage

```
You: List my Python repos
Bot: [lists your Python repositories]

You: Check CI status on my main project
Bot: [shows CI/CD status]

You: Create an issue about the bug
Bot: [creates the issue]
```

## Configuration

### Required

```yaml
github:
  token: "your-github-token"  # Personal access token
  username: "your-username"   # Your GitHub username
```

### Getting a Token

1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scopes: `repo`, `read:user`
4. Copy and configure

## Example Commands

### List All Repos
```yaml
action: list_repos
sort: updated
limit: 10
```

### Get Specific Repo
```yaml
action: get_repo
owner: "conorkennedy"
repo: "my-project"
```

### Check CI Status
```yaml
action: check_ci_status
owner: "conorkennedy"
repo: "my-project"
```

## Notes

- Rate limits apply (60/hr for unauthenticated, 5,000/hr for authenticated)
- Uses GitHub REST API
- Supports both public and private repos
