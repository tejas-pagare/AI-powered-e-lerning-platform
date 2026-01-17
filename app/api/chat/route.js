import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const TUTOR_PROMPT = `You are an expert AI Tutor helping students understand course material.
Your goal is to answer student questions based ONLY on the provided chapter content.

[CHAPTER CONTENT START]
{CHAPTER_CONTENT}
[CHAPTER CONTENT END]

Rules:
1. Answer questions ONLY based on the chapter content above
2. If the answer is not in the content, politely say "I don't have that information in this chapter. Please ask me about the topics covered in this chapter."
3. Keep responses concise and clear (2-4 sentences)
4. Be encouraging and supportive in your tone
5. Use simple, student-friendly language
6. Format code snippets with markdown if needed
7. Use **bold** for emphasis on key concepts
8. If asked about future chapters or unrelated topics, redirect to current chapter content

Student Question: {USER_MESSAGE}

Provide a helpful, encouraging response:`;

export async function POST(req) {
    try {
        const { message, chapterContent, chapterName } = await req.json();

        if (!message || !chapterContent) {
            return NextResponse.json(
                { error: 'Message and chapter content are required' },
                { status: 400 }
            );
        }

        // Combine all topic content into readable text
        let contentText = '';
        if (typeof chapterContent === 'string') {
            // If it's HTML, strip tags for better context
            contentText = chapterContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        } else if (chapterContent.topics && Array.isArray(chapterContent.topics)) {
            contentText = chapterContent.topics
                .map(t => `${t.topic}: ${t.content.replace(/<[^>]*>/g, ' ')}`)
                .join('\n\n');
        }

        // Limit content length to avoid token limits (keep first 3000 chars)
        if (contentText.length > 3000) {
            contentText = contentText.substring(0, 3000) + '...';
        }

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });

        const model = 'gemini-3-flash-preview';
        const config = {
            responseMimeType: 'text/plain',
            temperature: 0.7, // Slightly creative but focused
        };

        const prompt = TUTOR_PROMPT
            .replace('{CHAPTER_CONTENT}', contentText)
            .replace('{USER_MESSAGE}', message);

        const contents = [
            {
                role: 'user',
                parts: [{ text: prompt }],
            },
        ];

        const response = await ai.models.generateContent({ model, config, contents });
        const aiResponse = response.candidates[0].content.parts[0].text;

        return NextResponse.json({
            response: aiResponse.trim(),
            success: true,
            chapterName: chapterName || 'Current Chapter',
        });
    } catch (error) {
        console.error('Error in chat API:', error);
        return NextResponse.json(
            {
                error: 'Failed to get response from AI tutor',
                details: error.message,
                success: false
            },
            { status: 500 }
        );
    }
}
