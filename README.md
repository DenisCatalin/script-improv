# 🎭 AI Script Improvisation

An interactive web application that generates hilarious dialogues between your favorite characters using AI!

## Features

- **Character Selection**: Choose from 32+ popular characters with unique personalities
- **Scene Setting**: Pick from 20 locations and 18 themes for infinite combinations
- **AI-Generated Scripts**: Get 6-8 lines of authentic character dialogue
- **Interactive Editing**: Edit any line and watch the other character react naturally
- **High-Quality Audio**: Professional character voices with ElevenLabs integration
- **Full Dialogue Playback**: Listen to entire conversations with realistic character voices
- **Multi-Language Support**: 13 languages with native voice support
- **Character Moods**: 8 different mood settings affecting dialogue tone
- **Plot Twists**: Add unexpected developments to spice up conversations
- **Ambient Mode**: Cinematic experience with floating particles and dark atmosphere
- **Video Generation**: Create professional HTML video previews with timestamps
- **Beautiful UI**: Modern, responsive design with smooth animations and sound effects

## Demo

Pick two characters (like Shrek and Iron Man), set them in a location (like a shopping mall), give them a situation to deal with (like fighting over a parking space), and watch the AI create a hilarious conversation!

## Getting Started

### Prerequisites

- Node.js 18+ installed
- An OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd script-improv
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables:
   - Create a `.env.local` file in the root directory
   - Add your API keys:
```
OPENAI_API_KEY=your_openai_api_key_here

# Optional: ElevenLabs API for high-quality character voices
# Get your API key from: https://elevenlabs.io/speech-synthesis
# If not provided, the app will fallback to browser TTS
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Getting API Keys

#### OpenAI API Key (Required)
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to [API Keys](https://platform.openai.com/api-keys)
4. Create a new API key
5. Copy the key and add it to your `.env.local` file

#### ElevenLabs API Key (Optional - for high-quality voices)
1. Go to [ElevenLabs](https://elevenlabs.io/speech-synthesis)
2. Sign up for an account (free tier available)
3. Navigate to your [Profile Settings](https://elevenlabs.io/subscription)
4. Copy your API key and add it to your `.env.local` file
5. **Without ElevenLabs**: The app will use browser TTS (still functional, but lower quality)
6. **With ElevenLabs**: Each character gets a unique, professional voice in any language!

## How to Use

1. **Set the Scene**: 
   - Enter two character names (or pick from popular suggestions)
   - Choose a location from the dropdown
   - Select a theme/situation for the dialogue

2. **Generate Dialogue**: 
   - Click "Generate Dialogue" to create your script
   - The AI will generate 6-8 lines of character-appropriate dialogue

3. **Interactive Editing**:
   - Click "Edit" on any dialogue line
   - Modify the text to change what the character says
   - Click "Regenerate" to see how the other character reacts to the change

4. **Listen to Your Scripts**:
   - Click the 🎭 "Play Full Dialogue" button to hear the entire conversation
   - Use individual ▶️ play buttons to hear specific lines
   - Adjust playback speed from 0.5x to 2x
   - Experience high-quality character voices (with ElevenLabs API)

5. **Enhanced Features**:
   - Try different character moods (Happy, Angry, Sarcastic, etc.)
   - Add plot twists to spice up conversations
   - Use Ambient Mode for a cinematic experience
   - Generate video previews of your dialogues

6. **Create New Scripts**: 
   - Use "Generate New Dialogue" to create completely new conversations
   - Try different character combinations and scenarios

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI**: OpenAI GPT-3.5 Turbo
- **Deployment**: Vercel-ready

## Contributing

Feel free to contribute by:
- Adding more character suggestions
- Improving the UI/UX
- Adding new features like dialogue export
- Optimizing AI prompts for better results

## License

MIT License - feel free to use this project for your own purposes!

## Troubleshooting

**API Key Issues**: Make sure your OpenAI API key is correctly set in `.env.local` and you have sufficient credits

**Generation Fails**: Check the browser console for errors and ensure all form fields are filled out

**Slow Performance**: The AI generation typically takes 3-10 seconds depending on OpenAI's response time

---

Have fun creating hilarious character interactions! 🎬✨
