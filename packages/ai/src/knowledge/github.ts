import { Octokit } from '@octokit/rest';
import { KnowledgeBase } from './base';
import { GithubConfig, PortfolioDocument } from './types';

export class GitHubKnowledge extends KnowledgeBase {
  private octokit: Octokit;
  private githubConfig: GithubConfig;

  constructor(base: KnowledgeBase, githubConfig: GithubConfig) {
    super(base);
    this.githubConfig = githubConfig;
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
  }

  async refresh() {
    await this.clearSource('github');
    const documents = await this.fetchGitHubData();
    await this.addDocuments(documents);
  }

  private async fetchGitHubData(): Promise<PortfolioDocument[]> {
    const documents: PortfolioDocument[] = [];
    const { username, repositories, includeIssues, includeReadmes } = this.githubConfig;

    // Fetch user's repositories
    const { data: repos } = await this.octokit.repos.listForUser({
      username,
      sort: 'updated',
      per_page: 100,
    });

    const repoList = repositories 
      ? repos.filter(repo => repositories.includes(repo.name))
      : repos;

    for (const repo of repoList) {
      // Add repository description
      documents.push({
        pageContent: `Repository: ${repo.name}\nDescription: ${repo.description}\nTopics: ${repo.topics?.join(', ')}\nStars: ${repo.stargazers_count}`,
        metadata: {
          source: 'github',
          type: 'repository',
          url: repo.html_url,
          title: repo.name,
          date: repo.updated_at,
        },
      });

      // Fetch and add README if enabled
      if (includeReadmes) {
        try {
          const { data: readme } = await this.octokit.repos.getReadme({
            owner: username,
            repo: repo.name,
          });

          const readmeContent = Buffer.from(readme.content, 'base64').toString('utf-8');
          documents.push({
            pageContent: readmeContent,
            metadata: {
              source: 'github',
              type: 'readme',
              url: readme.html_url,
              title: `${repo.name} README`,
              date: readme.updated_at,
            },
          });
        } catch (error) {
          console.warn(`Failed to fetch README for ${repo.name}:`, error);
        }
      }

      // Fetch and add issues if enabled
      if (includeIssues) {
        try {
          const { data: issues } = await this.octokit.issues.listForRepo({
            owner: username,
            repo: repo.name,
            state: 'all',
            per_page: 100,
          });

          for (const issue of issues) {
            documents.push({
              pageContent: `Issue: ${issue.title}\n\n${issue.body}`,
              metadata: {
                source: 'github',
                type: 'issue',
                url: issue.html_url,
                title: issue.title,
                date: issue.updated_at,
                tags: issue.labels.map(label => label.name),
              },
            });
          }
        } catch (error) {
          console.warn(`Failed to fetch issues for ${repo.name}:`, error);
        }
      }
    }

    return documents;
  }
} 