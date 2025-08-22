(function () {
	const form = document.getElementById('chat-form');
	const input = document.getElementById('input');
	const sendBtn = document.getElementById('send');
	const messagesEl = document.getElementById('messages');
	const statusEl = document.getElementById('status');

	/** @type {{role: 'user'|'assistant'|'system', content: string}[]} */
	const history = [];

	function appendMessage(role, content) {
		const li = document.createElement('li');
		li.className = `message message--${role === 'user' ? 'user' : 'bot'}`;
		const bubble = document.createElement('div');
		bubble.className = 'message__bubble';
		bubble.textContent = content;
		li.appendChild(bubble);
		messagesEl.appendChild(li);
		messagesEl.scrollTop = messagesEl.scrollHeight;
	}

	async function updateStatus() {
		try {
			const res = await fetch('/health');
			const data = await res.json();
			statusEl.textContent = data.demo ? 'Demo mode' : 'Online';
		} catch (e) {
			statusEl.textContent = 'Offline';
		}
	}

	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		const text = input.value.trim();
		if (!text) return;
		appendMessage('user', text);
		history.push({ role: 'user', content: text });
		input.value = '';
		sendBtn.disabled = true;

		try {
			const res = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message: text, history })
			});
			const data = await res.json();
			if (res.ok && data && data.reply) {
				appendMessage('assistant', data.reply);
				history.push({ role: 'assistant', content: data.reply });
			} else {
				appendMessage('assistant', 'Sorry, something went wrong.');
			}
		} catch (err) {
			appendMessage('assistant', 'Network error.');
		} finally {
			sendBtn.disabled = false;
			input.focus();
		}
	});

	updateStatus();
})();