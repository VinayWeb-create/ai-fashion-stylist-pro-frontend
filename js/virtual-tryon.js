/**
 * virtual-tryon.js — AI Fashion Stylist Pro
 * Canvas-based virtual try-on overlay.
 * User uploads their photo + selects an outfit card.
 * The selected outfit image / colour overlay is drawn on the user's photo.
 */

// ============================================================================
// OUTFIT OPTIONS FOR TRY-ON
// ============================================================================

const TRYON_OUTFITS = [
    {
        id: 'tryon-kurta',
        label: 'Indian Kurta',
        emoji: '👘',
        colour: '#c9a95c',   // golden ivory
        desc: 'Embroidered festive kurta — traditional elegance',
        gradient: ['#c9a95c', '#8b6914'],
        region: { x: 0.2, y: 0.22, w: 0.6, h: 0.55 },
    },
    {
        id: 'tryon-formal',
        label: 'Formal Suit',
        emoji: '🕴',
        colour: '#2c3e50',    // dark navy
        desc: 'Professional suit for office or interview',
        gradient: ['#2c3e50', '#1a252f'],
        region: { x: 0.18, y: 0.20, w: 0.64, h: 0.58 },
    },
    {
        id: 'tryon-tshirt',
        label: 'Casual Tee + Jeans',
        emoji: '👕',
        colour: '#3498db',    // sky blue
        desc: 'Relaxed everyday casual look',
        gradient: ['#3498db', '#1a6a9a'],
        region: { x: 0.22, y: 0.22, w: 0.56, h: 0.52 },
    },
    {
        id: 'tryon-saree',
        label: 'Saree',
        emoji: '🥻',
        colour: '#c0392b',    // red
        desc: 'Traditional women\'s saree — graceful drape',
        gradient: ['#c0392b', '#7b241c'],
        region: { x: 0.1, y: 0.2, w: 0.8, h: 0.65 },
    },
    {
        id: 'tryon-lehenga',
        label: 'Lehenga',
        emoji: '🎆',
        colour: '#8e44ad',   // royal purple
        desc: 'Festive embellished lehenga',
        gradient: ['#8e44ad', '#512e5f'],
        region: { x: 0.12, y: 0.2, w: 0.76, h: 0.65 },
    },
    {
        id: 'tryon-western',
        label: 'Western Dress',
        emoji: '👗',
        colour: '#e74c3c',   // vibrant red
        desc: 'Western midi or wrap dress',
        gradient: ['#e74c3c', '#c0392b'],
        region: { x: 0.2, y: 0.2, w: 0.6, h: 0.6 },
    },
];

// ============================================================================
// STATE
// ============================================================================

let userPhoto = null; // HTMLImageElement with the user's uploaded photo
let selectedId = null; // currently selected outfit id
const CANVAS_MAX = 600;  // max display canvas dimension

// ============================================================================
// DRAW OVERLAY
// ============================================================================

/**
 * Draw the user photo on canvas, then overlay outfit region.
 */
