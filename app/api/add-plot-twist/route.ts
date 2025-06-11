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

export async function POST(request: NextRequest) {
  try {
    const { character1, character2, location, theme, dialogue, language = 'en' } = await request.json();

    if (!character1 || !character2 || !location || !theme || !dialogue || dialogue.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields or empty dialogue' },
        { status: 400 }
      );
    }

    const languageName = LANGUAGE_NAMES[language] || 'English';
    const languageInstruction = language === 'en' ? '' : `\n\nIMPORTANT: Continue the dialogue entirely in ${languageName}. All new lines should be in ${languageName} while maintaining character authenticity.`;

    // Build the existing dialogue context
    const existingDialogue = dialogue.map((line: any) => `${line.character}: ${line.text}`).join('\n');

    const prompt = `Given this existing dialogue between ${character1} and ${character2} ${location} where ${theme}:

${existingDialogue}

Add a sudden plot twist to this conversation! Create 2-3 additional dialogue lines that introduce an unexpected element that changes everything. The plot twist could be:
- A surprising revelation about one of the characters
- An unexpected event that happens
- A third party intervention
- A misunderstanding gets revealed
- Something from their past comes up
- An emergency or crisis occurs

Make the plot twist funny, surprising, and engaging. The characters should react naturally to this unexpected development.${languageInstruction}

Please provide the COMPLETE updated dialogue (including the original lines + the new plot twist lines) as a JSON array.

Format:
[
  {"id": "1", "character": "character name", "text": "dialogue text"},
  {"id": "2", "character": "character name", "text": "dialogue text"},
  ...
  {"id": "new1", "character": "character name", "text": "plot twist line 1"},
  {"id": "new2", "character": "character name", "text": "plot twist line 2"}
]`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a creative writer who excels at adding surprising plot twists to ongoing conversations. You understand character dynamics and can create unexpected but believable developments that enhance the comedy and drama. ${language !== 'en' ? `You are fluent in ${languageName} and can create natural dialogue in that language.` : ''}`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1200,
      temperature: 0.9, // Higher temperature for more creative plot twists
    });

    const responseText = completion.choices[0]?.message?.content;
    
    if (!responseText) {
      throw new Error('No response from AI');
    }

    // Try to parse the JSON response
    let newDialogue;
    try {
      newDialogue = JSON.parse(responseText);
    } catch (parseError) {
      // If parsing fails, try to extract JSON from the response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        newDialogue = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: add a simple plot twist
        const plotTwists = language === 'ro' ? [
          "Stai puțin... cred că am văzut pe cineva familiar pe aici!",
          "Oh nu! Tocmai mi-am amintit că am o întâlnire importantă!",
          "Surpriză! Nu sunt cu adevărat cine crezi că sunt!",
          "Moment... telefonul meu sună și e... ȘEFUL!"
        ] : [
          "Wait a minute... I think I just saw someone familiar around here!",
          "Oh no! I just remembered I have an important meeting!",
          "Surprise! I'm not really who you think I am!",
          "Hold on... my phone is ringing and it's... THE BOSS!"
        ];
        
        const randomTwist = plotTwists[Math.floor(Math.random() * plotTwists.length)];
        const extendedDialogue = [
          ...dialogue,
          {
            id: `twist-${Date.now()}`,
            character: Math.random() > 0.5 ? character1 : character2,
            text: randomTwist
          }
        ];
        
        return NextResponse.json({ dialogue: extendedDialogue });
      }
    }

    // Ensure proper structure and IDs
    const formattedDialogue = newDialogue.map((line: any, index: number) => ({
      id: line.id || `line-${index + 1}`,
      character: line.character,
      text: line.text
    }));

    return NextResponse.json({ dialogue: formattedDialogue });
  } catch (error) {
    console.error('Error adding plot twist:', error);
    return NextResponse.json(
      { error: 'Failed to add plot twist' },
      { status: 500 }
    );
  }
} 