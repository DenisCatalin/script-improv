'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DialogueLine {
  character: string;
  text: string;
  id: string;
  mood?: string;
}

const POPULAR_CHARACTERS = [
  'Shrek', 'Iron Man', 'Batman', 'Wonder Woman', 'Darth Vader', 'Yoda',
  'Sherlock Holmes', 'Harry Potter', 'Hermione Granger', 'Spider-Man',
  'Captain America', 'Black Widow', 'Thor', 'Hulk', 'Deadpool', 'Wolverine',
  'Princess Leia', 'Luke Skywalker', 'Gandalf', 'Frodo', 'Aragorn', 'Legolas',
  'Jack Sparrow', 'Indiana Jones', 'James Bond', 'John Wick', 'The Joker', 
  'Elsa', 'Buzz Lightyear', 'Mickey Mouse', 'Goku', 'Naruto', 'Pikachu'
];

const LOCATIONS = [
  'at a shopping mall', 'in a coffee shop', 'at the gym', 'on an airplane',
  'in an elevator', 'at a gas station', 'in a library', 'at a restaurant',
  'in a parking garage', 'at the beach', 'in a taxi', 'at a grocery store',
  'in a waiting room', 'at a bus stop', 'in a hotel lobby', 'at a park',
  'in a haunted house', 'at a wedding', 'in a spaceship', 'at a zoo'
];

const THEMES = [
  'They fight over a parking space', 'They disagree about the best pizza topping',
  'They\'re stuck in an elevator together', 'They both want the last item in a store',
  'They accidentally ordered the same drink', 'They\'re arguing about who\'s the real hero',
  'They\'re competing for the same job', 'They both like the same person',
  'They disagree about the best movie', 'They\'re lost and asking for directions',
  'They\'re trying to split a bill', 'They both want to use the same gym equipment',
  'They\'re stuck in traffic', 'They\'re waiting for the same bus', 'They\'re in line at a theme park',
  'They\'re competing in a cooking show', 'They\'re roommates arguing about chores',
  'They meet at a speed dating event'
];

