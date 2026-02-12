/**
 * OpenClaw GitHub Skill
 * Query and manage GitHub repositories from conversation
 * 
 * TypeScript version - Compiled to JavaScript for OpenClaw
 */

import {
  Context,
  RepositoryListParams,
  RepoDetailsParams,
  CIStatusParams,
  RecentActivityParams,
  CreateIssueParams,
  CreateRepoParams,
  SearchReposParams,
  CreatePRParams,
  ListReposResult,
  Repository,
  CheckCIResult,
  RecentActivityResult,
  Issue,
  SearchReposResult,
  PullRequest
} from './types';

import {
  listRepos,
  getRepo,
  checkCIStatus,
  getRecentActivity,
  createIssue,
  createRepo,
  searchRepos,
  createPullRequest
} from './api';

// Skill metadata
export const skillName = 'github';
export const skillVersion = '2.0.1';
export const skillDescription = 'Query and manage GitHub repositories';

// Handler functions with proper signatures
async function listReposHandler(
  args: RepositoryListParams, 
  context: Context
): Promise<ListReposResult> {
  return listRepos(args, context);
}

async function getRepoHandler(
  args: RepoDetailsParams, 
  context: Context
): Promise<Repository> {
  return getRepo(args, context);
}

async function checkCIStatusHandler(
  args: CIStatusParams, 
  context: Context
): Promise<CheckCIResult> {
  return checkCIStatus(args, context);
}

async function getRecentActivityHandler(
  args: RecentActivityParams, 
  context: Context
): Promise<RecentActivityResult> {
  return getRecentActivity(args, context);
}

async function createIssueHandler(
  args: CreateIssueParams, 
  context: Context
): Promise<Issue> {
  return createIssue(args, context);
}

async function createRepoHandler(
  args: CreateRepoParams, 
  context: Context
): Promise<Repository> {
  return createRepo(args, context);
}

async function searchReposHandler(
  args: SearchReposParams, 
  context: Context
): Promise<SearchReposResult> {
  return searchRepos(args, context);
}

async function createPullRequestHandler(
  args: CreatePRParams, 
  context: Context
): Promise<PullRequest> {
  return createPullRequest(args, context);
}

// Skill definition for OpenClaw
const skill = {
  name: skillName,
  version: skillVersion,
  description: skillDescription,
  
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
      handler: listReposHandler
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
      handler: getRepoHandler
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
      handler: checkCIStatusHandler
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
      handler: getRecentActivityHandler
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
      handler: createIssueHandler
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
      handler: createRepoHandler
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
      handler: createPullRequestHandler
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
      handler: searchReposHandler
    }
  }
};

// Export for both CommonJS and ES modules
export default skill;
module.exports = skill;
