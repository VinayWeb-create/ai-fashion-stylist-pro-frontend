/**
 * chat.js — AI Fashion Stylist Pro
 * Floating AI Chat Stylist widget.
 * Self-contained: injects its own HTML + CSS.
 * Rule-based responses (no external API needed).
 * Import as a regular <script type="module"> at the bottom of any page.
 */

// ============================================================================
// CHAT CSS (injected into <head>)
// ============================================================================

const CHAT_CSS = `
/* ====== AI CHAT STYLIST WIDGET ====== */
#fsp-chat-btn {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 9990;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d4af37, #f4e4c1);
  border: none;
  cursor: pointer;
  box-shadow: 0 8px 28px rgba(212,175,55,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  transition: transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275), box-shadow 0.3s;
  animation: chat-btn-pulse 3s ease-in-out infinite;
}
#fsp-chat-btn:hover {
  transform: scale(1.12) translateY(-3px);
  box-shadow: 0 14px 36px rgba(212,175,55,0.6);
}
@keyframes chat-btn-pulse {
  0%,100% { box-shadow: 0 8px 28px rgba(212,175,55,0.45); }
  50%      { box-shadow: 0 8px 42px rgba(212,175,55,0.7); }
}
#fsp-chat-panel {
  position: fixed;
  bottom: 100px;
  right: 28px;
  z-index: 9991;
  width: 340px;
  max-height: 480px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 20px 60px rgba(0,0,0,0.18);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transform: scale(0.85) translateY(20px);
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.175,0.885,0.32,1.275);
}
#fsp-chat-panel.open {
  transform: scale(1) translateY(0);
  opacity: 1;
  pointer-events: all;
}
.fsp-chat-header {
  background: linear-gradient(135deg, #1a1412, #2c1810);
  color: #d4af37;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.fsp-chat-header-avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg,#d4af37,#f4e4c1);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.fsp-chat-header-info { flex:1; }
.fsp-chat-header-name { font-weight: 700; font-size: 14px; }
.fsp-chat-header-status {
  font-size: 11px; color: rgba(212,175,55,0.7);
  display: flex; align-items: center; gap: 4px;
}
.fsp-chat-header-status::before {
  content:''; width:6px; height:6px;
  border-radius:50%; background:#2ed573;
  display:inline-block;
}
.fsp-chat-close {
  background: none; border: none;
  color: rgba(212,175,55,0.7);
  cursor: pointer; font-size: 20px;
  padding: 2px 6px;
  transition: color 0.2s;
}
.fsp-chat-close:hover { color: #d4af37; }
.fsp-chat-messages {
  flex: 1; overflow-y: auto;
  padding: 14px;
  display: flex; flex-direction: column; gap: 10px;
  background: #faf9fc;
}
.fsp-msg {
  max-width: 84%;
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 13px;
  line-height: 1.5;
  animation: fsp-msg-in 0.25s ease;
}
@keyframes fsp-msg-in {
  from { opacity:0; transform: translateY(8px); }
  to   { opacity:1; transform: translateY(0); }
}
.fsp-msg-bot {
  background: #fff;
  border: 1px solid #ece8f0;
  border-bottom-left-radius: 4px;
  color: #3d2c2c;
  align-self: flex-start;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.fsp-msg-user {
  background: linear-gradient(135deg,#d4af37,#c49a20);
  color: #fff;
  border-bottom-right-radius: 4px;
  align-self: flex-end;
}
.fsp-typing {
  display: flex; gap: 4px; align-items: center;
  padding: 10px 14px;
  background: #fff; border: 1px solid #ece8f0;
  border-radius: 14px; border-bottom-left-radius: 4px;
  align-self: flex-start; max-width: 60px;
}
.fsp-typing span {
  width: 7px; height: 7px; background: #d4af37;
  border-radius: 50%;
  animation: fsp-bounce 1.2s infinite;
}
.fsp-typing span:nth-child(2) { animation-delay: 0.2s; }
.fsp-typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes fsp-bounce {
  0%,80%,100% { transform: translateY(0); }
  40%          { transform: translateY(-6px); }
}
.fsp-chat-input-row {
  display: flex; gap: 8px;
  padding: 12px 14px;
  background: #fff;
  border-top: 1px solid #ece8f0;
  flex-shrink: 0;
}
#fsp-chat-input {
  flex: 1;
  padding: 9px 14px;
  border: 1.5px solid #e0d8f0;
  border-radius: 24px;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
  background: #faf9fc;
  color: #3d2c2c;
}
#fsp-chat-input:focus { border-color: #d4af37; }
#fsp-chat-send {
  width: 38px; height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg,#d4af37,#c49a20);
  border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
  flex-shrink: 0;
}
#fsp-chat-send:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 14px rgba(212,175,55,0.5);
}
.fsp-quick-replies {
  display: flex; flex-wrap: wrap; gap: 6px;
  margin-top: 8px;
}
.fsp-quick-reply {
  padding: 5px 11px;
  background: rgba(212,175,55,0.1);
  border: 1px solid rgba(212,175,55,0.35);
  border-radius: 14px; font-size: 11px;
  color: #8b6914; cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}
.fsp-quick-reply:hover {
  background: rgba(212,175,55,0.25);
  color: #5a4008;
}
@media (max-width: 400px) {
  #fsp-chat-panel { width: calc(100vw - 24px); right: 12px; }
}
`;

