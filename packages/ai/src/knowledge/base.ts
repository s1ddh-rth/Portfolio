import { QdrantClient } from 'qdrant';
import { Document } from '@langchain/core/documents';
import { Embeddings } from '@langchain/core/embeddings';
import { QdrantVectorStore } from '@langchain/community/vectorstores/qdrant';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { KnowledgeBaseConfig, PortfolioDocument, DocumentMetadata } from './types';

export class KnowledgeBase {
  private client: QdrantClient;
  private embeddings: Embeddings;
  private vectorStore: QdrantVectorStore;
  private config: KnowledgeBaseConfig;
  private collectionName: string;

  constructor(
    client: QdrantClient,
    embeddings: Embeddings,
    config: KnowledgeBaseConfig,
    collectionName = 'portfolio_knowledge'
  ) {
    this.client = client;
    this.embeddings = embeddings;
    this.config = config;
    this.collectionName = collectionName;
  }

  async initialize() {
    // Create vector store if it doesn't exist
    try {
      const collections = await this.client.getCollections();
      const exists = collections.collections.some(c => c.name === this.collectionName);

      if (!exists) {
        await this.client.createCollection(this.collectionName, {
          vectors: {
            size: 1536, // Default size for OpenAI embeddings
            distance: 'Cosine',
          },
        });
      }

      this.vectorStore = new QdrantVectorStore(this.embeddings, {
        client: this.client,
        collectionName: this.collectionName,
      });
    } catch (error) {
      console.error('Failed to initialize vector store:', error);
      throw error;
    }
  }

  protected async addDocuments(documents: PortfolioDocument[]) {
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splitDocs = await textSplitter.splitDocuments(documents);
    await this.vectorStore.addDocuments(splitDocs);
  }

  protected async clearSource(source: DocumentMetadata['source']) {
    const filter = {
      must: [
        {
          key: 'metadata.source',
          match: {
            value: source,
          },
        },
      ],
    };

    await this.client.delete(this.collectionName, filter);
  }

  async search(query: string, limit = 5): Promise<PortfolioDocument[]> {
    return this.vectorStore.similaritySearch(query, limit);
  }

  async refresh() {
    // To be implemented by specific source ingestors
  }
} 