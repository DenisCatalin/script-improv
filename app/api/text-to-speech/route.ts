import { NextRequest, NextResponse } from 'next/server';

// Character voice mapping for ElevenLabs
const CHARACTER_VOICES: { [key: string]: string } = {
  // Male characters
  'Shrek': 'pNInz6obpgDQGcFmaJgB', // Adam (deep, gruff)
  'Iron Man': 'VR6AewLTigWG4xSOukaG', // Josh (confident, tech-savvy)
  'Batman': 'EXAVITQu4vr4xnSDxMaL', // Ethan (dark, serious)
  'Darth Vader': '29vD33N1CtxCmqQRPOHJ', // Drew (deep, menacing)
  'Yoda': 'CYw3kZ02Hs0563khs1Fj', // Clyde (wise, aged)
  'Sherlock Holmes': 'onwK4e9ZLuTAKqWW03F9', // Daniel (intellectual, British)
  'Harry Potter': 'g5CIjZEefAph4nQFvHAz', // Ethan (young, British)
  'Spider-Man': 'pFZP5JQG7iQjIQuC4Bku', // Liam (young, energetic)
  'Captain America': 'VR6AewLTigWG4xSOukaG', // Josh (heroic, strong)
  'Thor': '29vD33N1CtxCmqQRPOHJ', // Drew (godly, powerful)
  'Hulk': 'pNInz6obpgDQGcFmaJgB', // Adam (angry, deep)
  'Deadpool': 'TxGEqnHWrfWFTfGW9XjX', // Sam (sarcastic, funny)
  'Wolverine': 'EXAVITQu4vr4xnSDxMaL', // Ethan (gruff, tough)
  'Luke Skywalker': 'g5CIjZEefAph4nQFvHAz', // Ethan (young, hopeful)
  'Gandalf': 'CYw3kZ02Hs0563khs1Fj', // Clyde (wise, old)
  'Frodo': 'g5CIjZEefAph4nQFvHAz', // Ethan (small, brave)
  'Aragorn': 'onwK4e9ZLuTAKqWW03F9', // Daniel (noble, strong)
  'Legolas': 'pFZP5JQG7iQjIQuC4Bku', // Liam (elvish, elegant)
  'Jack Sparrow': 'TxGEqnHWrfWFTfGW9XjX', // Sam (pirate, witty)
  'Indiana Jones': 'VR6AewLTigWG4xSOukaG', // Josh (adventurous)
  'James Bond': 'onwK4e9ZLuTAKqWW03F9', // Daniel (suave, British)
  'John Wick': 'EXAVITQu4vr4xnSDxMaL', // Ethan (serious, deadly)
  'The Joker': 'TxGEqnHWrfWFTfGW9XjX', // Sam (crazy, maniacal)
  'Buzz Lightyear': 'VR6AewLTigWG4xSOukaG', // Josh (heroic, space ranger)
  'Mickey Mouse': 'pFZP5JQG7iQjIQuC4Bku', // Liam (cheerful, high)
  'Goku': 'g5CIjZEefAph4nQFvHAz', // Ethan (enthusiastic, young)
  'Naruto': 'pFZP5JQG7iQjIQuC4Bku', // Liam (energetic, ninja)
  'Pikachu': 'pFZP5JQG7iQjIQuC4Bku', // Liam (cute, electric)
  
  // Female characters
  'Wonder Woman': 'ThT5KcBeYPX3keUQqHPh', // Dorothy (strong, heroic)
  'Hermione Granger': 'AZnzlk1XvdvUeBnXmlld', // Elli (intelligent, young)
  'Black Widow': 'oWAxZDx7w5VEj9dCyTzz', // Grace (spy, sultry)
  'Princess Leia': 'ThT5KcBeYPX3keUQqHPh', // Dorothy (royal, strong)
  'Elsa': 'AZnzlk1XvdvUeBnXmlld', // Elli (magical, regal)
};

// Fallback voices for unknown characters
const FALLBACK_VOICES = {
  male: 'pNInz6obpgDQGcFmaJgB', // Adam
  female: 'ThT5KcBeYPX3keUQqHPh' // Dorothy
};

// Detect if character is likely female based on name and common patterns
const isFemaleCharacter = (character: string): boolean => {
  const femaleKeywords = ['woman', 'girl', 'princess', 'queen', 'lady', 'witch', 'goddess', 'elsa', 'hermione', 'widow', 'leia'];
  return femaleKeywords.some(keyword => character.toLowerCase().includes(keyword));
};

export async function POST(request: NextRequest) {
  try {
    const { text, character, language = 'en' } = await request.json();

    if (!text || !character) {
      return NextResponse.json(
        { error: 'Text and character are required' },
        { status: 400 }
      );
    }

    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    
    if (!ELEVENLABS_API_KEY) {
      // Fallback to browser TTS with better voice selection
      return NextResponse.json({
        useBuiltIn: true,
        text,
        character,
        language
      });
    }

    // Get voice ID for character
    let voiceId = CHARACTER_VOICES[character];
    
    if (!voiceId) {
      // Use fallback based on gender detection
      voiceId = isFemaleCharacter(character) ? FALLBACK_VOICES.female : FALLBACK_VOICES.male;
    }

    // ElevenLabs API call
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2', // Supports multiple languages
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.3,
          use_speaker_boost: true
        }
      }),
    });

    if (!response.ok) {
      console.error('ElevenLabs API error:', response.statusText);
      // Fallback to browser TTS
      return NextResponse.json({
        useBuiltIn: true,
        text,
        character,
        language
      });
    }

    const audioBuffer = await response.arrayBuffer();
    
    // Convert to base64 for frontend
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    
    return NextResponse.json({
      audioData: `data:audio/mpeg;base64,${base64Audio}`,
      character,
      text,
      voiceId
    });

  } catch (error) {
    console.error('Text-to-speech error:', error);
    
    // Always fallback to browser TTS on error
    const { text, character, language = 'en' } = await request.json();
    return NextResponse.json({
      useBuiltIn: true,
      text,
      character,
      language
    });
  }
} 