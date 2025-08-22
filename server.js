'use strict';
require('dotenv').config();

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

let openaiClient = null;
let isDemoMode = true;

if (OPENAI_API_KEY && OPENAI_API_KEY.trim().length > 0) {
	try {
		const OpenAI = require('openai');
		openaiClient = new OpenAI({ apiKey: OPENAI_API_KEY });
		isDemoMode = false;
		console.log('OpenAI API key detected. Using OpenAI for responses.');
	} catch (err) {
		console.warn('OpenAI SDK not available, falling back to demo mode. Error:', err.message);
	}
} else {
	console.log('No OPENAI_API_KEY provided. Running in demo mode.');
}

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public'), { index: 'index.html' }));

app.get('/health', (_req, res) => {
	res.json({ ok: true, demo: isDemoMode });
});

function generateDemoReply(userMessage) {
	const canned = [
		"I'm a demo bot. Set OPENAI_API_KEY to talk to a real model.",
		"Here's a playful echo while in demo mode:",
	];
	const reversed = userMessage ? userMessage.split('').reverse().join('') : '';
	return `${canned[0]}\n\n${canned[1]} "${reversed}"`;
}

app.post('/api/chat', async (req, res) => {
	try {
		const { message, history } = req.body || {};
		const userMessage = typeof message === 'string' ? message.trim() : '';
		const chatHistory = Array.isArray(history) ? history.slice(-20) : [];

		if (!userMessage) {
			return res.status(400).json({ error: 'message is required' });
		}

		if (isDemoMode || !openaiClient) {
			return res.json({ reply: generateDemoReply(userMessage), model: 'demo' });
		}

		const messages = [
			{ role: 'system', content: 'You are a helpful, concise AI assistant.' },
			...chatHistory.filter(m => m && m.role && m.content),
			{ role: 'user', content: userMessage }
		];

		let replyText = null;

		// Try chat.completions first
		try {
			const completion = await openaiClient.chat.completions.create({
				model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
				messages,
				temperature: 0.5,
				max_tokens: 512
			});
			replyText = completion.choices?.[0]?.message?.content?.trim();
		} catch (err) {
			// Fallback to responses API if available
			try {
				const response = await openaiClient.responses.create({
					model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
					input: messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n'),
				});
				replyText = response?.output_text?.trim();
			} catch (err2) {
				throw err2;
			}
		}

		if (!replyText) {
			throw new Error('No reply generated from model.');
		}

		return res.json({ reply: replyText, model: process.env.OPENAI_MODEL || 'gpt-4o-mini' });
	} catch (error) {
		console.error('Chat error:', error);
		res.status(500).json({ error: 'Internal Server Error', details: String(error.message || error) });
	}
});

app.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});