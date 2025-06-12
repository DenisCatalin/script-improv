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
  'sleepy': 'tired and sleepy',
  'paranoid': 'extremely paranoid and suspicious of everything',
  'drunk': 'drunk and slurring words, saying ridiculous things',
  'overly-positive': 'annoyingly positive about everything, even terrible situations',
  'conspiracy-theorist': 'believing in wild conspiracy theories and connecting everything to aliens or government plots',
  'valley-girl': 'speaking like a stereotypical valley girl with "like", "totally", "whatever"',
  'robot': 'speaking in a robotic, mechanical way with beeps and technical jargon',
  'pirate': 'speaking like a pirate with "arr", "matey", "ye scurvy dog"',
  'gangster': 'speaking like a 1920s gangster with "see", "capisce", tough guy attitude',
  'hippie': 'speaking like a 1960s hippie with "man", "far out", "groovy", peace and love',
  'karen': 'speaking like an entitled Karen wanting to speak to managers and complaining',
  'surfer-dude': 'speaking like a surfer with "dude", "gnarly", "radical", very laid back',
  'old-person': 'speaking like a grumpy old person complaining about "kids these days"',
  'toddler': 'speaking like a toddler with simple words, tantrums, and childish logic',
  'alien': 'speaking like an alien trying to understand human behavior, very confused about Earth customs'
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

    const prompt = `Create a HILARIOUS and ABSURD dialogue between ${character1} and ${character2} ${location}. The situation is: ${theme}

Character moods:
- ${character1} is ${char1MoodDesc}
- ${character2} is ${char2MoodDesc}

COMEDY REQUIREMENTS:
- Make this dialogue absolutely HILARIOUS and ridiculous
- Include unexpected twists, absurd logic, and funny misunderstandings
- Use exaggerated reactions and over-the-top responses
- Add physical comedy references (stumbling, weird noises, etc.)
- Include funny wordplay, puns, or malapropisms where appropriate
- Make the characters completely commit to their ridiculous moods
- Add unexpected plot developments that make no sense but are funny
- Include references to random, absurd things (like arguing about soup temperatures in space)

STYLE NOTES:
- Dialogue should be snappy and fast-paced
- Each character should have distinctly different speaking patterns based on their mood
- Include some physical actions in parentheses for extra comedy
- Make sure every line advances the comedy and absurdity
- Don't be afraid to make it completely ridiculous - the funnier the better!

Please generate exactly 6-8 lines of dialogue that captures their unique personalities, speaking styles, and current moods. The dialogue should be EXTREMELY FUNNY but smart at the same time, and true to their characters while reflecting their emotional states in the most comedic way possible.${languageInstruction}

CRITICAL: Format your response as VALID JSON only. No explanations, no extra text, just the JSON array.

Format your response EXACTLY like this valid JSON (no trailing commas):
[
  {"id": "1", "character": "${character1}", "text": "dialogue line here"},
  {"id": "2", "character": "${character2}", "text": "dialogue line here"}
]

IMPORTANT JSON RULES:
- NO trailing commas before closing brackets
- Use proper double quotes for all strings
- Escape any quotes inside dialogue text with \"
- Return ONLY the JSON array, nothing else

Remember: MAXIMUM COMEDY, but smart at the same time! Make it so funny that people will laugh out loud! Make it so that the dialogue is not only funny, but also smart and engaging.`;

          const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a COMEDY GENIUS and master of hilarious dialogue! You specialize in creating absolutely HILARIOUS conversations between characters that make people laugh out loud. You're an expert at:
            
            - Creating absurd, unexpected situations and responses
            - Writing dialogue that escalates comedy with each line
            - Incorporating physical comedy and visual gags through dialogue
            - Making characters commit fully to ridiculous scenarios
            - Using wordplay, misunderstandings, and comic timing
            - Creating dialogue so funny it could be in a comedy show
            - Returning ONLY valid JSON without any explanations or extra text
            
            CRITICAL: You MUST return ONLY a valid JSON array. No explanations, no extra text, no trailing commas. Just the JSON array with proper formatting.
            
            Your goal is MAXIMUM COMEDY - every line should build on the absurdity and make the situation funnier. Don't hold back - the more ridiculous and unexpected, the better! ${language !== 'en' ? `You are fluent in ${languageName} and can create natural dialogue in that language while maintaining character authenticity and maximum humor.` : ''}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1200,
        temperature: 0.9,
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
      console.log('Initial JSON parse failed, trying to clean up response:', responseText);
      
      // If parsing fails, try to extract and clean JSON from the response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        let cleanedJson = jsonMatch[0];
        
        // Remove trailing commas before closing brackets/braces
        cleanedJson = cleanedJson.replace(/,(\s*[}\]])/g, '$1');
        
        // Fix any other common JSON issues
        cleanedJson = cleanedJson.replace(/[\u0000-\u001F\u007F-\u009F]/g, ''); // Remove control characters
        cleanedJson = cleanedJson.replace(/\n/g, '\\n'); // Escape newlines in strings
        
        console.log('Cleaned JSON:', cleanedJson);
        
        try {
          dialogue = JSON.parse(cleanedJson);
        } catch (secondParseError) {
          console.error('Second JSON parse failed:', secondParseError);
          console.log('Cleaned JSON that failed:', cleanedJson);
          
          // Last resort: try to manually extract dialogue lines
          const lines = responseText.match(/"character":\s*"([^"]+)"[^}]*"text":\s*"([^"]+)"/g);
          if (lines) {
            dialogue = lines.map((line, index) => {
              const charMatch = line.match(/"character":\s*"([^"]+)"/);
              const textMatch = line.match(/"text":\s*"([^"]+)"/);
              return {
                id: `line-${index + 1}`,
                character: charMatch ? charMatch[1] : 'Unknown',
                text: textMatch ? textMatch[1] : 'Unknown'
              };
            });
          } else {
            throw new Error('Failed to parse AI response and extract dialogue');
          }
        }
      } else {
        throw new Error('No valid JSON array found in response');
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