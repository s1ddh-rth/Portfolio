import { QdrantClient } from 'qdrant';
import { TwitterApi } from 'twitter-api-v2';
import { Octokit } from 'octokit';
import { config } from '../config';
import { ResumeKnowledgeBase } from './resume';
import { BlogKnowledgeBase } from './blog';
import { GitHubKnowledgeBase } from './github';

export class KnowledgeBaseInitializer {
  private qdrant: QdrantClient;
  private twitter?: TwitterApi;
  private github?: Octokit;

  constructor() {
    this.qdrant = new QdrantClient({ url: config.QDRANT_URL });
    
    if (config.TWITTER_API_KEY) {
      this.twitter = new TwitterApi(config.TWITTER_API_KEY);
    }
    
    if (config.GITHUB_TOKEN) {
      this.github = new Octokit({ auth: config.GITHUB_TOKEN });
    }
  }

  async initialize() {
    // Initialize vector collections
    await this.createCollections();

    // Initialize knowledge bases
    const resume = new ResumeKnowledgeBase(this.qdrant);
    const blog = new BlogKnowledgeBase(this.qdrant);
    const github = new GitHubKnowledgeBase(this.qdrant, this.github);

    // Load data
    await Promise.all([
      resume.load(),
      blog.load(),
      github.load(),
      this.loadSocialProfiles()
    ]);
  }

  private async createCollections() {
    const collections = [
      config.RESUME_COLLECTION,
      config.BLOG_COLLECTION,
      config.GITHUB_COLLECTION,
      config.SOCIAL_COLLECTION
    ];

    for (const collection of collections) {
      const exists = await this.qdrant.getCollection(collection).catch(() => false);
      if (!exists) {
        await this.qdrant.createCollection(collection, {
          vectors: { size: 1536, distance: 'Cosine' }
        });
      }
    }
  }

  private async loadSocialProfiles() {
    if (this.twitter && config.TWITTER_USERNAME) {
      const tweets = await this.twitter.v2.userTimeline(config.TWITTER_USERNAME);
      // Index tweets into vector store
      // Implementation details here
    }

    if (config.LINKEDIN_PROFILE_URL) {
      // Fetch LinkedIn profile data
      // Note: LinkedIn's API has strict restrictions, may need manual data input
      // Implementation details here
    }
  }
}

// Usage example:
// const initializer = new KnowledgeBaseInitializer();
// await initializer.initialize(); 