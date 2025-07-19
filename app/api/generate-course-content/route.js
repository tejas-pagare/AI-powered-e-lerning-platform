import { db } from '@/lib/db';
import { courseTable } from '@/lib/schema';
import { GoogleGenAI } from '@google/genai';
import axios from 'axios';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

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
  const { courseJson, courseTitle, courseId } = await req.json();

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const model = 'gemini-2.5-pro';
  const config = { responseMimeType: 'text/plain' };

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

      return {
        courseData:JSON.parse(rawText),
        youtubeVideo:youtubeData
      };
    } catch (err) {
      console.error('❌ JSON Parse Error:', err.message);
      console.log('🔍 Raw Response:', rawText);
      throw new Error('Invalid JSON from AI response');
    }
  });

  const courseContent = await Promise.all(promises);
  await db.update(courseTable).set({
    courseContent:courseContent
  }).where(eq(courseTable.cid,courseId))
  return NextResponse.json({
    courseTitle,
    courseId,
    courseContent,
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