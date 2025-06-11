import { NextRequest, NextResponse } from 'next/server';

interface VideoScene {
  timestamp: number;
  character: string;
  text: string;
  mood: string;
  avatar: string;
}

interface VideoData {
  title: string;
  characters: {
    character1: { name: string; mood: string; avatar: string };
    character2: { name: string; mood: string; avatar: string };
  };
  setting: {
    location: string;
    theme: string;
    language: string;
  };
  scenes: VideoScene[];
  metadata: {
    duration: number;
    created: string;
    format: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { 
      character1, 
      character2, 
      location, 
      theme, 
      dialogue, 
      language, 
      character1Mood, 
      character2Mood 
    } = await request.json();

    if (!character1 || !character2 || !dialogue || dialogue.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields for video generation' },
        { status: 400 }
      );
    }

    // Character avatar mapping
    const CHARACTER_AVATARS: { [key: string]: string } = {
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

    // Calculate estimated duration (3 seconds per line + 1 second pause)
    const estimatedDuration = dialogue.length * 4;

    // Generate video scenes with timing
    const scenes: VideoScene[] = dialogue.map((line: any, index: number) => ({
      timestamp: index * 4, // 4 seconds per scene
      character: line.character,
      text: line.text,
      mood: line.character === character1 ? character1Mood : character2Mood,
      avatar: CHARACTER_AVATARS[line.character] || '🎭'
    }));

    // Create comprehensive video data structure
    const videoData: VideoData = {
      title: `${character1} vs ${character2} - ${theme}`,
      characters: {
        character1: {
          name: character1,
          mood: character1Mood,
          avatar: CHARACTER_AVATARS[character1] || '🎭'
        },
        character2: {
          name: character2,
          mood: character2Mood,
          avatar: CHARACTER_AVATARS[character2] || '🎭'
        }
      },
      setting: {
        location: location,
        theme: theme,
        language: language
      },
      scenes: scenes,
      metadata: {
        duration: estimatedDuration,
        created: new Date().toISOString(),
        format: 'script-improv-v1'
      }
    };

    // Generate HTML preview for the video
    const htmlPreview = `
<!DOCTYPE html>
<html lang="${language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${videoData.title}</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: 'Arial', sans-serif;
            background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .video-container {
            max-width: 800px;
            margin: 0 auto;
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
            padding: 30px;
            backdrop-filter: blur(10px);
        }
        .title {
            text-align: center;
            font-size: 2.5em;
            margin-bottom: 20px;
            background: linear-gradient(45deg, #FFD700, #FF69B4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .setting {
            text-align: center;
            margin-bottom: 30px;
            font-size: 1.2em;
            opacity: 0.9;
        }
        .scene {
            margin: 20px 0;
            padding: 15px;
            border-radius: 15px;
            animation: fadeIn 0.5s ease-in;
        }
        .scene.character1 {
            background: rgba(59, 130, 246, 0.3);
            margin-right: 80px;
            border-left: 4px solid #3b82f6;
        }
        .scene.character2 {
            background: rgba(147, 51, 234, 0.3);
            margin-left: 80px;
            border-right: 4px solid #9333ea;
        }
        .character-info {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }
        .avatar {
            font-size: 2em;
            margin-right: 15px;
            filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));
        }
        .character-name {
            font-weight: bold;
            font-size: 1.3em;
        }
        .character-mood {
            font-size: 0.9em;
            opacity: 0.8;
            margin-left: 10px;
        }
        .dialogue-text {
            font-size: 1.1em;
            line-height: 1.6;
            margin-left: 60px;
        }
        .timestamp {
            font-size: 0.8em;
            opacity: 0.6;
            margin-bottom: 5px;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .controls {
            text-align: center;
            margin-top: 30px;
            padding: 20px;
            background: rgba(0,0,0,0.2);
            border-radius: 15px;
        }
        .play-btn {
            background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-size: 1.1em;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .play-btn:hover {
            transform: scale(1.05);
        }
    </style>
</head>
<body>
    <div class="video-container">
        <h1 class="title">${videoData.title}</h1>
        <div class="setting">
            📍 ${videoData.setting.location}<br>
            🎭 ${videoData.setting.theme}<br>
            🌍 ${videoData.setting.language}
        </div>
        
        ${scenes.map((scene, index) => `
            <div class="scene ${scene.character === character1 ? 'character1' : 'character2'}" 
                 data-timestamp="${scene.timestamp}">
                <div class="timestamp">${Math.floor(scene.timestamp / 60)}:${(scene.timestamp % 60).toString().padStart(2, '0')}</div>
                <div class="character-info">
                    <span class="avatar">${scene.avatar}</span>
                    <span class="character-name">${scene.character}</span>
                    <span class="character-mood">(${scene.mood})</span>
                </div>
                <div class="dialogue-text">${scene.text}</div>
            </div>
        `).join('')}
        
        <div class="controls">
            <button class="play-btn" onclick="playVideo()">▶️ Play Video Preview</button>
            <p>Estimated duration: ${Math.floor(estimatedDuration / 60)}:${(estimatedDuration % 60).toString().padStart(2, '0')}</p>
        </div>
    </div>
    
    <script>
        function playVideo() {
            const scenes = document.querySelectorAll('.scene');
            let currentScene = 0;
            
            // Hide all scenes
            scenes.forEach(scene => scene.style.display = 'none');
            
            function showNextScene() {
                if (currentScene < scenes.length) {
                    if (currentScene > 0) {
                        scenes[currentScene - 1].style.display = 'none';
                    }
                    scenes[currentScene].style.display = 'block';
                    scenes[currentScene].scrollIntoView({ behavior: 'smooth' });
                    
                    // Read the text if speech synthesis is available
                    if ('speechSynthesis' in window) {
                        const text = scenes[currentScene].querySelector('.dialogue-text').textContent;
                        const utterance = new SpeechSynthesisUtterance(text);
                        utterance.rate = 0.9;
                        speechSynthesis.speak(utterance);
                    }
                    
                    currentScene++;
                    setTimeout(showNextScene, 4000);
                } else {
                    // Show all scenes at the end
                    scenes.forEach(scene => scene.style.display = 'block');
                }
            }
            
            showNextScene();
        }
    </script>
</body>
</html>`;

    return NextResponse.json({ 
      videoData,
      htmlPreview,
      downloadUrl: `data:application/json,${encodeURIComponent(JSON.stringify(videoData, null, 2))}`
    });

  } catch (error) {
    console.error('Error generating video:', error);
    return NextResponse.json(
      { error: 'Failed to generate video' },
      { status: 500 }
    );
  }
} 