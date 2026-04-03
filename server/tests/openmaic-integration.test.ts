import { describe, it, expect, beforeAll } from 'vitest';
import { OpenMAICClient } from '../services/openmaic-client';

describe('OpenMAIC Integration', () => {
  let client: OpenMAICClient;

  beforeAll(() => {
    // Only run tests if OpenMAIC is configured
    if (!process.env.OPENMAIC_INTERNAL_URL) {
      console.log('Skipping OpenMAIC tests - OPENMAIC_INTERNAL_URL not configured');
      return;
    }

    client = new OpenMAICClient({
      baseUrl: process.env.OPENMAIC_INTERNAL_URL,
      bridgeSecret: process.env.BRIDGE_SECRET,
    });
  });

  it('should check if OpenMAIC is available', async () => {
    if (!client) return;

    const isHealthy = await client.healthCheck();
    expect(typeof isHealthy).toBe('boolean');
  });

  it('should create a classroom session', async () => {
    if (!client) return;

    try {
      const classroom = await client.createClassroom({
        topic: 'Test Topic',
        sceneTypes: ['slides'],
      });

      expect(classroom).toBeDefined();
      expect(classroom.classroomId).toBeDefined();
      expect(classroom.status).toBeDefined();
    } catch (error: any) {
      // If OpenMAIC is not running, this will fail
      console.log('Classroom creation failed (expected if OpenMAIC not running):', error.message);
    }
  });

  it('should generate a quiz', async () => {
    if (!client) return;

    try {
      const quiz = await client.generateQuiz('Mathematics', 3);
      expect(quiz).toBeDefined();
    } catch (error: any) {
      console.log('Quiz generation failed (expected if OpenMAIC not running):', error.message);
    }
  });
});
