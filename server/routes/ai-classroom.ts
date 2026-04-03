/**
 * AI Classroom Routes
 * Endpoints for OpenMAIC integration
 */

import { Router } from 'express';
import { z } from 'zod';
import { getOpenMAICClient } from '../services/openmaic-client';

const router = Router();

// Request schemas
const createClassroomSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  materials: z.array(z.string()).optional(),
  sceneTypes: z.array(z.enum(['slides', 'quiz', 'simulation', 'pbl'])).optional(),
  duration: z.number().positive().optional(),
});

const generateQuizSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  questionCount: z.number().int().min(1).max(20).default(5),
});

const generateSlidesSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  title: z.string().optional(),
});

/**
 * POST /api/ai-classroom/create
 * Create a new AI classroom session
 */
router.post('/create', async (req, res) => {
  try {
    const client = getOpenMAICClient();
    if (!client) {
      return res.status(503).json({
        error: 'AI Classroom service is not configured',
      });
    }

    const data = createClassroomSchema.parse(req.body);
    const classroom = await client.createClassroom({
      topic: data.topic,
      materials: data.materials,
      sceneTypes: data.sceneTypes,
      duration: data.duration,
    });

    res.json(classroom);
  } catch (error: any) {
    console.error('Error creating classroom:', error);
    res.status(500).json({
      error: error.message || 'Failed to create classroom',
    });
  }
});

/**
 * GET /api/ai-classroom/:classroomId
 * Get classroom details
 */
router.get('/:classroomId', async (req, res) => {
  try {
    const client = getOpenMAICClient();
    if (!client) {
      return res.status(503).json({
        error: 'AI Classroom service is not configured',
      });
    }

    const { classroomId } = req.params;
    const classroom = await client.getClassroom(classroomId);

    res.json(classroom);
  } catch (error: any) {
    console.error('Error fetching classroom:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch classroom',
    });
  }
});

/**
 * POST /api/ai-classroom/quiz/generate
 * Generate an interactive quiz
 */
router.post('/quiz/generate', async (req, res) => {
  try {
    const client = getOpenMAICClient();
    if (!client) {
      return res.status(503).json({
        error: 'AI Classroom service is not configured',
      });
    }

    const data = generateQuizSchema.parse(req.body);
    const quiz = await client.generateQuiz(data.topic, data.questionCount);

    res.json(quiz);
  } catch (error: any) {
    console.error('Error generating quiz:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate quiz',
    });
  }
});

/**
 * POST /api/ai-classroom/slides/generate
 * Generate presentation slides
 */
router.post('/slides/generate', async (req, res) => {
  try {
    const client = getOpenMAICClient();
    if (!client) {
      return res.status(503).json({
        error: 'AI Classroom service is not configured',
      });
    }

    const data = generateSlidesSchema.parse(req.body);
    const slides = await client.generateSlides(data.content, data.title);

    res.json(slides);
  } catch (error: any) {
    console.error('Error generating slides:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate slides',
    });
  }
});

/**
 * GET /api/ai-classroom/health
 * Check if OpenMAIC service is available
 */
router.get('/health', async (req, res) => {
  try {
    const client = getOpenMAICClient();
    if (!client) {
      return res.json({
        available: false,
        message: 'OpenMAIC not configured',
      });
    }

    const isHealthy = await client.healthCheck();
    res.json({
      available: isHealthy,
      message: isHealthy ? 'OpenMAIC is available' : 'OpenMAIC is not responding',
    });
  } catch (error: any) {
    res.json({
      available: false,
      message: error.message,
    });
  }
});

export default router;