const LANGUAGES = [
  { code: 'ro', name: 'Română', flag: '🇷🇴' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' }
];

const CHARACTER_MOODS = [
  { id: 'normal', name: 'Normal', emoji: '😐' },
  { id: 'happy', name: 'Happy', emoji: '😄' },
  { id: 'angry', name: 'Angry', emoji: '😠' },
  { id: 'sarcastic', name: 'Sarcastic', emoji: '🙄' },
  { id: 'dramatic', name: 'Dramatic', emoji: '🎭' },
  { id: 'confused', name: 'Confused', emoji: '😵' },
  { id: 'flirty', name: 'Flirty', emoji: '😘' },
  { id: 'sleepy', name: 'Sleepy', emoji: '😴' }
];

// Character emoji mapping for visual representation
const CHARACTER_EMOJIS: { [key: string]: string } = {
  'Shrek': '👹',
  'Iron Man': '🤖',
  'Batman': '🦇',
  'Wonder Woman': '👸',
  'Darth Vader': '👤',
  'Yoda': '👽',
  'Sherlock Holmes': '🕵️',
  'Harry Potter': '⚡',
  'Hermione Granger': '📚',
  'Spider-Man': '🕷️',
  'Captain America': '🛡️',
  'Black Widow': '🕸️',
  'Thor': '⚡',
  'Hulk': '💚',
  'Deadpool': '🔴',
  'Wolverine': '🐺',
  'Princess Leia': '👑',
  'Luke Skywalker': '⚔️',
  'Gandalf': '🧙',
  'Frodo': '💍',
  'Aragorn': '👑',
  'Legolas': '🏹',
  'Jack Sparrow': '🏴‍☠️',
  'Indiana Jones': '🤠',
  'James Bond': '🕴️',
  'John Wick': '🔫',
  'The Joker': '🃏',
  'Elsa': '❄️',
  'Buzz Lightyear': '🚀',
  'Mickey Mouse': '🐭',
  'Goku': '🐒',
  'Naruto': '🍜',
  'Pikachu': '⚡'
};

const getCharacterEmoji = (character: string): string => {
  return CHARACTER_EMOJIS[character] || '🎭';
};

const getCharacterAvatar = (character: string): string => {
  // Generate a simple avatar based on character name
  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'];
  const colorIndex = character.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[colorIndex];
};

const playSound = (type: 'generate' | 'edit' | 'success' | 'error') => {
  if (typeof window !== 'undefined') {
    try {
      const audio = new Audio();
      switch (type) {
        case 'generate':
          // Simulate typing sound
          audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmceB';
          break;
        case 'success':
          audio.src = 'data:audio/wav;base64,UklGRvIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0Ys4AAAB+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+';
          break;
        default:
          return;
      }
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignore errors if sound can't play
    } catch {
      // Ignore audio errors
    }
  }
};

export default function Home() {
  const [character1, setCharacter1] = useState('');
  const [character2, setCharacter2] = useState('');
  const [location, setLocation] = useState('');
  const [theme, setTheme] = useState('');
  const [language, setLanguage] = useState('ro'); // Romanian as default
  const [character1Mood, setCharacter1Mood] = useState('normal');
  const [character2Mood, setCharacter2Mood] = useState('normal');
  const [dialogue, setDialogue] = useState<DialogueLine[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingLine, setEditingLine] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [dialogueRating, setDialogueRating] = useState<number>(0);
  const [showPlotTwist, setShowPlotTwist] = useState(false);
  const [dialogueHistory, setDialogueHistory] = useState<any[]>([]);
  const [isShaking, setIsShaking] = useState(false);
  const [isAmbientMode, setIsAmbientMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingLine, setCurrentPlayingLine] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const randomizeEverything = () => {
    const randomChar1 = POPULAR_CHARACTERS[Math.floor(Math.random() * POPULAR_CHARACTERS.length)];
    let randomChar2 = POPULAR_CHARACTERS[Math.floor(Math.random() * POPULAR_CHARACTERS.length)];
    while (randomChar2 === randomChar1) {
      randomChar2 = POPULAR_CHARACTERS[Math.floor(Math.random() * POPULAR_CHARACTERS.length)];
    }
    
    setCharacter1(randomChar1);
    setCharacter2(randomChar2);
    setLocation(LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]);
    setTheme(THEMES[Math.floor(Math.random() * THEMES.length)]);
    setCharacter1Mood(CHARACTER_MOODS[Math.floor(Math.random() * CHARACTER_MOODS.length)].id);
    setCharacter2Mood(CHARACTER_MOODS[Math.floor(Math.random() * CHARACTER_MOODS.length)].id);
    
    // Shake animation
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 600);
    playSound('generate');
  };

  const generateDialogue = async () => {
    if (!character1 || !character2 || !location || !theme) {
      alert('Te rog completează toate câmpurile! / Please fill in all fields!');
      return;
    }

    setIsGenerating(true);
    playSound('generate');
    
    try {
      const response = await fetch('/api/generate-dialogue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          character1,
          character2,
          location,
          theme,
          language,
          character1Mood,
          character2Mood,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to generate dialogue');
      }

      const data = await response.json();
      
      if (!data.dialogue || !Array.isArray(data.dialogue)) {
        throw new Error('Invalid response format from server');
      }
      
      setDialogue(data.dialogue);
      setDialogueRating(0);
      setShowPlotTwist(false);
      playSound('success');
      
      // Add to history
      const newEntry = {
        id: Date.now(),
        character1,
        character2,
        location,
        theme,
        language,
        dialogue: data.dialogue,
        timestamp: new Date().toLocaleString()
      };
      setDialogueHistory(prev => [newEntry, ...prev.slice(0, 4)]); // Keep last 5
      
    } catch (error: unknown) {
      console.error('Error generating dialogue:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('API key')) {
        alert('🔑 Problemă cu cheia API!\n\nVerifică că ai adăugat OPENAI_API_KEY în fișierul .env.local\n\n---\n\n🔑 API Key Issue!\n\nMake sure you have added OPENAI_API_KEY to your .env.local file');
      } else if (errorMessage.includes('quota') || errorMessage.includes('billing')) {
        alert('💳 Problemă cu contul OpenAI!\n\nVerifică că ai credite disponibile în contul tău OpenAI\n\n---\n\n💳 OpenAI Account Issue!\n\nCheck that you have available credits in your OpenAI account');
      } else {
        alert(`❌ Nu s-a putut genera dialogul!\n\nEroare: ${errorMessage}\n\n---\n\n❌ Failed to generate dialogue!\n\nError: ${errorMessage}`);
      }
      
      playSound('error');
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateLine = async (lineId: string, newText: string) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/regenerate-line', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          character1,
          character2,
          location,
          theme,
          language,
          dialogue,
          lineId,
          newText,
          character1Mood,
          character2Mood,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate dialogue');
      }

      const data = await response.json();
      setDialogue(data.dialogue);
      setEditingLine(null);
      setEditText('');
      playSound('success');
    } catch (error) {
      console.error('Error regenerating dialogue:', error);
      alert('Nu s-a putut regenera dialogul. / Failed to regenerate dialogue.');
      playSound('error');
    } finally {
      setIsGenerating(false);
    }
  };

  const addPlotTwist = async () => {
    if (dialogue.length === 0) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/add-plot-twist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          character1,
          character2,
          location,
          theme,
          language,
          dialogue,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add plot twist');
      }

      const data = await response.json();
      setDialogue(data.dialogue);
      setShowPlotTwist(true);
      playSound('success');
    } catch (error) {
      console.error('Error adding plot twist:', error);
      alert('Nu s-a putut adăuga plot twist-ul. / Failed to add plot twist.');
    } finally {
      setIsGenerating(false);
    }
  };

  const startEditing = (line: DialogueLine) => {
    setEditingLine(line.id);
    setEditText(line.text);
    playSound('edit');
  };

  const saveEdit = (lineId: string) => {
    if (editText.trim()) {
      regenerateLine(lineId, editText.trim());
    }
  };

  const cancelEdit = () => {
    setEditingLine(null);
    setEditText('');
  };

  const rateDialogue = (rating: number) => {
    setDialogueRating(rating);
    playSound('success');
  };

  const getVoiceForLanguage = (lang: string) => {
    const voices = speechSynthesis.getVoices();
    const languageMap: { [key: string]: string[] } = {
      'ro': ['ro-RO', 'romanian'],
      'en': ['en-US', 'en-GB', 'english'],
      'es': ['es-ES', 'es-MX', 'spanish'],
      'fr': ['fr-FR', 'french'],
      'de': ['de-DE', 'german'],
      'it': ['it-IT', 'italian'],
      'pt': ['pt-PT', 'pt-BR', 'portuguese'],
      'ru': ['ru-RU', 'russian'],
      'ja': ['ja-JP', 'japanese'],
      'ko': ['ko-KR', 'korean'],
      'zh': ['zh-CN', 'zh-TW', 'chinese'],
      'ar': ['ar-SA', 'arabic'],
      'hi': ['hi-IN', 'hindi']
    };
    
    const targetLangs = languageMap[lang] || languageMap['en'];
    
    for (const targetLang of targetLangs) {
      const voice = voices.find(v => 
        v.lang.toLowerCase().includes(targetLang.toLowerCase()) ||
        v.name.toLowerCase().includes(targetLang.toLowerCase())
      );
      if (voice) return voice;
    }
    
    return voices[0]; // Fallback to first available voice
  };

  const speakText = async (text: string, character: string, lineId: string) => {
    setCurrentPlayingLine(lineId);
    setIsPlaying(true);
    
    try {
      // Try high-quality TTS first
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          character,
          language,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.useBuiltIn) {
          // Fallback to browser TTS with better voice selection
          playBrowserTTS(text, character);
        } else {
          // Use high-quality ElevenLabs audio
          const audio = new Audio(data.audioData);
          audio.playbackRate = playbackSpeed;
          
          audio.onended = () => {
            setCurrentPlayingLine(null);
            setIsPlaying(false);
          };
          
          audio.onerror = () => {
            console.log('Audio playback failed, falling back to browser TTS');
            playBrowserTTS(text, character);
          };
          
          await audio.play();
        }
      } else {
        playBrowserTTS(text, character);
      }
    } catch {
      console.error('TTS error');
      playBrowserTTS(text, character);
    }
  };

  const playBrowserTTS = (text: string, character: string) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = getVoiceForLanguage(language);
      
      if (voice) {
        utterance.voice = voice;
      }
      
      utterance.rate = playbackSpeed;
      utterance.pitch = character === character1 ? 0.8 : 1.2;
      utterance.volume = 0.9;
      
      utterance.onend = () => {
        setCurrentPlayingLine(null);
        setIsPlaying(false);
      };
      
      speechRef.current = utterance;
      speechSynthesis.speak(utterance);
    }
  };

  const playEntireDialogue = async () => {
    if (dialogue.length === 0) return;
    
    setIsPlaying(true);
    let currentIndex = 0;
    
    const playNext = async () => {
      if (currentIndex >= dialogue.length) {
        setIsPlaying(false);
        setCurrentPlayingLine(null);
        alert('🎭 Dialogul s-a terminat! / Dialogue finished!\n\nAi putea încerca:\n• Un plot twist 🌪️\n• O nouă conversație 🔄\n• Ambient mode pentru o experiență completă 🎭');
        return;
      }
      
      const line = dialogue[currentIndex];
      setCurrentPlayingLine(line.id);
      
      try {
        // Try high-quality TTS first
        const response = await fetch('/api/text-to-speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: line.text,
            character: line.character,
            language,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.useBuiltIn) {
            // Fallback to browser TTS
            playLineBrowserTTS(line, () => {
              currentIndex++;
              timeoutRef.current = setTimeout(playNext, 1500 / playbackSpeed);
            });
          } else {
            // Use high-quality ElevenLabs audio
            const audio = new Audio(data.audioData);
            audio.playbackRate = playbackSpeed;
            
            audio.onended = () => {
              currentIndex++;
              timeoutRef.current = setTimeout(playNext, 1500 / playbackSpeed);
            };
            
            audio.onerror = () => {
              playLineBrowserTTS(line, () => {
                currentIndex++;
                timeoutRef.current = setTimeout(playNext, 1500 / playbackSpeed);
              });
            };
            
            await audio.play();
          }
        } else {
          playLineBrowserTTS(line, () => {
            currentIndex++;
            timeoutRef.current = setTimeout(playNext, 1500 / playbackSpeed);
          });
        }
      } catch (error) {
        console.error('Dialogue TTS error:', error);
        playLineBrowserTTS(line, () => {
          currentIndex++;
          timeoutRef.current = setTimeout(playNext, 1500 / playbackSpeed);
        });
      }
    };
    
    playNext();
  };

  const playLineBrowserTTS = (line: DialogueLine, onEnd: () => void) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(line.text);
      const voice = getVoiceForLanguage(language);
      
      if (voice) {
        utterance.voice = voice;
      }
      
      utterance.rate = playbackSpeed;
      utterance.pitch = line.character === character1 ? 0.8 : 1.2;
      utterance.volume = 0.9;
      utterance.onend = onEnd;
      
      speechSynthesis.speak(utterance);
    } else {
      onEnd();
    }
  };

  const stopPlayback = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setCurrentPlayingLine(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const toggleAmbientMode = () => {
    setIsAmbientMode(!isAmbientMode);
    if (!isAmbientMode) {
      playSound('success');
    }
  };

  const testOpenAIConnection = async () => {
    try {
      const response = await fetch('/api/test-openai');
      const data = await response.json();
      
      if (data.status === 'success') {
        alert('✅ OpenAI API funcționează perfect!\n\nModel: ' + data.model + '\nRăspuns: ' + data.response + '\n\n---\n\n✅ OpenAI API is working perfectly!\n\nModel: ' + data.model + '\nResponse: ' + data.response);
      } else {
        alert('❌ Problemă cu OpenAI API!\n\nEroare: ' + data.message + '\nSoluție: ' + data.solution + '\n\n---\n\n❌ OpenAI API Issue!\n\nError: ' + data.message + '\nSolution: ' + data.solution);
      }
    } catch {
      alert('❌ Nu se poate testa conexiunea OpenAI!\n\nVerifică conexiunea la internet.\n\n---\n\n❌ Cannot test OpenAI connection!\n\nCheck your internet connection.');
    }
  };

  const generateVideo = async () => {
    if (dialogue.length === 0) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          character1,
          character2,
          location,
          theme,
          dialogue,
          language,
          character1Mood,
          character2Mood,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate video');
      }

      const data = await response.json();
      
      // Create downloadable HTML file
      const htmlBlob = new Blob([data.htmlPreview], { type: 'text/html' });
      const htmlUrl = URL.createObjectURL(htmlBlob);
      const htmlLink = document.createElement('a');
      htmlLink.href = htmlUrl;
      htmlLink.download = `video-preview-${character1}-vs-${character2}.html`;
      document.body.appendChild(htmlLink);
      htmlLink.click();
      document.body.removeChild(htmlLink);
      URL.revokeObjectURL(htmlUrl);
      
      // Also create JSON data file
      const jsonBlob = new Blob([JSON.stringify(data.videoData, null, 2)], { type: 'application/json' });
      const jsonUrl = URL.createObjectURL(jsonBlob);
      const jsonLink = document.createElement('a');
      jsonLink.href = jsonUrl;
      jsonLink.download = `video-data-${character1}-vs-${character2}.json`;
      document.body.appendChild(jsonLink);
      jsonLink.click();
      document.body.removeChild(jsonLink);
      URL.revokeObjectURL(jsonUrl);
      
      alert('🎬 Video files generated! / Fișierele video generate!\n\n📄 HTML Preview: Interactive video preview\n📊 JSON Data: Video structure data\n\nOpen the HTML file in your browser to see the video preview with auto-play and speech!');
      playSound('success');
    } catch (error) {
      console.error('Error generating video:', error);
      alert('Nu s-a putut genera video-ul. / Failed to generate video.');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    // Load voices when component mounts
    if ('speechSynthesis' in window) {
      const loadVoices = () => speechSynthesis.getVoices();
      loadVoices();
      speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      speechSynthesis.cancel();
    };
  }, []);

  const selectedLanguage = LANGUAGES.find(lang => lang.code === language);
  const character1MoodData = CHARACTER_MOODS.find(mood => mood.id === character1Mood);
  const character2MoodData = CHARACTER_MOODS.find(mood => mood.id === character2Mood);

  return (
    <div className={`min-h-screen text-white transition-all duration-1000 ${
      isAmbientMode 
        ? 'bg-gradient-to-br from-black via-purple-900 to-black' 
        : 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900'
    }`}>
      {/* Ambient Mode Overlay */}
      <AnimatePresence>
        {isAmbientMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-0"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 animate-pulse"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent)] animate-pulse"></div>
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/30 rounded-full"
                initial={{ 
                  x: Math.random() * window.innerWidth, 
                  y: Math.random() * window.innerHeight,
                  opacity: 0
                }}
                animate={{ 
                  x: Math.random() * window.innerWidth, 
                  y: Math.random() * window.innerHeight,
                  opacity: [0, 1, 0]
                }}
                transition={{ 
                  duration: 3 + Math.random() * 2, 
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
              <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-yellow-400 bg-clip-text text-transparent animate-pulse">
            🎭 Improvizație de Scenarii AI
          </h1>
          <p className="text-xl text-gray-300">
            Creează dialoguri amuzante între personajele tale preferate în orice limbă!
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Create hilarious dialogues between your favorite characters in any language!
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Quick Actions */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 mb-6 relative z-10">
            <div className="flex flex-wrap justify-center gap-4 mb-4">
              <button
                onClick={randomizeEverything}
                className={`px-6 py-2 bg-gradient-to-r from-yellow-500 to-red-500 rounded-lg font-bold text-white hover:from-yellow-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105 ${isShaking ? 'animate-bounce' : ''}`}
              >
                🎲 Randomizează Tot / Randomize All
              </button>
              
              <button
                onClick={toggleAmbientMode}
                className={`px-6 py-2 bg-gradient-to-r ${isAmbientMode ? 'from-purple-600 to-pink-600' : 'from-gray-500 to-gray-600'} rounded-lg font-bold text-white hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105`}
              >
                {isAmbientMode ? '🎭 Ambient ON' : '🎭 Ambient Mode'}
              </button>

              {dialogue.length > 0 && (
                <>
                  <button
                    onClick={addPlotTwist}
                    disabled={isGenerating}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-bold text-white hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 transition-all duration-200 transform hover:scale-105"
                  >
                    🌪️ Adaugă Plot Twist / Add Plot Twist
                  </button>
                  
                  <button
                    onClick={generateVideo}
                    disabled={isGenerating}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg font-bold text-white hover:from-green-600 hover:to-teal-600 disabled:opacity-50 transition-all duration-200 transform hover:scale-105"
                  >
                    🎬 Generează Video / Generate Video
                  </button>
                </>
              )}
            </div>

            {/* Audio Controls */}
            {dialogue.length > 0 && (
              <div className="border-t border-white/20 pt-4">
                <div className="text-center mb-4">
                  <button
                    onClick={isPlaying ? stopPlayback : playEntireDialogue}
                    className={`px-8 py-4 bg-gradient-to-r ${isPlaying ? 'from-red-500 to-pink-500' : 'from-blue-500 to-purple-500'} rounded-xl font-bold text-white text-lg hover:scale-105 transition-all duration-200 transform shadow-lg ${isPlaying ? 'animate-pulse' : ''}`}
                  >
                    {isPlaying ? '⏹️ Oprește / Stop' : '🎭 Ascultă Tot Dialogul / Play Full Dialogue'}
                  </button>
                  {!isPlaying && (
                    <p className="text-sm text-gray-300 mt-2">
                      ✨ Experiență completă cu voci de calitate înaltă! / Full experience with high-quality voices!
                    </p>
                  )}
                </div>
                
                <div className="flex flex-wrap justify-center items-center gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <span>🔊 Viteză / Speed:</span>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={playbackSpeed}
                      onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                      className="w-24 accent-purple-500"
                    />
                    <span className="bg-white/20 px-2 py-1 rounded">{playbackSpeed}x</span>
                  </div>
                  
                  {isPlaying && (
                    <div className="flex items-center space-x-2 text-yellow-300 animate-bounce">
                      <span>🎵</span>
                      <span>Se redă linia {dialogue.findIndex(d => d.id === currentPlayingLine) + 1} din {dialogue.length}</span>
                      <span>/</span>
                      <span>Playing line {dialogue.findIndex(d => d.id === currentPlayingLine) + 1} of {dialogue.length}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Character Preview */}
          {character1 && character2 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 animate-fadeIn">
              <h2 className="text-2xl font-bold mb-4 text-center">Personajele Tale / Your Characters</h2>
              <div className="flex justify-center items-center space-x-8">
                <div className="text-center">
                  <div className={`w-20 h-20 rounded-full ${getCharacterAvatar(character1)} flex items-center justify-center text-3xl mb-2 mx-auto shadow-lg transform hover:scale-110 transition-transform`}>
                    {getCharacterEmoji(character1)}
                  </div>
                  <h3 className="font-bold text-lg">{character1}</h3>
                  <p className="text-sm text-gray-300">{character1MoodData?.emoji} {character1MoodData?.name}</p>
                </div>
                <div className="text-4xl animate-pulse">⚔️</div>
                <div className="text-center">
                  <div className={`w-20 h-20 rounded-full ${getCharacterAvatar(character2)} flex items-center justify-center text-3xl mb-2 mx-auto shadow-lg transform hover:scale-110 transition-transform`}>
                    {getCharacterEmoji(character2)}
                  </div>
                  <h3 className="font-bold text-lg">{character2}</h3>
                  <p className="text-sm text-gray-300">{character2MoodData?.emoji} {character2MoodData?.name}</p>
                </div>
              </div>
              {location && theme && (
                <div className="text-center mt-4 p-4 bg-white/10 rounded-lg">
                  <p className="text-gray-200">
                    <span className="font-semibold">{location}</span> - {theme}
                  </p>
                  {selectedLanguage && (
                    <p className="text-sm text-gray-300 mt-1">
                      {selectedLanguage.flag} Vorbind în {selectedLanguage.name} / Speaking in {selectedLanguage.name}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Setup Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Configurează Scena / Set the Scene</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Personajul 1 / Character 1</label>
                <div className="relative">
                  <input
                    type="text"
                    value={character1}
                    onChange={(e) => setCharacter1(e.target.value)}
                    placeholder="de ex., Shrek"
                    className="w-full p-3 bg-white/20 rounded-lg border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
                    list="characters1"
                  />
                  <datalist id="characters1">
                    {POPULAR_CHARACTERS.map(char => (
                      <option key={char} value={char} />
                    ))}
                  </datalist>
                </div>
                <div className="mt-2">
                  <label className="block text-xs font-medium mb-1">Dispoziție / Mood</label>
                  <select
                    value={character1Mood}
                    onChange={(e) => setCharacter1Mood(e.target.value)}
                    className="w-full p-2 bg-white/20 rounded-lg border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
                  >
                    {CHARACTER_MOODS.map(mood => (
                      <option key={mood.id} value={mood.id} className="text-gray-800">
                        {mood.emoji} {mood.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Personajul 2 / Character 2</label>
                <div className="relative">
                  <input
                    type="text"
                    value={character2}
                    onChange={(e) => setCharacter2(e.target.value)}
                    placeholder="de ex., Iron Man"
                    className="w-full p-3 bg-white/20 rounded-lg border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
                    list="characters2"
                  />
                  <datalist id="characters2">
                    {POPULAR_CHARACTERS.filter(char => char !== character1).map(char => (
                      <option key={char} value={char} />
                    ))}
                  </datalist>
                </div>
                <div className="mt-2">
                  <label className="block text-xs font-medium mb-1">Dispoziție / Mood</label>
                  <select
                    value={character2Mood}
                    onChange={(e) => setCharacter2Mood(e.target.value)}
                    className="w-full p-2 bg-white/20 rounded-lg border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
                  >
                    {CHARACTER_MOODS.map(mood => (
                      <option key={mood.id} value={mood.id} className="text-gray-800">
                        {mood.emoji} {mood.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Locația / Location</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-3 bg-white/20 rounded-lg border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
                >
                  <option value="" className="text-gray-800">Alege o locație... / Choose location...</option>
                  {LOCATIONS.map(loc => (
                    <option key={loc} value={loc} className="text-gray-800">{loc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tema / Theme</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full p-3 bg-white/20 rounded-lg border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
                >
                  <option value="" className="text-gray-800">Alege o temă... / Choose theme...</option>
                  {THEMES.map(th => (
                    <option key={th} value={th} className="text-gray-800">{th}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Limba / Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-3 bg-white/20 rounded-lg border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code} className="text-gray-800">
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-center space-y-3">
              <button
                onClick={generateDialogue}
                disabled={isGenerating || !character1 || !character2 || !location || !theme}
                className="px-8 py-3 bg-gradient-to-r from-pink-500 to-orange-500 rounded-lg font-bold text-white hover:from-pink-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 animate-pulse"
              >
                {isGenerating ? '🎭 Creez magie... / Creating Magic...' : '✨ Generează Dialog / Generate Dialogue'}
              </button>
              
              <div className="flex justify-center space-x-2">
                <button
                  onClick={testOpenAIConnection}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg text-sm font-medium text-white hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 transform hover:scale-105"
                >
                  🔧 Test API / Test API
                </button>
                <button
                  onClick={() => setShowDiagnostics(!showDiagnostics)}
                  className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg text-sm font-medium text-white hover:from-gray-600 hover:to-gray-700 transition-all duration-200 transform hover:scale-105"
                >
                  {showDiagnostics ? '❌ Ascunde / Hide' : '🔍 Ajutor / Help'}
                </button>
              </div>
              
              {showDiagnostics && (
                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 text-left text-sm animate-fadeIn">
                  <h4 className="font-bold mb-2">🛠️ Diagnostice / Diagnostics</h4>
                  <div className="space-y-2 text-gray-300">
                    <p><strong>Problemă cu generarea dialogului?</strong></p>
                    <p>1. 🔧 Apasă &quot;Test API&quot; pentru a verifica conexiunea OpenAI</p>
                    <p>2. 🔑 Verifică că ai adăugat OPENAI_API_KEY în .env.local</p>
                    <p>3. 💳 Verifică că ai credite în contul OpenAI</p>
                    <hr className="border-white/20 my-2" />
                    <p><strong>Dialogue generation issues?</strong></p>
                    <p>1. 🔧 Click &quot;Test API&quot; to check OpenAI connection</p>
                    <p>2. 🔑 Make sure you added OPENAI_API_KEY to .env.local</p>
                    <p>3. 💳 Check that you have credits in your OpenAI account</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dialogue Display */}
          {dialogue.length > 0 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 animate-fadeIn">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">🎬 Scenariul Tău / Your Script</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Evaluează / Rate:</span>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => rateDialogue(star)}
                      className={`text-2xl transition-all hover:scale-125 ${star <= dialogueRating ? 'text-yellow-400' : 'text-gray-400'}`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                {dialogue.map((line, index) => (
                  <div
                    key={line.id}
                    className={`p-4 rounded-lg transition-all duration-300 hover:scale-[1.02] ${
                      line.character === character1
                        ? 'bg-blue-500/30 border-l-4 border-blue-400 ml-0 mr-8 animate-slideInLeft'
                        : 'bg-purple-500/30 border-r-4 border-purple-400 ml-8 mr-0 animate-slideInRight'
                    } ${showPlotTwist && index >= dialogue.length - 2 ? 'animate-bounce' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full ${getCharacterAvatar(line.character)} flex items-center justify-center text-lg shadow-md transform hover:rotate-12 transition-transform ${currentPlayingLine === line.id ? 'animate-pulse ring-2 ring-yellow-400' : ''}`}>
                          {getCharacterEmoji(line.character)}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg flex items-center space-x-2">
                            <span>{line.character}</span>
                            {currentPlayingLine === line.id && (
                              <span className="text-yellow-400 animate-bounce">🔊</span>
                            )}
                          </h3>
                          {line.character === character1 && character1MoodData && (
                            <p className="text-xs text-gray-300">{character1MoodData.emoji} {character1MoodData.name}</p>
                          )}
                          {line.character === character2 && character2MoodData && (
                            <p className="text-xs text-gray-300">{character2MoodData.emoji} {character2MoodData.name}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => speakText(line.text, line.character, line.id)}
                          className="text-sm bg-blue-500/20 hover:bg-blue-500/30 px-2 py-1 rounded transition-all transform hover:scale-110"
                          disabled={isGenerating || currentPlayingLine === line.id}
                        >
                          🔊 Ascultă / Play
                        </button>
                        <button
                          onClick={() => startEditing(line)}
                          className="text-sm bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-all transform hover:scale-110"
                          disabled={isGenerating}
                        >
                          ✏️ Editează / Edit
                        </button>
                      </div>
                    </div>
                    
                    {editingLine === line.id ? (
                      <div className="space-y-2 ml-13">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full p-2 bg-white/20 rounded border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          rows={2}
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveEdit(line.id)}
                            disabled={isGenerating}
                            className="px-3 py-1 bg-green-500 hover:bg-green-600 rounded text-sm transition-all transform hover:scale-105"
                          >
                            💫 Regenerează / Regenerate
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1 bg-gray-500 hover:bg-gray-600 rounded text-sm transition-all transform hover:scale-105"
                          >
                            Anulează / Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-100 leading-relaxed ml-13">{line.text}</p>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-6 space-y-4">
                <button
                  onClick={generateDialogue}
                  disabled={isGenerating}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg font-medium text-white hover:from-green-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                >
                  {isGenerating ? '🔄 Regenerez... / Regenerating...' : '🔄 Dialog Nou / Generate New Dialogue'}
                </button>
                
                {dialogueRating > 0 && (
                  <p className="text-sm text-yellow-300 animate-pulse">
                    Mulțumesc pentru evaluare! / Thanks for rating! {Array(dialogueRating).fill('⭐').join('')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Dialogue History */}
          {dialogueHistory.length > 0 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mt-8">
              <h3 className="text-xl font-bold mb-4">📚 Istoric / History</h3>
              <div className="space-y-2">
                {dialogueHistory.map(entry => (
                  <div key={entry.id} className="p-3 bg-white/10 rounded-lg text-sm">
                    <p className="font-medium">{entry.character1} vs {entry.character2}</p>
                    <p className="text-gray-300 text-xs">{entry.location} - {entry.timestamp}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.5s ease-out;
        }
        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
