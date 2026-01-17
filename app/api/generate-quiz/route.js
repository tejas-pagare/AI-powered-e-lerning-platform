import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const QUIZ_PROMPT = `
Generate exactly 5 multiple-choice questions based on the following HTML content.
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

Content to generate questions from:
`;

export async function POST(req) {
    try {
        const { htmlContent, chapterName } = await req.json();

        if (!htmlContent || !chapterName) {
            return NextResponse.json(
                { error: 'htmlContent and chapterName are required' },
                { status: 400 }
            );
        }

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });

        const model = 'gemini-3-flash-preview';
        const config = { responseMimeType: 'text/plain' };

        const contents = [
            {
                role: 'user',
                parts: [
                    {
                        text: QUIZ_PROMPT + '\n\n' + htmlContent,
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

        try {
            const quizData = JSON.parse(rawText);

            // Validate quiz structure
            if (!Array.isArray(quizData) || quizData.length !== 5) {
                throw new Error('Quiz must contain exactly 5 questions');
            }

            // Validate each question
            quizData.forEach((q, index) => {
                if (!q.questionText || !Array.isArray(q.options) || q.options.length !== 4) {
                    throw new Error(`Invalid question structure at index ${index}`);
                }
                if (typeof q.correctAnswerIndex !== 'number' || q.correctAnswerIndex < 0 || q.correctAnswerIndex > 3) {
                    throw new Error(`Invalid correctAnswerIndex at index ${index}`);
                }
                if (!q.explanation) {
                    throw new Error(`Missing explanation at index ${index}`);
                }
            });

            return NextResponse.json({
                chapterName,
                quiz: quizData,
            });
        } catch (err) {
            console.error('❌ Quiz Generation Error:', err.message);
            console.log('🔍 Raw Response:', rawText);
            return NextResponse.json(
                { error: 'Failed to generate valid quiz', details: err.message },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error in quiz generation:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