// ============================================================================
// RULE-BASED AI RESPONSES
// ============================================================================

const QUICK_REPLIES = [
    'What to wear today?',
    'Outfit under ₹1000',
    'Office look ideas',
    'Wedding party outfit',
    'Rainy day fashion',
];

/**
 * Generate a contextual response to the user's message.
 * @param {string} msg - User's raw message text
 * @returns {string} - Bot HTML response
 */
function generateResponse(msg) {
    const m = msg.toLowerCase();

    // Greetings
    if (/^(hi|hello|hey|namaste|hii+)\b/.test(m)) {
        return '👋 Namaste! I\'m your AI Style Stylist. Ask me anything — outfit ideas, budget tips, occasion fashion, or weather-based suggestions!<div class="fsp-quick-replies">' + buildQR() + '</div>';
    }

    // Today / daily outfit
    if (/today|daily|morning|roz|what.*(wear|outfit)/i.test(m)) {
        const h = new Date().getHours();
        const part = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
        return `🌟 For a great ${part} look today, try:<br><br>
<b>Casual:</b> Cotton shirt + slim chinos + white sneakers<br>
<b>Smart:</b> Oxford shirt + dark jeans + loafers<br>
<b>Ethnic:</b> Kurta + patiala/slim trousers + juttis<br><br>
Check the <a href="occasion-solver.html" style="color:#d4af37;font-weight:600;">Occasion Solver</a> for a tailored pick! 🎯`;
    }

    // Budget mentions
    if (/₹|rs\.?|rupee|budget|cheap|affordable|low.cost|under\s*\d+/i.test(m)) {
        const match = m.match(/(\d[\d,]*)/);
        const amount = match ? parseInt(match[1].replace(',', '')) : null;
        if (amount && amount <= 500) {
            return `💰 <b>Under ₹500 Looks:</b><br><br>
• Plain tee + joggers (Meesho: ~₹299 combo)<br>
• Kurta + leggings set (₹350–₹450 on Meesho)<br>
• Basic denim + solid tee (Flipkart ~₹499)<br><br>
🛍️ Try the <a href="budget-stylist.html" style="color:#d4af37;font-weight:600;">Budget Stylist</a> for curated options!`;
        }
        if (amount && amount <= 1000) {
            return `💰 <b>Under ₹1000 Looks:</b><br><br>
• Casual shirt + chino combo (Amazon ~₹699)<br>
• Anarkali suit set (Meesho ~₹799)<br>
• Denim jacket + inner tee (Flipkart ~₹899)<br><br>
🛍️ Head to the <a href="budget-stylist.html" style="color:#d4af37;font-weight:600;">Budget Stylist</a> for more!`;
        }
        return `💰 Smart budgeting! Check the <a href="budget-stylist.html" style="color:#d4af37;font-weight:600;">Budget Stylist page</a> to filter by ₹500 / ₹1000 / ₹3000 and get curated outfit combos with direct shopping links.`;
    }

    // Weather
    if (/rain|rainy|wet|monsoon|sunny|hot|cold|winter|summer|weather/i.test(m)) {
        return `🌦️ <b>Weather Outfit Tips:</b><br><br>
• <b>Rainy:</b> Dark waterproof jacket, chinos, closed shoes<br>
• <b>Sunny/Hot:</b> White cotton tee, linen trousers, sandals<br>
• <b>Cold:</b> Layered sweater + jacket + warm boots<br><br>
Your <a href="dashboard.html" style="color:#d4af37;font-weight:600;">Dashboard</a> shows live weather + style suggestions!`;
    }

    // Occasion
    if (/office|work|professional|formal/i.test(m)) {
        return `💼 <b>Office Ready Looks:</b><br><br>
• Men: Formal shirt + trousers + leather belt + Oxford shoes<br>
• Women: Blazer + bootcut trousers + pointed pumps<br>
• Colours: Navy, Charcoal, White, Grey<br><br>
Try the <a href="occasion-solver.html?occasion=office" style="color:#d4af37;font-weight:600;">Occasion Solver → Office</a>!`;
    }

    if (/interview/i.test(m)) {
        return `🤝 <b>Interview Outfit:</b><br><br>
• Stick to formal, ironed clothes — first impressions matter!<br>
• Men: Formal shirt + trousers + clean shoes<br>
• Women: Formal salwar suit / saree / western blazer set<br>
• Avoid: flashy jewellery, casual footwear, strong perfumes<br><br>
Use <a href="occasion-solver.html" style="color:#d4af37;font-weight:600;">Occasion Solver</a> for a full outfit checklist!`;
    }

    if (/wedding|shaadi|marriage|party|function/i.test(m)) {
        return `💍 <b>Wedding / Party Outfit:</b><br><br>
• Men: Sherwani / Bandhgala suit / Indo-western kurta<br>
• Women: Lehenga / Anarkali / Saree / Gown<br>
• Accessories: Statement jewellery, embroidered dupatta, mojris<br><br>
Check the <a href="occasion-solver.html" style="color:#d4af37;font-weight:600;">Occasion Solver → Wedding</a>!`;
    }

    if (/college|student|casual/i.test(m)) {
        return `🎓 <b>College Casual Vibes:</b><br><br>
• Graphic tee + ripped jeans + sneakers<br>
• Oversized hoodie + joggers + chunky shoes<br>
• Kurti + palazzo + flats (ethnic-casual)<br><br>
💡 Stay comfy and trendy! Head to <a href="occasion-solver.html" style="color:#d4af37;font-weight:600;">Occasion Solver → College</a>.`;
    }

    if (/date|romantic|love/i.test(m)) {
        return `💃 <b>Date Night Outfit:</b><br><br>
• Men: Smart-casual — dark jeans + fitted shirt + clean sneakers or loafers<br>
• Women: Wrap dress / midi skirt + crop top / elegant co-ord set<br>
• Accessorise with subtle jewellery, a nice fragrance, and a confident smile!<br><br>
🌹 Try <a href="occasion-solver.html" style="color:#d4af37;font-weight:600;">Occasion Solver → Date</a>!`;
    }

    // Wardrobe
    if (/wardrobe|clothes|my clothes|upload/i.test(m)) {
        return `👗 <b>Your Smart Wardrobe:</b><br><br>
Scan, save, and organise all your clothes in your digital wardrobe. The AI will suggest outfits using items you already own!<br><br>
👉 Go to <a href="wardrobe.html" style="color:#d4af37;font-weight:600;">My Wardrobe</a> to add items.`;
    }

    // Virtual Try-On
    if (/try.?on|virtual|preview|see how/i.test(m)) {
        return `🪞 <b>Virtual Try-On:</b><br><br>
Upload your photo and overlay a selected outfit to preview how it looks — right in the browser!<br><br>
👉 Try it at <a href="virtual-tryon.html" style="color:#d4af37;font-weight:600;">Virtual Try-On</a>!`;
    }

    // Premium
    if (/premium|subscribe|upgrade|paid|membership/i.test(m)) {
        return `⭐ <b>Fashion Stylist Pro — Premium:</b><br><br>
Unlock unlimited styling, priority AI recommendations, exclusive outfit collections, and more!<br><br>
👉 See plans at <a href="premium.html" style="color:#d4af37;font-weight:600;">Premium Page</a>. (Coming soon — no payment yet!)`;
    }

    // Dashboard
    if (/dashboard|profile|my account|stats/i.test(m)) {
        return `📊 Your <a href="dashboard.html" style="color:#d4af37;font-weight:600;">Dashboard</a> has:<br><br>
✅ Wardrobe summary<br>✅ Live weather & style tip<br>✅ Saved outfits<br>✅ Premium status<br>✅ Quick-access links`;
    }

    // Default
    return `🤔 I can help with:<br><br>
• <b>Outfit ideas</b> for any occasion<br>
• <b>Budget</b> outfit suggestions (₹500 – ₹3000+)<br>
• <b>Weather-based</b> fashion tips<br>
• <b>Wardrobe</b> scanning & saving<br>
• <b>Virtual try-on</b><br><br>
<div class="fsp-quick-replies">${buildQR()}</div>`;
}

