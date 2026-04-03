/**
 * OpenMAIC Client Service
 * Integrates PersonalLearningPro with OpenMAIC multi-agent classroom system
 */

import axios, { type AxiosInstance } from 'axios';

interface OpenMAICConfig {
  baseUrl: string;
  bridgeSecret?: string;
  timeout?: number;
}

interface ClassroomRequest {
  topic: string;
  materials?: string[];
  sceneTypes?: ('slides' | 'quiz' | 'simulation' | 'pbl')[];
  duration?: number;
}

interface ClassroomResponse {
  classroomId: string;
  status: 'pending' | 'generating' | 'ready' | 'error';
  url?: string;
  scenes?: any[];
}

export class OpenMAICClient {
  private client: AxiosInstance;
  private config: OpenMAICConfig;

  constructor(config: OpenMAICConfig) {
    this.config = {
      timeout: 30000,
      ...config,
    };

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.bridgeSecret && {
          'X-Bridge-Secret': this.config.bridgeSecret,
        }),
      },
    });
  }

  /**
   * Create a new AI classroom session
   */
  async createClassroom(request: ClassroomRequest): Promise<ClassroomResponse> {
    try {
      const response = await this.client.post('/api/classroom/create', request);
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to create classroom: ${error.message}`);
    }
  }

  /**
   * Get classroom status and details
   */
  async getClassroom(classroomId: string): Promise<ClassroomResponse> {
    try {
      const response = await this.client.get(`/api/classroom/${classroomId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to get classroom: ${error.message}`);
    }
  }

  /**
   * Generate interactive quiz from topic
   */
  async generateQuiz(topic: string, questionCount: number = 5) {
    try {
      const response = await this.client.post('/api/quiz/generate', {
        topic,
        questionCount,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to generate quiz: ${error.message}`);
    }
  }

  /**
   * Generate slides from content
   */
  async generateSlides(content: string, title?: string) {
    try {
      const response = await this.client.post('/api/slides/generate', {
        content,
        title,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to generate slides: ${error.message}`);
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/api/health');
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

// Singleton instance
let openMAICClient: OpenMAICClient | null = null;

export function getOpenMAICClient(): OpenMAICClient | null {
  if (!process.env.OPENMAIC_INTERNAL_URL) {
    console.warn('OpenMAIC integration disabled: OPENMAIC_INTERNAL_URL not configured');
    return null;
  }

  if (!openMAICClient) {
    openMAICClient = new OpenMAICClient({
      baseUrl: process.env.OPENMAIC_INTERNAL_URL,
      bridgeSecret: process.env.BRIDGE_SECRET,
    });
  }

  return openMAICClient;
}
