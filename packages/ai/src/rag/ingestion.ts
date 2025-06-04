import { Document, RAGConfig } from './types';
import { QdrantClient } from '@qdrant/js-client-rest';
import { Embeddings } from './embeddings';

export class KnowledgeIngestion {
  private client: QdrantClient;
  private embeddings: Embeddings;
  private config: RAGConfig;

  constructor(config: RAGConfig) {
    this.config = config;
    this.client = new QdrantClient({
      url: process.env.QDRANT_HOST || 'http://localhost:6333',
    });
    this.embeddings = new Embeddings();
  }

  async ingestDocument(doc: Document): Promise<void> {
    // Get embeddings for the document
    const embedding = await this.embeddings.getEmbedding(doc.content);

    // Store in Qdrant
    await this.client.upsert(this.config.collection_name, {
      wait: true,
      points: [
        {
          id: doc.id,
          vector: embedding,
          payload: {
            content: doc.content,
            ...doc.metadata,
          },
        },
      ],
    });
  }

  async ingestGitHub(username: string): Promise<void> {
    // Fetch GitHub repositories
    const repos = await fetch(`https://api.github.com/users/${username}/repos`).then(
      (res) => res.json()
    );

    // Process each repository
    for (const repo of repos) {
      const doc: Document = {
        id: `github-${repo.id}`,
        content: `
          Repository: ${repo.name}
          Description: ${repo.description || 'No description'}
          Language: ${repo.language || 'Not specified'}
          Stars: ${repo.stargazers_count}
          Topics: ${repo.topics?.join(', ') || 'None'}
          URL: ${repo.html_url}
        `,
        metadata: {
          source: 'github',
          type: 'project',
          url: repo.html_url,
          title: repo.name,
          date: repo.created_at,
          language: repo.language,
          stars: repo.stargazers_count,
        },
      };

      await this.ingestDocument(doc);
    }
  }

  async ingestResume(resumeText: string): Promise<void> {
    const sections = resumeText.split('\n\n'); // Basic section splitting
    
    // Process each section
    for (const section of sections) {
      const doc: Document = {
        id: `resume-${Buffer.from(section.slice(0, 32)).toString('hex')}`,
        content: section,
        metadata: {
          source: 'resume',
          type: 'resume',
          date: new Date().toISOString(),
        },
      };

      await this.ingestDocument(doc);
    }
  }

  async ingestBlogPosts(posts: Array<{ title: string; content: string; url: string; date: string }>): Promise<void> {
    for (const post of posts) {
      const doc: Document = {
        id: `blog-${Buffer.from(post.title).toString('hex')}`,
        content: `
          Title: ${post.title}
          Content: ${post.content}
        `,
        metadata: {
          source: 'blog',
          type: 'blog',
          url: post.url,
          title: post.title,
          date: post.date,
        },
      };

      await this.ingestDocument(doc);
    }
  }

  async search(query: string, limit: number = 5): Promise<Array<Document>> {
    const queryEmbedding = await this.embeddings.getEmbedding(query);

    const results = await this.client.search(this.config.collection_name, {
      vector: queryEmbedding,
      limit,
      score_threshold: this.config.similarity_threshold,
    });

    return results.map((result) => ({
      id: result.id as string,
      content: result.payload.content as string,
      metadata: {
        source: result.payload.source,
        type: result.payload.type,
        url: result.payload.url,
        title: result.payload.title,
        date: result.payload.date,
        ...result.payload,
      },
    }));
  }
} 