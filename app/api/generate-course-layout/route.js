import {
  GoogleGenAI,
} from '@google/genai';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { courseTable, usersTable } from '@/lib/schema';
import { currentUser } from '@clerk/nextjs/server';
import { generateImage } from '@/lib/ImageGeneration';
import { ensureUserExists } from '@/lib/ensureUser';
import { getAIConfigForTier, getGenerationConfig } from '@/lib/ai-config';
import { eq } from 'drizzle-orm';
const PROMPT = `Generate Learning Course depends on following
details. In which Make sure to add Course Name,
Description,Course Banner Image Prompt (Create a
modern, flat-style 2D digital illustration representing
user Topic. Include UI/UX elements such as mockup
screens, text blocks, icons, buttons, and creative
workspace tools. Add symbolic elements related to
user Course, like sticky notes, design components,
and visual aids. Use a vibrant color palette (blues,
purples, oranges) with a clean, professional look. The
illustration should feel creative, tech-savvy, and
educational, ideal for visualizing concepts in user
Course) for Course Banner in 3d format Chapter
Name , Topic under each chapters , Duration for
each chapters etc, in JSON format only
Schema:
{
  "course": {
    "name": "string",
    "description": "string",
    "category": "string",
    "level": "string",
    "includeVideo": "boolean",
    "noOfChapters": "number"
  },
  "bannerImagePrompt": "string",
  "chapters": [
    {
      "chapterName": "string",
      "duration": "string",
      "topics": [
        "string"
      ]
    }
  ]
}  level field should be as given by user easy moderate advanced
,
`
export async function POST(req) {
  const formData = await req.json();
  const user = await currentUser();

  // Fetch user's subscription tier from database
  const email = user?.primaryEmailAddress?.emailAddress;
  const [dbUser] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  const userTier = dbUser?.tier || 'Free';

  // Get AI configuration based on user's tier
  const aiConfig = getAIConfigForTier(userTier);
  const generationConfig = getGenerationConfig(userTier);

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const config = generationConfig;
  const model = aiConfig.model;
  const contents = [
    {
      role: 'user',
      parts: [{
        text: PROMPT + JSON.stringify(formData)
      }]
    }
  ]
  const response = await ai.models.generateContent({
    model,
    config,
    contents,
  });

  const RawResponse = response.candidates[0].content.parts[0].text;
  const RawJson = RawResponse.replace('```json', '').replace('```', '');
  const JSONResponse = JSON.parse(RawJson);
  // genearting banner for course
  const courseBannerUrl = await generateImage(JSONResponse.bannerImagePrompt);

  // Ensure user exists in database before creating course
  await ensureUserExists(user);

  // storing course in database
  await db.insert(courseTable).values({
    ...formData,
    courseJson: JSONResponse,
    cid: formData?.courseId,
    userEmail: user?.primaryEmailAddress?.emailAddress,
    courseBannerUrl
  })

  return NextResponse.json({ courseId: formData?.courseId });
}