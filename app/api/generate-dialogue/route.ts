import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const LANGUAGE_NAMES: { [key: string]: string } = {
  'ro': 'Romanian',
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'ja': 'Japanese',
  'ko': 'Korean',
  'zh': 'Chinese',
  'ar': 'Arabic',
  'hi': 'Hindi'
};

const MOOD_DESCRIPTIONS: { [key: string]: string } = {
  'normal': 'speaking normally',
  'happy': 'in a very happy and cheerful mood',
  'angry': 'angry and frustrated',
  'sarcastic': 'being sarcastic and witty',
  'dramatic': 'being overly dramatic and theatrical',
  'confused': 'confused and puzzled',
  'flirty': 'being flirtatious and charming',
  'sleepy': 'tired and sleepy'
};

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your .env.local file.' },
        { status: 500 }
      );
    }

    const { character1, character2, location, theme, language = 'en', character1Mood = 'normal', character2Mood = 'normal' } = await request.json();

    if (!character1 || !character2 || !location || !theme) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Generating dialogue with:', { character1, character2, location, theme, language, character1Mood, character2Mood });

    const languageName = LANGUAGE_NAMES[language] || 'English';
    const char1MoodDesc = MOOD_DESCRIPTIONS[character1Mood] || 'speaking normally';
    const char2MoodDesc = MOOD_DESCRIPTIONS[character2Mood] || 'speaking normally';
    
    const languageInstruction = language === 'en' ? '' : `\n\nIMPORTANT: Generate the dialogue entirely in ${languageName}. All character speech should be in ${languageName}, staying true to their personalities but speaking in ${languageName}.`;

    const prompt = `Create a funny dialogue between ${character1} and ${character2} ${location}. The situation is: ${theme}

Character moods:
- ${character1} is ${char1MoodDesc}
- ${character2} is ${char2MoodDesc}

Please generate exactly 6-8 lines of dialogue that captures their unique personalities, speaking styles, and current moods. The dialogue should be engaging, funny, and true to their characters while reflecting their emotional states.${languageInstruction}

Format your response as a JSON array with objects containing "character" and "text" fields. Each line should have a unique id field as well.

Example format:
[
  {"id": "1", "character": "${character1}", "text": "dialogue line here"},
  {"id": "2", "character": "${character2}", "text": "dialogue line here"}
]

Make sure the dialogue flows naturally and is entertaining while showing their moods!`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a creative writer who specializes in character dialogue. You understand different character personalities and can write authentic, funny dialogue that captures their essence and emotional states. ${language !== 'en' ? `You are fluent in ${languageName} and can create natural dialogue in that language while maintaining character authenticity.` : ''}`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.8,
    });

    const responseText = completion.choices[0]?.message?.content;
    
    if (!responseText) {
      throw new Error('No response from AI');
    }

    // Try to parse the JSON response
    let dialogue;
    try {
      dialogue = JSON.parse(responseText);
    } catch (parseError) {
      // If parsing fails, try to extract JSON from the response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        dialogue = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse AI response');
      }
    }

    // Ensure each dialogue line has proper structure
    const formattedDialogue = dialogue.map((line: any, index: number) => ({
      id: line.id || `line-${index + 1}`,
      character: line.character,
      text: line.text,
      mood: line.character === character1 ? character1Mood : character2Mood
    }));

    return NextResponse.json({ dialogue: formattedDialogue });
  } catch (error) {
    console.error('Error generating dialogue:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Check if it's an OpenAI API error
    if (error && typeof error === 'object' && 'error' in error) {
      console.error('OpenAI API error:', error);
      return NextResponse.json(
        { error: `OpenAI API error: ${(error as any).error?.message || 'Unknown API error'}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: `Failed to generate dialogue: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 