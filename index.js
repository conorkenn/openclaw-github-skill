// OpenClaw GitHub Skill
// Query and manage GitHub repositories from your AI assistant

const GITHUB_API = 'https://api.github.com';

// Cached user info
let cachedUser = null;

/**
 * Get GitHub username from environment, config, or API
 */
async function getUsername(context) {
  // 1. Check environment variable first
  if (process.env.GITHUB_USERNAME) {
    return process.env.GITHUB_USERNAME;
  }
  
  // 2. Check OpenClaw config
  const config = context.config?.github || {};
  if (config.username) {
    return config.username;
  }
  
  // 3. Fetch from API if not configured
  if (!cachedUser) {
    const response = await fetch(`${GITHUB_API}/user`, {
      headers: authHeaders(context)
    });
    const data = await response.json();
    cachedUser = data.login;
  }
  
  return cachedUser;
}

/**
 * Get auth headers - checks environment first, then config
 */
function authHeaders(context) {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'OpenClaw-GitHub-Skill'
  };
  
  // 1. Check environment variable first
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    return headers;
  }
  
  // 2. Fall back to OpenClaw config
  const config = context.config?.github || {};
  if (config.token) {
    headers['Authorization'] = `token ${config.token}`;
  }
  
  return headers;
}

/**
 * List repositories
 */
async function listRepos(args, context) {
  const username = await getUsername(context);
  const { type = 'owner', sort = 'updated', direction = 'desc', limit = 30 } = args;
  
  const url = `${GITHUB_API}/users/${username}/repos?type=${type}&sort=${sort}&direction=${direction}&per_page=${limit}`;
  
  const response = await fetch(url, { headers: authHeaders(context) });
  
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }
  
  const repos = await response.json();
  
  // Filter by language if specified
  let filtered = repos;
  if (args.language) {
    filtered = repos.filter(r => r.language?.toLowerCase() === args.language.toLowerCase());
  }
  
  // Limit results
  filtered = filtered.slice(0, args.limit || 30);
  
  return {
    total: filtered.length,
    repos: filtered.map(r => ({
      name: r.name,
      full_name: r.full_name,
      description: r.description,
      stars: r.stargazers_count,
      forks: r.forks_count,
      language: r.language,
      updated: r.updated_at,
      url: r.html_url,
      private: r.private
    }))
  };
}

/**
 * Get repository details
 */
async function getRepo(args, context) {
  const { owner, repo } = args;
  
  const url = `${GITHUB_API}/repos/${owner}/${repo}`;
  const response = await fetch(url, { headers: authHeaders(context) });
  
  if (!response.ok) {
    throw new Error(`Repo not found: ${owner}/${repo}`);
  }
  
  const data = await response.json();
  
  return {
    name: data.name,
    full_name: data.full_name,
    description: data.description,
    stars: data.stargazers_count,
    forks: data.forks_count,
    watchers: data.watchers_count,
    language: data.language,
    open_issues: data.open_issues_count,
    created: data.created_at,
    updated: data.updated_at,
    pushed: data.pushed_at,
    url: data.html_url,
    default_branch: data.default_branch,
    private: data.private
  };
}

/**
 * Check CI/CD status
 */
async function checkCIStatus(args, context) {
  const { owner, repo } = args;
  
  // Get recent workflows/runs
  const runsUrl = `${GITHUB_API}/repos/${owner}/${repo}/actions/runs?per_page=5`;
  const response = await fetch(runsUrl, { headers: authHeaders(context) });
  
  if (!response.ok) {
    throw new Error(`Failed to get CI status: ${response.status}`);
  }
  
  const data = await response.json();
  
  const runs = data.workflow_runs?.map(run => ({
    name: run.name,
    status: run.status,
    conclusion: run.conclusion,
    branch: run.head_branch,
    commit: run.head_sha?.substring(0, 7),
    created: run.created_at,
    url: run.html_url
  })) || [];
  
  return {
    repo: `${owner}/${repo}`,
    runs
  };
}

/**
 * Get recent activity (commits, PRs, issues)
 */
async function getRecentActivity(args, context) {
  const username = await getUsername(context);
  const { repo, limit = 10 } = args;
  
  if (!repo) {
    throw new Error('Repository name required');
  }
  
  // Get recent commits
  const commitsUrl = `${GITHUB_API}/repos/${username}/${repo}/commits?per_page=${limit}`;
  const commitsRes = await fetch(commitsUrl, { headers: authHeaders(context) });
  
  if (!commitsRes.ok) {
    throw new Error(`Failed to get activity: ${commitsRes.status}`);
  }
  
  const commits = await commitsRes.json();
  
  return {
    repo: `${username}/${repo}`,
    commits: commits.map(c => ({
      sha: c.sha.substring(0, 7),
      message: c.commit.message.split('\n')[0],
      author: c.commit.author.name,
      date: c.commit.author.date,
      url: c.html_url
    }))
  };
}

/**
 * Create an issue
 */
