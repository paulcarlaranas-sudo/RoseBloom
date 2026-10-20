import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Initialize GoogleGenAI on server with telemetry User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper regex to clean up video titles if fallback is needed
function cleanVideoTitle(raw: string): { title: string; artist: string } {
  const cleaned = raw
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(
      /\([^\)]*(?:official|video|music video|audio|lyrics|lyric video|hd|4k|mv|visualizer|remastered)[^\)]*\)/gi,
      ' '
    )
    .replace(/\|.*$/g, '')
    .trim();

  // If format is "Artist - Song"
  if (cleaned.includes(' - ')) {
    const parts = cleaned
      .split(' - ')
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length >= 2) {
      return {
        artist: parts[0],
        title: parts.slice(1).join(' - '),
      };
    }
  }

  return {
    artist: '',
    title: cleaned || raw,
  };
}

// POST /api/identify-youtube-song
// Takes a YouTube URL, fetches title/channel info, and uses Gemini AI to auto-fill clean Song Title and Artist Name
app.post('/api/identify-youtube-song', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Please provide a valid YouTube URL' });
    }

    const cleanUrl = url.trim();

    // 1. Fetch metadata from YouTube's public oEmbed service
    let oembedTitle = '';
    let oembedAuthor = '';
    try {
      const oembedRes = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(cleanUrl)}&format=json`
      );
      if (oembedRes.ok) {
        const data = (await oembedRes.json()) as { title?: string; author_name?: string };
        oembedTitle = data.title || '';
        oembedAuthor = data.author_name || '';
      }
    } catch (err) {
      console.warn('oEmbed fetch error:', err);
    }

    let songTitle = '';
    let artistName = '';

    // 2. Use Gemini 3.8 Flash to intelligently extract clean song title and artist name
    if (process.env.GEMINI_API_KEY) {
      try {
        const prompt = `You are a music metadata assistant for a romantic monthsary website.
A user pasted this YouTube music link:
URL: ${cleanUrl}
YouTube Video Title: ${oembedTitle || 'Unknown'}
YouTube Channel / Author: ${oembedAuthor || 'Unknown'}

Your task:
1. Identify the exact Song Title and Artist Name.
2. Remove all YouTube video noise such as:
   - "(Official Music Video)", "(Official Video)", "(Official Audio)", "[Audio]"
   - "(Lyrics)", "(Lyric Video)", "[4K]", "HD", "(Visualizer)", "[Remastered]"
   - Channel tags or movie promo phrases
3. If the video title is "Artist - Song", split them cleanly.
4. If the artist is the channel owner (e.g. Stephen Sanchez, Taylor Swift, Ed Sheeran, JVKE), accurately use that as the artist name.
5. Return clean songTitle and artistName.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                songTitle: {
                  type: Type.STRING,
                  description: 'The clean song title without video tags or noise',
                },
                artistName: {
                  type: Type.STRING,
                  description: 'The clean artist or band name',
                },
              },
              required: ['songTitle', 'artistName'],
            },
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          songTitle = parsed.songTitle?.trim() || '';
          artistName = parsed.artistName?.trim() || '';
        }
      } catch (geminiErr) {
        console.warn('Gemini extraction error, using fallback:', geminiErr);
      }
    }

    // 3. Fallback heuristic if Gemini was not available or returned empty
    if (!songTitle && oembedTitle) {
      const heuristic = cleanVideoTitle(oembedTitle);
      songTitle = heuristic.title;
      artistName = heuristic.artist || oembedAuthor || 'YouTube Artist';
    }

    if (!songTitle) {
      songTitle = 'YouTube Romantic Track';
      artistName = oembedAuthor || 'YouTube Music';
    }

    return res.json({
      success: true,
      songTitle,
      artistName,
      rawTitle: oembedTitle || undefined,
      channel: oembedAuthor || undefined,
    });
  } catch (error: any) {
    console.error('API error in /api/identify-youtube-song:', error);
    return res.status(500).json({
      error: 'Failed to identify song',
      message: error?.message || 'Unknown error',
    });
  }
});

// Mount Vite in dev mode or serve static build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${port}`);
});
