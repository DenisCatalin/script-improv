import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function GET() {
  try {
    // Check if API key exists
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        status: 'error',
        message: 'OpenAI API key not found in environment variables',
        solution: 'Please add OPENAI_API_KEY to your .env.local file'
      });
    }

    // Check if API key format looks correct
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey.startsWith('sk-')) {
      return NextResponse.json({
        status: 'error',
        message: 'OpenAI API key format appears incorrect',
        solution: 'API key should start with "sk-"'
      });
    }

    // Test the API connection
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: 'Say "API connection successful!" in exactly those words.'
        }
      ],
      max_tokens: 10,
    });

    const response = completion.choices[0]?.message?.content;

    return NextResponse.json({
      status: 'success',
      message: 'OpenAI API is working correctly',
      response: response,
      model: completion.model,
      usage: completion.usage
    });

  } catch (error: unknown) {
    console.error('OpenAI API test error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorType = error instanceof Error && 'type' in error ? (error as any).type : 'unknown';
    
    return NextResponse.json({
      status: 'error',
      message: 'OpenAI API test failed',
      error: errorMessage,
      type: errorType,
      solution: errorMessage.includes('API key') 
        ? 'Check your OpenAI API key in .env.local'
        : errorMessage.includes('quota')
        ? 'Check your OpenAI account billing and usage limits'
        : 'Check your internet connection and OpenAI service status'
    });
  }
} 