function buildQR() {
    return QUICK_REPLIES.map(q =>
        `<button class="fsp-quick-reply" onclick="window._fspChatSend(this.textContent)">${q}</button>`
    ).join('');
}

// ============================================================================
// WIDGET INIT
// ============================================================================

function initChat() {
    // Inject CSS
    const style = document.createElement('style');
    style.textContent = CHAT_CSS;
    document.head.appendChild(style);

    // Inject HTML
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
    <button id="fsp-chat-btn" title="AI Style Stylist" aria-label="Open Style Chat">👗</button>
    <div id="fsp-chat-panel" role="dialog" aria-label="AI Style Chat" aria-modal="true">
      <div class="fsp-chat-header">
        <div class="fsp-chat-header-avatar">✨</div>
        <div class="fsp-chat-header-info">
          <div class="fsp-chat-header-name">Style AI Assistant</div>
          <div class="fsp-chat-header-status">Online – Ask me anything!</div>
        </div>
        <button class="fsp-chat-close" id="fsp-chat-close" aria-label="Close chat">✕</button>
      </div>
      <div class="fsp-chat-messages" id="fsp-chat-messages">
        <!-- initial bot message injected via JS -->
      </div>
      <div class="fsp-chat-input-row">
        <input type="text" id="fsp-chat-input" placeholder="Ask your stylist..." maxlength="200" autocomplete="off">
        <button id="fsp-chat-send" aria-label="Send">➤</button>
      </div>
    </div>
  `;
    document.body.appendChild(wrapper);

    const chatBtn = document.getElementById('fsp-chat-btn');
    const chatPanel = document.getElementById('fsp-chat-panel');
    const closeBtn = document.getElementById('fsp-chat-close');
    const messages = document.getElementById('fsp-chat-messages');
    const input = document.getElementById('fsp-chat-input');
    const sendBtn = document.getElementById('fsp-chat-send');

    // Add welcome message
    addBotMsg('👋 Namaste! I\'m your AI Style Stylist. What would you like help with today?<div class="fsp-quick-replies">' + buildQR() + '</div>');

    // Open / Close
    chatBtn.addEventListener('click', () => {
        chatPanel.classList.toggle('open');
        if (chatPanel.classList.contains('open')) input.focus();
    });
    closeBtn.addEventListener('click', () => chatPanel.classList.remove('open'));

    // Send
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });

    // Global function for quick-reply buttons
    window._fspChatSend = (text) => {
        input.value = text;
        sendMessage();
    };

    function sendMessage() {
        const text = input.value.trim();
        if (!text) return;
        addUserMsg(text);
        input.value = '';

        // Show typing indicator
        const typing = document.createElement('div');
        typing.className = 'fsp-typing';
        typing.innerHTML = '<span></span><span></span><span></span>';
        messages.appendChild(typing);
        scrollBottom();

        setTimeout(() => {
            typing.remove();
            addBotMsg(generateResponse(text));
        }, 800 + Math.random() * 400);
    }

    function addBotMsg(html) {
        const div = document.createElement('div');
        div.className = 'fsp-msg fsp-msg-bot';
        div.innerHTML = html;
        messages.appendChild(div);
        scrollBottom();
    }

    function addUserMsg(text) {
        const div = document.createElement('div');
        div.className = 'fsp-msg fsp-msg-user';
        div.textContent = text;
        messages.appendChild(div);
        scrollBottom();
    }

    function scrollBottom() {
        messages.scrollTop = messages.scrollHeight;
    }
}

// Auto-init on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChat);
} else {
    initChat();
}
