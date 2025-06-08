import { readFileSync } from 'fs';
import { PDFExtract } from 'pdf.js-extract';
import { marked } from 'marked';
import { KnowledgeBase } from './base';
import { ResumeConfig, PortfolioDocument } from './types';

export class ResumeKnowledge extends KnowledgeBase {
  private resumeConfig: ResumeConfig;
  private pdfExtract: PDFExtract;

  constructor(base: KnowledgeBase, resumeConfig: ResumeConfig) {
    super(base);
    this.resumeConfig = resumeConfig;
    this.pdfExtract = new PDFExtract();
  }

  async refresh() {
    await this.clearSource('resume');
    const documents = await this.parseResume();
    await this.addDocuments(documents);
  }

  private async parseResume(): Promise<PortfolioDocument[]> {
    const { filePath, format } = this.resumeConfig;
    let content = '';

    switch (format) {
      case 'json':
        const jsonContent = JSON.parse(readFileSync(filePath, 'utf-8'));
        content = this.parseJsonResume(jsonContent);
        break;

      case 'pdf':
        const pdfData = await this.pdfExtract.extract(filePath);
        content = pdfData.pages.map(page => page.content.map(item => item.str).join(' ')).join('\n');
        break;

      case 'markdown':
        const mdContent = readFileSync(filePath, 'utf-8');
        content = marked.parse(mdContent);
        break;

      default:
        throw new Error(`Unsupported resume format: ${format}`);
    }

    // Split resume into sections for better retrieval
    const sections = this.splitIntoSections(content);
    return sections.map(section => ({
      pageContent: section.content,
      metadata: {
        source: 'resume',
        type: section.type,
        title: section.title,
      },
    }));
  }

  private parseJsonResume(json: any): string {
    const sections = [];

    if (json.basics) {
      sections.push(`# Personal Information\n${json.basics.summary || ''}`);
    }

    if (json.work) {
      sections.push('# Work Experience\n' + json.work.map((job: any) => 
        `${job.position} at ${job.company} (${job.startDate} - ${job.endDate})\n${job.summary}`
      ).join('\n\n'));
    }

    if (json.education) {
      sections.push('# Education\n' + json.education.map((edu: any) =>
        `${edu.studyType} in ${edu.area} from ${edu.institution} (${edu.startDate} - ${edu.endDate})`
      ).join('\n\n'));
    }

    if (json.skills) {
      sections.push('# Skills\n' + json.skills.map((skill: any) =>
        `${skill.name}: ${skill.keywords?.join(', ')}`
      ).join('\n'));
    }

    return sections.join('\n\n');
  }

  private splitIntoSections(content: string): Array<{type: string; title: string; content: string}> {
    // Basic section splitting based on headers
    const sections = content.split(/(?=# )/);
    return sections.map(section => {
      const [title, ...content] = section.split('\n');
      return {
        type: 'section',
        title: title.replace('# ', '').trim(),
        content: content.join('\n').trim(),
      };
    }).filter(section => section.content.length > 0);
  }
} 