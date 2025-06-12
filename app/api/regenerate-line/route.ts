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
    const { character1, character2, location, theme, dialogue, lineId, newText, language = 'en', character1Mood = 'normal', character2Mood = 'normal' } = await request.json();

    if (!character1 || !character2 || !location || !theme || !dialogue || !lineId || !newText) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find the line to replace
    const lineIndex = dialogue.findIndex((line: any) => line.id === lineId);
    if (lineIndex === -1) {
      return NextResponse.json(
        { error: 'Line not found' },
        { status: 404 }
      );
    }

    const lineToReplace = dialogue[lineIndex];
    const contextBefore = dialogue.slice(0, lineIndex);
    const contextAfter = dialogue.slice(lineIndex + 1);
    
    // Build context for the AI
    const contextLines = [
      ...contextBefore.map((line: any) => `${line.character}: ${line.text}`),
      `${lineToReplace.character}: ${newText}`,
      ...contextAfter.map((line: any) => `${line.character}: ${line.text}`)
    ];

    const otherCharacter = lineToReplace.character === character1 ? character2 : character1;
    const otherCharacterMood = lineToReplace.character === character1 ? character2Mood : character1Mood;
    const otherMoodDesc = MOOD_DESCRIPTIONS[otherCharacterMood] || 'speaking normally';
    
    const languageName = LANGUAGE_NAMES[language] || 'English';
    const languageInstruction = language === 'en' ? '' : `\n\nIMPORTANT: Generate all dialogue in ${languageName}. All character responses should be in ${languageName} while maintaining their personalities.`;

    const prompt = `Given this dialogue context between ${character1} and ${character2} ${location} where ${theme}:

${contextLines.join('\n')}

The line "${lineToReplace.character}: ${newText}" has been changed by the user. Please generate a HILARIOUS and ABSURD response from ${otherCharacter} that would make sense as the next line in this conversation. 

${otherCharacter} is currently ${otherMoodDesc}, so the response should reflect this mood in the FUNNIEST way possible.

COMEDY REQUIREMENTS:
- Make the response absolutely HILARIOUS and unexpected
- Have ${otherCharacter} react in an over-the-top, absurd way to the change
- Include ridiculous logic or misunderstandings
- Make it so funny that it escalates the comedy of the entire conversation
- Fully commit to their mood in the most comedic way possible
- Include physical comedy references if appropriate
- Don't be afraid to make it completely ridiculous

The response should:
1. Stay true to ${otherCharacter}'s character and personality
2. Reflect their current emotional state (${otherMoodDesc}) in a HILARIOUS way
3. React to the changed line with MAXIMUM COMEDY
4. Continue and escalate the comedic flow of the conversation
5. Fit the overall theme and setting while being absolutely ridiculous${languageInstruction}

Please provide the complete updated dialogue as a JSON array, incorporating the user's change and the new HILARIOUS response. Make sure to maintain the same id structure.

Format:
[
  {"id": "1", "character": "character name", "text": "dialogue text"},
  ...
]

Remember: MAXIMUM COMEDY! Make it so funny it's ridiculous!`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a COMEDY GENIUS who specializes in creating HILARIOUS character reactions! You're an expert at making characters respond to changes in conversation with maximum comedy and absurdity. You know how to:
          
          - Create unexpected, over-the-top reactions that are hilarious
          - Make characters fully commit to their ridiculous moods
          - Escalate comedy with each response
          - Use wordplay, misunderstandings, and absurd logic for maximum laughs
          - Create responses so funny they could be in a comedy show
          
          Your goal is to make every reaction HILARIOUSLY FUNNY and unexpected! ${language !== 'en' ? `You are fluent in ${languageName} and can create natural dialogue in that language while maintaining character authenticity and maximum humor.` : ''}`
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
          console.error('Second JSON parse failed, falling back to manual update');
          
          // Fallback: manually update the dialogue
          const updatedDialogue = [...dialogue];
          updatedDialogue[lineIndex] = {
            ...lineToReplace,
            text: newText
          };
          
          // Generate a simple response for the next character
          const nextLineIndex = lineIndex + 1;
          if (nextLineIndex < updatedDialogue.length) {
            const nextCharacter = updatedDialogue[nextLineIndex].character;
            const simpleResponses = language === 'ro' ? [
              "Stai, ce ai spus?",
              "Nu mă așteptam la asta.",
              "Hmm, interesant...",
              "Bine, asta schimbă lucrurile.",
              "Nu eram pregătit pentru răspunsul ăsta."
            ] : [
              "Wait, what did you just say?",
              "That's not what I expected to hear.",
              "Okay, that changes things...",
              "Well, that's interesting.",
              "I wasn't ready for that response."
            ];
            
            updatedDialogue[nextLineIndex] = {
              ...updatedDialogue[nextLineIndex],
              text: simpleResponses[Math.floor(Math.random() * simpleResponses.length)]
            };
          }
          
          return NextResponse.json({ dialogue: updatedDialogue });
        }
      } else {
        // Fallback: manually update the dialogue
        const updatedDialogue = [...dialogue];
        updatedDialogue[lineIndex] = {
          ...lineToReplace,
          text: newText
        };
        
        // Generate a simple response for the next character
        const nextLineIndex = lineIndex + 1;
        if (nextLineIndex < updatedDialogue.length) {
          const nextCharacter = updatedDialogue[nextLineIndex].character;
          const simpleResponses = language === 'ro' ? [
            "Stai, ce ai spus?",
            "Nu mă așteptam la asta.",
            "Hmm, interesant...",
            "Bine, asta schimbă lucrurile.",
            "Nu eram pregătit pentru răspunsul ăsta."
          ] : [
            "Wait, what did you just say?",
            "That's not what I expected to hear.",
            "Okay, that changes things...",
            "Well, that's interesting.",
            "I wasn't ready for that response."
          ];
          
          updatedDialogue[nextLineIndex] = {
            ...updatedDialogue[nextLineIndex],
            text: simpleResponses[Math.floor(Math.random() * simpleResponses.length)]
          };
        }
        
        return NextResponse.json({ dialogue: updatedDialogue });
      }
    }

    // Ensure the user's edit is preserved and add mood info
    const updatedDialogue = newDialogue.map((line: any, index: number) => {
      if (index === lineIndex) {
        return {
          ...line,
          text: newText,
          mood: line.character === character1 ? character1Mood : character2Mood
        };
      }
      return {
        ...line,
        id: line.id || `line-${index + 1}`,
        mood: line.character === character1 ? character1Mood : character2Mood
      };
    });

    return NextResponse.json({ dialogue: updatedDialogue });
  } catch (error) {
    console.error('Error regenerating line:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate dialogue' },
      { status: 500 }
    );
  }
} 