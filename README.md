# 🛡️ Moderated AI Chat Application

A React-based content moderation chatbot that uses Anthropic's Claude AI to provide intelligent responses while automatically screening messages for harmful content.

**Live Demo:** [GitHub Repository](https://github.com/Shreyashpatil2605/Moderate-ai-app)

---

## ✨ Features

### 🔍 **Content Moderation**

- Real-time message analysis for harmful content
- Detects: hate speech, violence, harassment, adult content, spam, misinformation
- Risk scoring system (0.0 = safe, 1.0 = extremely harmful)
- Automatic blocking of high-risk messages (score > 0.8)
- Flagging of borderline messages (0.5-0.8)

### 💬 **AI Chat**

- Powered by Claude 3.5 Sonnet model
- Maintains conversation history
- Contextual understanding and responses
- Only responds to moderation-approved messages

### 📊 **Dashboard & Analytics**

- Real-time moderation statistics (Total, Safe, Blocked counts)
- Comprehensive moderation log with timestamps
- Risk score visualization
- Customizable moderation rules (toggles)
- Adjustable sensitivity thresholds (sliders)

### 🎨 **Modern UI/UX**

- Dark theme with gradient accents (purple/pink)
- Responsive three-panel layout
- Live moderation badges (✓ Cleared, ⚠ Flagged, ✗ Blocked)
- Smooth animations and transitions
- Mobile-friendly design

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ and npm
- **Anthropic API Key** (get one [here](https://console.anthropic.com/account/keys))
- **$5+ in Anthropic credits** for API usage

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/Shreyashpatil2605/Moderate-ai-app.git
cd Moderate-ai-app
```

2. **Install dependencies**

```bash
npm install
```

3. **Create `.env` file**

```bash
cp .env.example .env
```

4. **Add your API key**

```
REACT_APP_ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

Get your key from: [Anthropic Console](https://console.anthropic.com/account/keys)

### Running the Application

**Option 1: Start Both (Recommended)**

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

**Option 2: Start Separately**

Terminal 1 (Backend):

```bash
npm run server
```

Terminal 2 (Frontend):

```bash
npm start
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│         Browser (localhost:3000)            │
│   React Moderated AI Chat Application       │
│                                             │
│  ┌──────────────┬──────────┬────────────┐  │
│  │   Sidebar    │   Chat   │  Log Panel │  │
│  │  Rules/      │ Messages │ Statistics │  │
│  │  Settings    │  & Input │           │  │
│  └──────────────┴──────────┴────────────┘  │
└──────────────────┬──────────────────────────┘
                   │ HTTP (CORS-enabled)
┌──────────────────▼──────────────────────────┐
│   Express Backend (localhost:5000)          │
│                                             │
│  POST /api/messages - Forward to Anthropic │
│  GET  /health       - Server status        │
└──────────────────┬──────────────────────────┘
                   │ HTTPS
┌──────────────────▼──────────────────────────┐
│    Anthropic Claude API                     │
│  (claude-3-5-sonnet-20241022)               │
└─────────────────────────────────────────────┘
```

### Why Backend Proxy?

- ✅ **Security**: API key never exposed to browser
- ✅ **CORS**: Handles cross-origin requests
- ✅ **Control**: Add logging, rate limiting, caching
- ✅ **Scalability**: Easy to add features

---

## 📁 Project Structure

```
moderated-ai-app/
├── src/
│   ├── App.js                    # Main React component
│   ├── moderated-ai-app.jsx      # Moderation UI & logic (800+ lines)
│   ├── App.css                   # Global styles
│   ├── index.js                  # React entry point
│   ├── index.css                 # Base styles
│   └── ...
├── server.js                     # Express backend proxy
├── package.json                  # Dependencies & scripts
├── .env                          # (Not in git) API configuration
├── .env.example                  # Template for .env
├── .gitignore                    # Git ignore rules
├── DEVELOPMENT.md                # Developer guide
├── README.md                     # This file
└── public/
    ├── index.html
    ├── manifest.json
    └── favicon.ico
```

---

## 🔧 Available Commands

| Command          | Description                                |
| ---------------- | ------------------------------------------ |
| `npm start`      | Start React dev server (port 3000)         |
| `npm run server` | Start Express backend (port 5000)          |
| `npm run dev`    | Start both frontend & backend              |
| `npm run build`  | Create production build                    |
| `npm test`       | Run test suite                             |
| `npm run eject`  | Eject from Create React App (irreversible) |

---

## 🧪 How to Test

### Test Safe Message

```
Input: "What is the capital of France?"
↓
Moderation: ✓ Cleared (score: 0.0)
↓
AI Response: "The capital of France is Paris..."
```

### Test Flagged Message

```
Input: "I don't like this"
↓
Moderation: ⚠ Flagged (score: 0.62)
↓
AI Response: Still processes but marked as risky
```

### Test Blocked Message

```
Input: [Offensive content]
↓
Moderation: ✗ Blocked (score: 0.95)
↓
AI Response: ⛔ "Blocked: Hate speech detected"
```

---

## 🌐 API Endpoints

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
  "id": "msg_...",
  "type": "message",
  "content": [{ "type": "text", "text": "Hello! How can I help?" }]
}
```

### GET /health

Check server and API configuration

**Response:**

```json
{ "status": "ok", "apiKeyConfigured": true }
```

---

## ⚙️ Configuration

### Environment Variables

| Variable                      | Required | Description            |
| ----------------------------- | -------- | ---------------------- |
| `REACT_APP_ANTHROPIC_API_KEY` | Yes      | Your Anthropic API key |

### Moderation Settings (UI)

- **Rules**: Toggle to enable/disable specific content filters
- **Sensitivity**: Adjust thresholds for toxicity detection (0.0 - 1.0)

---

## 🐛 Troubleshooting

### "Failed to fetch" error

```bash
# Check backend is running
curl http://localhost:5000/health

# If not, start it
npm run server

# Hard refresh browser
Ctrl + Shift + R
```

### "API error 400: credit balance too low"

- Add credits to your Anthropic account
- Visit: https://console.anthropic.com/account/billing/overview
- Purchase credits (minimum $5)

### "API key not configured"

- Verify `.env` file exists in project root
- Check `REACT_APP_ANTHROPIC_API_KEY` is set
- Restart both frontend and backend

### Port already in use

```bash
# Kill all Node processes
Get-Process node | Stop-Process -Force

# Or use different port (edit server.js & moderated-ai-app.jsx)
```

For more troubleshooting, see [DEVELOPMENT.md](./DEVELOPMENT.md)

---

## 🛠️ Tech Stack

| Technology        | Purpose                   |
| ----------------- | ------------------------- |
| **React 19.2**    | UI framework              |
| **Express.js**    | Backend API proxy         |
| **Node.js**       | Runtime environment       |
| **Anthropic API** | AI & moderation           |
| **CORS**          | Cross-origin support      |
| **Dotenv**        | Environment configuration |

### Browser Support

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## 📊 Performance

- **Frontend Load Time**: < 2 seconds
- **Moderation Response**: 1-3 seconds
- **Chat Response**: 2-5 seconds
- **Concurrent Users**: Depends on Anthropic API plan

---

## 🔐 Security

✅ **Implemented**

- API key stored in backend only (not exposed to browser)
- CORS enabled for localhost only (modify for production)
- Environment variables excluded from git (.gitignore)
- Input validation and sanitization

⚠️ **Production Considerations**

- Add rate limiting to backend
- Implement user authentication
- Add request logging and monitoring
- Use HTTPS only
- Consider CDN for assets

---

## 📚 Learning Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [Anthropic API Docs](https://docs.anthropic.com)
- [Claude Model Cards](https://docs.anthropic.com/claude/reference/models-overview)

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Author

**Shreyash Patil**

- GitHub: [@Shreyashpatil2605](https://github.com/Shreyashpatil2605)
- Repository: [Moderate-ai-app](https://github.com/Shreyashpatil2605/Moderate-ai-app)

---

## 🙏 Acknowledgments

- [Anthropic](https://www.anthropic.com) for Claude API
- [Create React App](https://create-react-app.dev) for React setup
- [Express.js](https://expressjs.com) community
- All contributors and testers

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Shreyashpatil2605/Moderate-ai-app/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Shreyashpatil2605/Moderate-ai-app/discussions)
- **Email**: Contact the maintainer

---

## 📈 Roadmap

### Planned Features

- [ ] User authentication & profiles
- [ ] Message history persistence
- [ ] Advanced analytics dashboard
- [ ] Custom moderation rules editor
- [ ] Multi-language support
- [ ] API rate limiting
- [ ] Conversation export (PDF/JSON)
- [ ] Dark/Light theme toggle
- [ ] Mobile app (React Native)

### Future Improvements

- Performance optimization
- Accessibility enhancements
- Comprehensive test coverage
- Docker containerization
- Kubernetes deployment

---

## ⭐ Show Your Support

If you find this project helpful, please give it a star! ⭐

---

**Last Updated:** March 15, 2026

**Status:** ✅ Production Ready (with Anthropic credits)
