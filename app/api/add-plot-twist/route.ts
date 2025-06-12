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

Add a HILARIOUS and ABSOLUTELY ABSURD plot twist to this conversation! Create 2-3 additional dialogue lines that introduce the most ridiculous, unexpected element that changes everything. The plot twist should be COMPLETELY RIDICULOUS and could be:
- A BONKERS revelation about one of the characters (like they're secretly a robot, alien, or time traveler)
- An ABSURD event that happens (like a dinosaur walks by, or gravity stops working)
- A RIDICULOUS third party intervention (like their mom shows up, or a talking animal appears)
- A SILLY misunderstanding gets revealed (like they've been talking about completely different things)
- Something CRAZY from their past comes up (like they used to be circus performers or pirates)
- An RIDICULOUS emergency or crisis occurs (like an invasion of dancing lobsters)

COMEDY REQUIREMENTS:
- Make the plot twist ABSOLUTELY HILARIOUS and completely unexpected
- The more ridiculous and absurd, the better!
- Characters should react in over-the-top, funny ways
- Include physical comedy and ridiculous situations
- Don't be afraid to make it completely nonsensical - comedy first!
- Make it so absurd that it becomes hilarious

Make the plot twist the funniest thing possible and have the characters react with maximum comedy!${languageInstruction}

Please provide the COMPLETE updated dialogue (including the original lines + the new HILARIOUS plot twist lines) as a JSON array.

Format:
[
  {"id": "1", "character": "character name", "text": "dialogue text"},
  {"id": "2", "character": "character name", "text": "dialogue text"},
  ...
  {"id": "new1", "character": "character name", "text": "plot twist line 1"},
  {"id": "new2", "character": "character name", "text": "plot twist line 2"}
]

Remember: MAXIMUM COMEDY AND ABSURDITY!`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a COMEDY GENIUS who specializes in creating the most HILARIOUS and ABSURD plot twists! You're an expert at:
          
          - Creating completely ridiculous and unexpected developments
          - Making characters react in over-the-top, funny ways to absurd situations
          - Coming up with the most ridiculous scenarios that are so absurd they're hilarious
          - Escalating comedy to maximum levels with unexpected twists
          - Creating plot twists so funny they could be in a comedy show
          
          Your goal is to create the most RIDICULOUS, ABSURD, and HILARIOUS plot twist possible! Don't hold back - the more ridiculous, the better! ${language !== 'en' ? `You are fluent in ${languageName} and can create natural dialogue in that language while maintaining maximum comedy.` : ''}`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1200,
      temperature: 0.95, // Even higher temperature for maximum creativity and absurdity
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
          newDialogue = JSON.parse(cleanedJson);
        } catch (secondParseError) {
          console.error('Second JSON parse failed, falling back to simple plot twist');
          
          // Fallback: add a simple plot twist
          const plotTwists = language === 'ro' ? [
            "Stai puțin... tocmai am realizat că sunt de fapt un robot din viitor!",
            "OH NU! Tocmai mi-am amintit că sunt de fapt un agent secret în acoperire!",
            "Surpriză! Suntem de fapt într-un show TV și toată lumea ne privește!",
            "Moment... cred că tocmai am văzut un dinozaur trecând pe acolo!",
            "ATENȚIE! Tocmai am primit un mesaj că extratereștrii au aterizat în parcare!",
            "Nu o să crezi - tocmai mi-am dat seama că vorbim limbi diferite de 10 minute!"
          ] : [
            "Wait a minute... I just realized I'm actually a robot from the future!",
            "OH NO! I just remembered I'm actually an undercover secret agent!",
            "Surprise! We're actually on a TV show and everyone's watching us!",
            "Hold on... I think I just saw a dinosaur walk by over there!",
            "ATTENTION! I just got a message that aliens have landed in the parking lot!",
            "You won't believe this - I just realized we've been speaking different languages for 10 minutes!"
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
      } else {
        // Fallback: add a simple plot twist
        const plotTwists = language === 'ro' ? [
          "Stai puțin... tocmai am realizat că sunt de fapt un robot din viitor!",
          "OH NU! Tocmai mi-am amintit că sunt de fapt un agent secret în acoperire!",
          "Surpriză! Suntem de fapt într-un show TV și toată lumea ne privește!",
          "Moment... cred că tocmai am văzut un dinozaur trecând pe acolo!",
          "ATENȚIE! Tocmai am primit un mesaj că extratereștrii au aterizat în parcare!",
          "Nu o să crezi - tocmai mi-am dat seama că vorbim limbi diferite de 10 minute!"
        ] : [
          "Wait a minute... I just realized I'm actually a robot from the future!",
          "OH NO! I just remembered I'm actually an undercover secret agent!",
          "Surprise! We're actually on a TV show and everyone's watching us!",
          "Hold on... I think I just saw a dinosaur walk by over there!",
          "ATTENTION! I just got a message that aliens have landed in the parking lot!",
          "You won't believe this - I just realized we've been speaking different languages for 10 minutes!"
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