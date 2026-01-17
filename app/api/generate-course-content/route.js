import { CREDITS_PER_COURSE } from '@/config/subscriptions';
import { db } from '@/lib/db';
import { courseTable, usersTable } from '@/lib/schema';
import { GoogleGenAI } from '@google/genai';
import axios from 'axios';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getAIConfigForTier, getGenerationConfig } from '@/lib/ai-config';

const PROMPT = `
Depends on Chapter name and Topic, generate content for each topic in HTML.
Respond strictly in JSON format.

Schema:
{
  chapterName: "<chapter name>",
  topics: [
    {
      topic: "<topic name>",
      content: "<HTML content string>"
    }
  ]
}
Only return valid JSON. Do not use markdown or triple backticks.
`;

export async function POST(req) {
  const { courseJson, courseTitle, courseId, userEmail } = await req.json();

  // Check user credits
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, userEmail));
  if (!user || user.credits < CREDITS_PER_COURSE) {
    return new NextResponse("Insufficient credits", { status: 403 });
  }

  // Fetch user's subscription tier
  const [dbUser] = await db.select().from(usersTable).where(eq(usersTable.email, userEmail));
  const userTier = dbUser?.tier || 'Free';

  // Get AI configuration based on user's tier
  const aiConfig = getAIConfigForTier(userTier);
  const generationConfig = getGenerationConfig(userTier);

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const model = aiConfig.model;
  const config = generationConfig;

  const promises = courseJson?.chapters?.map(async (chapter) => {
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: PROMPT + '\n' + JSON.stringify(chapter),
          },
        ],
      },
    ];

    const response = await ai.models.generateContent({ model, config, contents });
    let rawText = response.candidates[0].content.parts[0].text;

    // Sanitize the response
    rawText = rawText
      .replace(/```json|```/g, '')
      .replace(/[\u0000-\u001F]+/g, '')
      .trim();

    const youtubeData = await getRecommendedYoutubeVideo(chapter?.chapterName);
    try {
      const courseData = JSON.parse(rawText);

      // Generate quiz for this chapter
      const quizData = await generateQuizForChapter(courseData, chapter?.chapterName, ai, model, config, userTier);

      return {
        courseData,
        youtubeVideo: youtubeData,
        quiz: quizData
      };
    } catch (err) {
      console.error('❌ JSON Parse Error:', err.message);
      console.log('🔍 Raw Response:', rawText);
      throw new Error('Invalid JSON from AI response');
    }
  });

  const courseContent = await Promise.all(promises);

  // Extract quiz data for storage
  const quizData = {};
  courseContent.forEach((content, index) => {
    const chapterName = courseJson?.chapters[index]?.chapterName;
    if (chapterName && content.quiz) {
      quizData[chapterName] = content.quiz;
    }
  });

  await db.update(courseTable).set({
    courseContent: courseContent,
    quiz: quizData
  }).where(eq(courseTable.cid, courseId))

  // Deduct credits
  await db.update(usersTable).set({
    credits: user.credits - CREDITS_PER_COURSE
  }).where(eq(usersTable.email, userEmail));

  return NextResponse.json({
    courseTitle,
    courseId,
    courseContent,
    quiz: quizData
  });
}


const getRecommendedYoutubeVideo = async (topic) => {
  const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3/search';
  const params = {
    part: 'snippet',
    maxResults: 4,
    q: topic,
    key: process.env.YOUTUBE_API_KEY,
    type: 'video'
  }

  const response = await axios.get(YOUTUBE_BASE_URL, { params });
  const YoutubeVideoListResponse = response.data.items;
  const YouTubeVideoList = [];
  YoutubeVideoListResponse.map((item) => {
    const data = {
      videoId: item?.id?.videoId,
      title: item?.snippet?.title
    }
    YouTubeVideoList.push(data);
  });
  return YouTubeVideoList;
}

const generateQuizForChapter = async (courseData, chapterName, ai, model, config, userTier) => {
  const QUIZ_PROMPT = `
Generate exactly 5 multiple-choice questions based on the following chapter content.
Each question must test understanding of the key concepts.

Requirements:
- Each question must have exactly 4 options
- Only one option should be correct
- Include an explanation for why the correct answer is right
- Questions should be clear and unambiguous
- Cover different aspects of the content

Return ONLY valid JSON in this exact format (no markdown, no backticks):
[
  {
    "questionText": "Question here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswerIndex": 0,
    "explanation": "Explanation of why this is correct"
  }
]

Chapter content:
`;

  try {
    // Combine all topic content into one string
    const contentText = courseData.topics?.map(t => `${t.topic}: ${t.content}`).join('\n\n') || '';

    const quizContents = [
      {
        role: 'user',
        parts: [
          {
            text: QUIZ_PROMPT + '\n\n' + contentText,
          },
        ],
      },
    ];

    const quizResponse = await ai.models.generateContent({ model, config, contents: quizContents });
    let quizRawText = quizResponse.candidates[0].content.parts[0].text;

    // Sanitize the response
    quizRawText = quizRawText
      .replace(/```json|```/g, '')
      .replace(/[\u0000-\u001F]+/g, '')
      .trim();

    const quizData = JSON.parse(quizRawText);

    // Validate quiz structure
    if (!Array.isArray(quizData) || quizData.length !== 5) {
      console.warn(`Quiz for ${chapterName} doesn't have exactly 5 questions, using anyway`);
    }

    return quizData;
  } catch (error) {
    console.error(`Error generating quiz for ${chapterName}:`, error.message);
    // Return empty array if quiz generation fails
    return [];
  }
}