async function createIssue(args, context) {
  const username = await getUsername(context);
  const { repo, title, body } = args;
  
  if (!title) {
    throw new Error('Issue title required');
  }
  
  const url = `${GITHUB_API}/repos/${username}/${repo}/issues`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: authHeaders(context),
    body: JSON.stringify({
      title,
      body: body || '',
      ...args.extra
    })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create issue: ${response.status}`);
  }
  
  const issue = await response.json();
  
  return {
    number: issue.number,
    title: issue.title,
    url: issue.html_url,
    state: issue.state
  };
}

/**
 * Create a new repository
 */
async function createRepo(args, context) {
  const username = await getUsername(context);
  const { name, description, private = false, auto_init = true } = args;
  
  if (!name) {
    throw new Error('Repository name required');
  }
  
  const url = `${GITHUB_API}/user/repos`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: authHeaders(context),
    body: JSON.stringify({
      name,
      description: description || '',
      private,
      auto_init
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create repo: ${error.message || response.status}`);
  }
  
  const repo = await response.json();
  
  return {
    name: repo.name,
    full_name: repo.full_name,
    description: repo.description,
    url: repo.html_url,
    private: repo.private,
    clone_url: repo.clone_url
  };
}

/**
 * Search repositories
 */
async function searchRepos(args, context) {
  const username = await getUsername(context);
  const { query, sort = 'updated', limit = 30 } = args;
  
  if (!query) {
    throw new Error('Search query required');
  }
  
  // Search user's repos
  const url = `${GITHUB_API}/search/repositories?q=${encodeURIComponent(query)}+user:${username}&sort=${sort}&per_page=${limit}`;
  
  const response = await fetch(url, { headers: authHeaders(context) });
  
  if (!response.ok) {
    throw new Error(`Search failed: ${response.status}`);
  }
  
  const data = await response.json();
  
  return {
    total: data.total_count,
    repos: data.items?.map(r => ({
      name: r.name,
      full_name: r.full_name,
      description: r.description,
      stars: r.stargazers_count,
      language: r.language,
      url: r.html_url
    })) || []
  };
}

/**
 * Create a pull request
 */
async function createPullRequest(args, context) {
  const username = await getUsername(context);
  const { owner, repo, title, body, head, base = 'main' } = args;
  
  if (!owner || !repo || !title || !head) {
    throw new Error('owner, repo, title, and head are required');
  }
  
  const url = `${GITHUB_API}/repos/${owner}/${repo}/pulls`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: authHeaders(context),
    body: JSON.stringify({
      title,
      body: body || '',
      head,
      base
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create PR: ${error.message || response.status}`);
  }
  
  const pr = await response.json();
  
  return {
    number: pr.number,
    title: pr.title,
    url: pr.html_url,
    state: pr.state,
    head: pr.head.ref,
    base: pr.base.ref
  };
}

// Skill definition
const skill = {
  name: 'github',
  version: '1.0.0',
  description: 'Query and manage GitHub repositories',
  
  actions: {
    list_repos: {
      description: 'List your repositories',
      parameters: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['owner', 'all', 'member'], default: 'owner' },
          sort: { type: 'string', enum: ['created', 'updated', 'pushed', 'full_name'], default: 'updated' },
          language: { type: 'string' },
          limit: { type: 'number', default: 30 }
        }
      },
      handler: listRepos
    },
    
    get_repo: {
      description: 'Get repository details',
      parameters: {
        type: 'object',
        properties: {
          owner: { type: 'string' },
          repo: { type: 'string' }
        },
        required: ['owner', 'repo']
      },
      handler: getRepo
    },
    
    check_ci_status: {
      description: 'Check CI/CD pipeline status',
      parameters: {
        type: 'object',
        properties: {
          owner: { type: 'string' },
          repo: { type: 'string' }
        },
        required: ['owner', 'repo']
      },
      handler: checkCIStatus
    },
    
    get_recent_activity: {
      description: 'Get recent commits',
      parameters: {
        type: 'object',
        properties: {
          repo: { type: 'string' },
          limit: { type: 'number', default: 10 }
        },
        required: ['repo']
      },
      handler: getRecentActivity
    },
    
    create_issue: {
      description: 'Create a new issue',
      parameters: {
        type: 'object',
        properties: {
          repo: { type: 'string' },
          title: { type: 'string' },
          body: { type: 'string' },
          extra: { type: 'object' }
        },
        required: ['repo', 'title']
      },
      handler: createIssue
    },
    
    create_repo: {
      description: 'Create a new repository',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Repository name' },
          description: { type: 'string', description: 'Repository description' },
          private: { type: 'boolean', description: 'Private repository', default: false },
          auto_init: { type: 'boolean', description: 'Initialize with README', default: true }
        },
        required: ['name']
      },
      handler: createRepo
    },
    
    create_pull_request: {
      description: 'Create a pull request',
      parameters: {
        type: 'object',
        properties: {
          owner: { type: 'string', description: 'Repository owner' },
          repo: { type: 'string', description: 'Repository name' },
          title: { type: 'string', description: 'PR title' },
          body: { type: 'string', description: 'PR description' },
          head: { type: 'string', description: 'Source branch' },
          base: { type: 'string', description: 'Target branch', default: 'main' }
        },
        required: ['owner', 'repo', 'title', 'head']
      },
      handler: createPullRequest
    },
    
    search_repos: {
      description: 'Search your repositories',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          sort: { type: 'string', enum: ['stars', 'updated', 'created'], default: 'updated' },
          limit: { type: 'number', default: 30 }
        },
        required: ['query']
      },
      handler: searchRepos
    }
  }
};

module.exports = skill;