function drawOverlay() {
    const canvas = document.getElementById('tryon-canvas');
    if (!canvas || !userPhoto) return;

    const outfit = TRYON_OUTFITS.find(o => o.id === selectedId);
    const ctx = canvas.getContext('2d');

    // Compute dimensions
    let w = userPhoto.naturalWidth;
    let h = userPhoto.naturalHeight;
    const scale = Math.min(CANVAS_MAX / w, CANVAS_MAX / h, 1);
    w = Math.round(w * scale);
    h = Math.round(h * scale);

    canvas.width = w;
    canvas.height = h;

    // Draw user photo
    ctx.drawImage(userPhoto, 0, 0, w, h);

    if (!outfit) return;

    // Compute overlay region
    const rx = outfit.region.x * w;
    const ry = outfit.region.y * h;
    const rw = outfit.region.w * w;
    const rh = outfit.region.h * h;

    // Create gradient overlay
    const grd = ctx.createLinearGradient(rx, ry, rx, ry + rh);
    grd.addColorStop(0, hexToRGBA(outfit.gradient[0], 0.7));
    grd.addColorStop(1, hexToRGBA(outfit.gradient[1], 0.75));

    // Rounded rect clip
    ctx.save();
    roundRect(ctx, rx, ry, rw, rh, 12);
    ctx.clip();
    ctx.fillStyle = grd;
    ctx.fillRect(rx, ry, rw, rh);

    // Add fabric texture pattern
    ctx.globalAlpha = 0.12;
    for (let i = 0; i < rh; i += 8) {
        ctx.fillStyle = i % 16 === 0 ? 'rgba(255,255,255,0.5)' : 'transparent';
        ctx.fillRect(rx, ry + i, rw, 4);
    }
    ctx.globalAlpha = 1;

    // Emoji label in centre
    ctx.font = `${Math.round(rw * 0.25)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = 0.35;
    ctx.fillText(outfit.emoji, rx + rw / 2, ry + rh / 2);
    ctx.globalAlpha = 1;
    ctx.restore();

    // Border glow around overlay
    ctx.save();
    ctx.strokeStyle = hexToRGBA(outfit.gradient[0], 0.9);
    ctx.lineWidth = 3;
    ctx.shadowColor = outfit.gradient[0];
    ctx.shadowBlur = 12;
    roundRect(ctx, rx, ry, rw, rh, 12);
    ctx.stroke();
    ctx.restore();

    // Label badge
    const label = outfit.label;
    const badgePad = 10;
    const badgeH = 30;
    ctx.fillStyle = hexToRGBA(outfit.gradient[0], 0.9);
    roundRect(ctx, rx + badgePad, ry + badgePad, label.length * 8 + 20, badgeH, 8);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${14}px Outfit, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, rx + badgePad + 10, ry + badgePad + badgeH / 2);
}

// ============================================================================
// HELPERS
// ============================================================================

function hexToRGBA(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

// ============================================================================
// DOWNLOAD RESULT
// ============================================================================

function downloadResult() {
    const canvas = document.getElementById('tryon-canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'my-virtual-tryon.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// ============================================================================
// PAGE INIT
// ============================================================================

function initVirtualTryOn() {
    // Render outfit option cards
    const optionsContainer = document.getElementById('tryon-options');
    if (optionsContainer) {
        optionsContainer.innerHTML = TRYON_OUTFITS.map(o => `
      <button class="tryon-option-card" id="${o.id}" data-id="${o.id}" title="${o.desc}">
        <div class="tryon-option-emoji">${o.emoji}</div>
        <div class="tryon-option-label">${o.label}</div>
        <div class="tryon-option-desc">${o.desc}</div>
      </button>
    `).join('');
    }

    // Select outfit
    document.querySelectorAll('.tryon-option-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.tryon-option-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            selectedId = card.dataset.id;
            drawOverlay();
            updateResultLabel();
        });
    });

    // Photo upload
    const photoInput = document.getElementById('tryon-photo-input');
    const photoArea = document.getElementById('tryon-photo-area');
    const canvas = document.getElementById('tryon-canvas');
    const placeholder = document.getElementById('tryon-placeholder');

    photoArea?.addEventListener('click', () => photoInput?.click());
    photoArea?.addEventListener('dragover', e => { e.preventDefault(); photoArea.classList.add('drag'); });
    photoArea?.addEventListener('dragleave', () => photoArea.classList.remove('drag'));
    photoArea?.addEventListener('drop', e => {
        e.preventDefault(); photoArea.classList.remove('drag');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) loadUserPhoto(file);
    });
    photoInput?.addEventListener('change', e => {
        const file = e.target.files[0];
        if (file) loadUserPhoto(file);
    });

    // Download button
    document.getElementById('tryon-download-btn')?.addEventListener('click', downloadResult);

    // Reset button
    document.getElementById('tryon-reset-btn')?.addEventListener('click', () => {
        userPhoto = null;
        selectedId = null;
        if (canvas) { canvas.width = 0; canvas.height = 0; canvas.hidden = true; }
        if (placeholder) placeholder.hidden = false;
        if (photoInput) photoInput.value = '';
        document.querySelectorAll('.tryon-option-card').forEach(c => c.classList.remove('active'));
        const resultLabel = document.getElementById('tryon-result-label');
        if (resultLabel) resultLabel.textContent = '';
        const actionRow = document.getElementById('tryon-action-row');
        if (actionRow) actionRow.hidden = true;
    });
}

function loadUserPhoto(file) {
    if (file.size > 8 * 1024 * 1024) {
        alert('Photo must be under 8MB.');
        return;
    }
    const reader = new FileReader();
    reader.onload = e => {
        const img = new Image();
        img.onload = () => {
            userPhoto = img;
            const canvas = document.getElementById('tryon-canvas');
            const placeholder = document.getElementById('tryon-placeholder');
            if (canvas) canvas.hidden = false;
            if (placeholder) placeholder.hidden = true;
            drawOverlay();
            const actionRow = document.getElementById('tryon-action-row');
            if (actionRow) actionRow.hidden = false;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function updateResultLabel() {
    const outfit = TRYON_OUTFITS.find(o => o.id === selectedId);
    const label = document.getElementById('tryon-result-label');
    if (label && outfit) {
        label.textContent = `${outfit.emoji} Trying on: ${outfit.label} — ${outfit.desc}`;
    }
}

// Auto-init on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVirtualTryOn);
} else {
    initVirtualTryOn();
}
