## Full-Stack Chatbot (Express + Vanilla JS)

A minimal, production-ready-ish chatbot with a Node.js + Express backend and a lightweight frontend. Integrates with OpenAI when `OPENAI_API_KEY` is provided, and otherwise runs in demo mode so it always starts cleanly.

### Features
- Express backend with `/api/chat`
- OpenAI integration (with safe demo fallback)
- Static frontend (HTML/CSS/JS) chat UI
- Health check at `/health`

### Prerequisites
- Node.js >= 18

### Setup
1. Install dependencies:
```bash
npm install
```
2. (Optional) Enable OpenAI responses by creating `.env` from example and adding your key:
```bash
cp .env.example .env
# edit .env and set OPENAI_API_KEY=sk-...
```

### Run
- Start the server:
```bash
npm start
```
- Open `http://localhost:3000` in your browser.

- Check server health:
```bash
curl http://localhost:3000/health
```

### API
- `POST /api/chat`
  - Request JSON: `{ "message": string, "history"?: { role: 'user'|'assistant'|'system', content: string }[] }`
  - Response JSON: `{ "reply": string, "model": string }`

### Notes
- If no `OPENAI_API_KEY` is set, the server always starts and replies from a demo rule-based echo.
- You can set a specific model with `OPENAI_MODEL` (default: `gpt-4o-mini`).
