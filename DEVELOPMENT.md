# Moderated AI App - Setup & Development Guide

A React-based content moderation chatbot that integrates with Anthropic's Claude API.

## 📋 Prerequisites

- **Node.js** v18+ and npm
- **Anthropic API Key** (from https://console.anthropic.com/account/keys)
- **Anthropic Credits** (minimum $5 balance)

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Key

Create a `.env` file in the project root:

```bash
REACT_APP_ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

Get your API key from: https://console.anthropic.com/account/keys

### 3. Start Development

**Option A: Run Both (Recommended)**

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

**Option B: Run Separately**

Terminal 1 (Backend API Proxy):

```bash
npm run server
```

Terminal 2 (React Frontend):

```bash
npm start
```

---

## 📁 Project Structure

```
moderated-ai-app/
├── src/
│   ├── App.js                    # Main React component (imports ModeratedAIApp)
│   ├── moderated-ai-app.jsx      # Full moderation UI & logic
│   ├── App.css                   # Global styles
│   └── index.js                  # React entry point
├── server.js                     # Express backend proxy (Port 5000)
├── package.json                  # Dependencies & scripts
├── .env                          # (Not in git) API key configuration
└── .env.example                  # Template for .env
```

---

## 🔧 How It Works

### Architecture

```
Browser (localhost:3000)
  ↓
React Frontend (moderated-ai-app.jsx)
  ↓
Express Backend (server.js on localhost:5000)
  ↓
Anthropic Claude API
```

### Flow

1. User types message in React app
2. Frontend calls `/api/messages` on backend
3. Backend forwards to Anthropic API (with API key)
4. Anthropic returns moderation + response
5. Response displayed in UI with safety badge

### Why Backend Proxy?

- **Security**: API key never exposed to browser
- **CORS**: Solves cross-origin restrictions
- **Control**: Can add logging, rate limiting, etc.

---

## 🎯 Features

### Content Moderation

- ✓ Analyzes messages for: hate speech, violence, harassment, adult content, spam
- ✓ Returns safety score (0.0 - 1.0)
- ✓ Blocks messages with score > 0.8
- ✓ Flags messages with score 0.5-0.8

### UI Components

- **Left Sidebar**: Moderation rules (toggles) & sensitivity thresholds (sliders)
- **Center Chat**: Message input with live moderation badges
- **Right Panel**: Statistics & moderation log with risk scores

### Moderation Badges

- ✓ **Cleared** (green) - Safe to respond
- ⚠ **Flagged** (orange) - Risky but processed
- ✗ **Blocked** (red) - Rejected, AI doesn't respond

---

## 🐛 Troubleshooting

### "Failed to fetch" error

- Check backend is running: `curl http://localhost:5000/health`
- If not running: `npm run server` in separate terminal
- Hard refresh browser: `Ctrl + Shift + R`

### "API error 400: credit balance too low"

- Add credits to Anthropic account: https://console.anthropic.com/account/billing/overview
- Need at least $5-10 balance

### "API key not configured"

- Verify `.env` file exists
- Check `REACT_APP_ANTHROPIC_API_KEY` is set correctly
- Restart both backend and frontend

### Port 5000 already in use

- Kill existing processes: `Get-Process node | Stop-Process`
- Or use different port: Edit `server.js` line 6 and `moderated-ai-app.jsx` line 3

---

## 📝 API Endpoints

### POST /api/messages

Forward request to Anthropic API

**Request:**

```json
{
  "system": "You are helpful",
  "messages": [{ "role": "user", "content": "Hello" }],
  "max_tokens": 300
}
```

**Response:**

```json
{
  "content": [{ "text": "Hello! How can I help?" }]
}
```

### GET /health

Check server status

```json
{ "status": "ok", "apiKeyConfigured": true }
```

---

## 📦 Scripts

```bash
npm start        # Start React dev server (localhost:3000)
npm run server   # Start Express backend (localhost:5000)
npm run dev      # Start both (in same terminal)
npm run build    # Create production build
npm test         # Run tests
```

---

## 🔐 Environment Variables

| Variable                      | Required | Example         |
| ----------------------------- | -------- | --------------- |
| `REACT_APP_ANTHROPIC_API_KEY` | Yes      | `sk-ant-xxxxxx` |

Never commit `.env` to git - it's in `.gitignore`

---

## 🚢 Deployment

### Production Build

```bash
npm run build
```

Creates `build/` folder ready for hosting.

### Deploy to Vercel/Netlify

1. Connect GitHub repo
2. Vercel/Netlify auto-detects React app
3. Set environment variable: `REACT_APP_ANTHROPIC_API_KEY`
4. Deploy!

### Note for Production

- Backend server needs separate hosting (Vercel functions, AWS Lambda, Heroku, etc.)
- Or use Anthropic API directly from a backend service

---

## 📞 Support

- Anthropic Docs: https://docs.anthropic.com
- React Docs: https://react.dev
- Report issues in GitHub repo

---

## 📄 License

MIT - Free to use and modify

---

**Happy coding!** 🎉
