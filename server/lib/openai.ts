import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "sk-dummy-key-for-development" 
});

interface EvaluationResult {
  score: number;
  confidence: number;
  feedback: string;
}

export async function evaluateSubjectiveAnswer(
  studentAnswer: string,
  question: string,
  rubric: string,
  maxMarks: number
): Promise<EvaluationResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert teacher evaluating student answers. 
          Given the question, rubric, and student's answer, provide an evaluation with:
          1. A score between 0 and ${maxMarks} (can be decimal)
          2. A confidence level between 0 and 100 indicating how certain you are of your evaluation
          3. Constructive feedback explaining the score
          
          Respond with JSON in this format: { "score": number, "confidence": number, "feedback": string }`
        },
        {
          role: "user",
          content: `Question: ${question}\nRubric: ${rubric}\nStudent Answer: ${studentAnswer}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content) as EvaluationResult;
    
    // Ensure values are within expected ranges
    return {
      score: Math.max(0, Math.min(maxMarks, result.score)),
      confidence: Math.max(0, Math.min(100, result.confidence)),
      feedback: result.feedback
    };
  } catch (error) {
    console.error("AI evaluation error:", error);
    // Fallback response if AI service fails
    return {
      score: 0,
      confidence: 0,
      feedback: "Unable to evaluate answer due to system error. Please review manually."
    };
  }
}

export async function generateStudyPlan(
  weakTopics: string[],
  strongTopics: string[],
  subject: string
): Promise<{ plan: string, resources: Array<{ title: string, type: string, url?: string }> }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Generate a personalized study plan focused on improving weak topics, along with recommended resources.
          Return a JSON object with two fields:
          1. "plan": a structured study plan with bullet points and time estimates
          2. "resources": an array of recommended resources, each with "title", "type" (video, article, practice), and optional "url"
          
          Keep the response concise and focused on actionable advice.`
        },
        {
          role: "user",
          content: `Subject: ${subject}
          Weak Topics: ${weakTopics.join(", ")}
          Strong Topics: ${strongTopics.join(", ")}`
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Study plan generation error:", error);
    // Fallback response
    return {
      plan: "Study plan generation failed. Please focus on reviewing the weak topics identified in your assessment.",
      resources: [
        {
          title: "General review resources",
          type: "general"
        }
      ]
    };
  }
}

export async function analyzeTestPerformance(
  testResults: Array<{ studentId: number, score: number, answers: Array<{ questionId: number, score: number, question: string }> }>
): Promise<{ 
  averageScore: number, 
  hardestQuestions: Array<{ questionId: number, question: string, avgScore: number }>,
  recommendations: string
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Analyze test performance data and provide insights.
          Return a JSON object with:
          1. "averageScore": the calculated average score
          2. "hardestQuestions": an array of questions with lowest average scores (max 3)
          3. "recommendations": teaching recommendations based on the results`
        },
        {
          role: "user",
          content: `Test Data: ${JSON.stringify(testResults)}`
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Test analysis error:", error);
    // Fallback response
    return {
      averageScore: testResults.reduce((sum, result) => sum + result.score, 0) / testResults.length,
      hardestQuestions: [],
      recommendations: "Performance analysis failed. Please review individual student results."
    };
  }
}
