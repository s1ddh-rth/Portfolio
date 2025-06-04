import { HuggingFaceTransformersEmbeddings } from "langchain/embeddings/hf_transformers";

export class Embeddings {
  private model: HuggingFaceTransformersEmbeddings;

  constructor() {
    this.model = new HuggingFaceTransformersEmbeddings({
      modelName: "Xenova/all-MiniLM-L6-v2",
    });
  }

  async getEmbedding(text: string): Promise<number[]> {
    const embeddings = await this.model.embedQuery(text);
    return embeddings;
  }

  async getEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings = await this.model.embedDocuments(texts);
    return embeddings;
  }
} 