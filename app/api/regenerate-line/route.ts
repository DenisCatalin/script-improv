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

The line "${lineToReplace.character}: ${newText}" has been changed by the user. Please generate a natural response from ${otherCharacter} that would make sense as the next line in this conversation. 

${otherCharacter} is currently ${otherMoodDesc}, so the response should reflect this mood.

The response should:
1. Stay true to ${otherCharacter}'s character and personality
2. Reflect their current emotional state (${otherMoodDesc})
3. React naturally to the changed line
4. Continue the comedic flow of the conversation
5. Fit the overall theme and setting${languageInstruction}

Please provide the complete updated dialogue as a JSON array, incorporating the user's change and the new response. Make sure to maintain the same id structure.

Format:
[
  {"id": "1", "character": "character name", "text": "dialogue text"},
  ...
]`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a creative dialogue writer who can adapt conversations naturally based on changes. You understand character personalities and can create believable reactions that match their emotional states. ${language !== 'en' ? `You are fluent in ${languageName} and can create natural dialogue in that language while maintaining character authenticity.` : ''}`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
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