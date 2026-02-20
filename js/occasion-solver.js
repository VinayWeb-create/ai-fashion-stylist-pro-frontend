/**
 * occasion-solver.js — AI Fashion Stylist Pro
 * Logic for the Occasion Solver feature page.
 * Maps selected occasion to outfit recommendations, accessories, budget, and weather tip.
 */

import * as Auth from './auth.js';
import { getWeather } from './weather.js';
import { initAuthUI } from './auth-ui.js';

// Auth UI is now handled by shared initAuthUI from auth-ui.js

// ============================================================================
// RENDER FUNCTIONS
// ============================================================================

/**
 * Complete outfit data for each occasion.
 * Each entry has men's and women's suggestions + shared accessories/budget/tip.
 */
const OCCASIONS = {
    college: {
        label: '🎓 College',
        emoji: '🎓',
        description: 'Fresh and comfortable for campus life',
        mens: {
            outfit: 'Graphic tee + slim-fit jeans + white sneakers',
            colours: ['White', 'Denim Blue', 'Olive', 'Charcoal'],
            shoes: 'White canvas sneakers or Puma/Nike casual shoes',
            brands: ['H&M', 'Zara', 'Uniqlo', 'Roadster'],
        },
        womens: {
            outfit: 'Oversized top + high-waist jeans + chunky sneakers',
            colours: ['Pastel Pink', 'Sky Blue', 'White', 'Mint'],
            shoes: 'Chunky sneakers or strappy flats',
            brands: ['Zara', 'H&M', 'Forever 21', 'FabAlley'],
        },
        accessories: ['Backpack or tote bag', 'Minimal stud earrings', 'Smart watch / digital watch', 'Sunglasses (casual)'],
        budget: { label: '₹800 – ₹2000', tier: 'low-medium' },
        weather_hot: 'Prefer cotton tees and breathable denim. Skip hoodies.',
        weather_rain: 'Carry a compact umbrella. Go for dark-coloured bottoms that don\'t show rain splashes.',
        weather_cold: 'Add a hoodie, denim jacket, or light bomber jacket over your outfit.',
        tip: '💡 Comfort is key for college. Iron-free fabrics save your morning rush!',
    },

    office: {
        label: '💼 Office',
        emoji: '💼',
        description: 'Professional, confident, and polished',
        mens: {
            outfit: 'Formal shirt (tucked) + slim trousers + leather belt',
            colours: ['White', 'Light Blue', 'Navy', 'Grey', 'Charcoal'],
            shoes: 'Oxford shoes or loafers (black or brown leather)',
            brands: ['Van Heusen', 'Arrow', 'Peter England', 'Blackberrys'],
        },
        womens: {
            outfit: 'Blazer + formal trousers or pencil skirt + blouse',
            colours: ['Navy', 'Charcoal', 'White', 'Beige', 'Burgundy'],
            shoes: 'Block heels or classic pumps',
            brands: ['AND', 'W', 'Allen Solly Women', 'Van Heusen Woman'],
        },
        accessories: ['Professional watch', 'Leather briefcase/laptop bag', 'Minimal jewellery', 'Belt matching shoes'],
        budget: { label: '₹1500 – ₹4000', tier: 'medium-high' },
        weather_hot: 'Use moisture-wicking formal shirts. Light-coloured linen blazers on hot days.',
        weather_rain: 'Keep a full-sleeve jacket or waterproof trench coat handy. Avoid suede shoes.',
        weather_cold: 'Layer with a fine-knit sweater or a structured blazer over formal shirt.',
        tip: '💡 Ensure clothes are pressed and wrinkle-free for best professional impression.',
    },

    interview: {
        label: '🤝 Interview',
        emoji: '🤝',
        description: 'Make a powerful first impression',
        mens: {
            outfit: 'White formal shirt + dark trousers + formal tie (optional)',
            colours: ['White', 'Navy', 'Charcoal', 'Light Grey'],
            shoes: 'Well-polished Oxford or Derby shoes (black)',
            brands: ['Arrow', 'Van Heusen', 'Raymond', 'Louis Philippe'],
        },
        womens: {
            outfit: 'Formal salwar suit / blazer over blouse + formal trousers',
            colours: ['Navy', 'Charcoal', 'White', 'Taupe', 'Muted Teal'],
            shoes: 'Closed-toe block heels or flat formal shoes',
            brands: ['AND', 'Biba (formal range)', 'W', 'Anouk'],
        },
        accessories: ['Minimal watch', 'Simple pearl/stud earrings', 'Professional bag', 'Tidy leather belt'],
        budget: { label: '₹2000 – ₹5000', tier: 'medium-high' },
        weather_hot: 'Light-coloured shirt with good breathability. Carry a handkerchief.',
        weather_rain: 'Waterproof shoes or carry a spare pair in bag. Avoid colour that bleeds in rain.',
        weather_cold: 'Formal overcoat or blazer layer. Ensure it looks polished, not overly bulky.',
        tip: '💡 Avoid flashy accessories or strong cologne/perfume. Confidence is your best accessory!',
    },

    wedding: {
        label: '💍 Wedding',
        emoji: '💍',
        description: 'Elegant, festive, and celebratory',
        mens: {
            outfit: 'Sherwani / Bandhgala suit / embroidered kurta + churidar',
            colours: ['Ivory', 'Gold', 'Navy', 'Maroon', 'Champagne Beige'],
            shoes: 'Embroidered mojris / jutti or formal leather shoes',
            brands: ['Manyavar', 'Fabindia', 'Meena Bazaar', 'Biba Men'],
        },
        womens: {
            outfit: 'Embroidered Lehenga / Anarkali Suit / Banarasi Saree',
            colours: ['Red', 'Magenta', 'Royal Blue', 'Gold', 'Emerald Green'],
            shoes: 'Embellished sandals / wedged heels / traditional mojris',
            brands: ['Anita Dongre', 'Biba', 'W', 'Fabindia', 'Nykaa Fashion'],
        },
        accessories: ['Statement jewellery set', 'Potli / clutch bag', 'Dupatta (coordinated)', 'Floral or statement hair accessories'],
        budget: { label: '₹3000 – ₹15000+', tier: 'high' },
        weather_hot: 'Choose breathable fabrics like georgette or chiffon. Avoid heavy velvet.',
        weather_rain: 'Pre-check the venue. Keep hands free, avoid trailing hemlines outdoors.',
        weather_cold: 'Velvet or brocade lehengas/sherwanis are ideal. Add embroidered pashmina.',
        tip: '💡 Book outfit weeks in advance for alterations. Don\'t try new footwear on the wedding day!',
    },

    casual: {
        label: '😎 Casual',
        emoji: '😎',
        description: 'Relaxed everyday style for any outing',
        mens: {
            outfit: 'Plain tee / polo + chino / jogger + casual sneakers',
            colours: ['Navy', 'White', 'Olive', 'Grey Marl', 'Mustard'],
            shoes: 'Casual sneakers (Nike, Puma, Adidas) or slip-ons',
            brands: ['H&M', 'Zara', 'Uniqlo', 'Roadster', 'Bewakoof'],
        },
        womens: {
            outfit: 'Crop tee + high-waist jeans or midi skirt + flats/sneakers',
            colours: ['Pastel', 'White', 'Denim Blue', 'Terracotta', 'Sage Green'],
            shoes: 'White sneakers, strappy flats, or block sandals',
            brands: ['Zara', 'H&M', 'FabAlley', 'Vero Moda', 'Koovs'],
        },
        accessories: ['Crossbody bag / tote', 'Sunglasses', 'Minimal bracelet / watch', 'Cap or beanie (optional)'],
        budget: { label: '₹500 – ₹1500', tier: 'low-medium' },
        weather_hot: 'Breathable fabrics — cotton tees, linen shorts, sandals. Stay breezy!',
        weather_rain: 'Dark bottoms, waterproof footwear, compact umbrella. Avoid linen in rain.',
        weather_cold: 'Layered look: t-shirt + denim shirt + light jacket. Comfy yet warm.',
        tip: '💡 Casual doesn\'t mean sloppy. Fit is everything — even in a tee and jeans!',
    },

    date: {
        label: '❤️ Date Night',
        emoji: '❤️',
        description: 'Charming, confident, and stylish',
        mens: {
            outfit: 'Fitted solid shirt + dark slim jeans + clean white or suede sneakers / loafers',
            colours: ['Black', 'Navy', 'Burgundy', 'White', 'Dusty Blue'],
            shoes: 'Clean white sneakers, suede loafers, or Chelsea boots',
            brands: ['Zara', 'H&M', 'Jack & Jones', 'Selected Homme'],
        },
        womens: {
            outfit: 'Wrap midi dress / flowy co-ord set / fitted blazer + skirt',
            colours: ['Red', 'Black', 'Dusty Rose', 'Emerald', 'Nude Beige'],
            shoes: 'Strappy heels, block heels, or cute ankle boots',
            brands: ['Zara', 'Vero Moda', 'ONLY', 'FabAlley', 'Nykaa Fashion'],
        },
        accessories: ['Elegant watch / bracelet', 'Subtle perfume', 'Small clutch / sling bag', 'Delicate necklace or stud earrings'],
        budget: { label: '₹1500 – ₹4000', tier: 'medium' },
        weather_hot: 'Light flowy fabrics — chiffon or cotton. Avoid heavy layering.',
        weather_rain: 'Dark coloured outfits are safer. Opt for closed-toe heels or cute boots.',
        weather_cold: 'A faux-leather or suede jacket adds romance and warmth. Pair with booties.',
        tip: '💡 Dress one step above the venue\'s dress code. Confidence > expensive brand!',
    },
};

// ============================================================================
// RENDER FUNCTIONS
// ============================================================================

/**
 * Inject the full occasion recommendation into the page.
 * @param {string} occasionKey - Key from OCCASIONS object
 * @param {string} gender - 'mens' or 'womens'
 * @param {Object|null} weather - Result from getWeather() or null
 */
function renderOccasionResult(occasionKey, gender, weather) {
    const occ = OCCASIONS[occasionKey];
    const data = occ[gender] || occ.mens;
    const result = document.getElementById('occ-result');
    if (!result) return;

    // Pick weather tip
    let weatherTip = '';
    let weatherBadge = '';
    if (weather && weather.condition !== 'Unknown') {
        const tip = weather.style_tip;
        if (tip === 'hot' || tip === 'sunny') weatherTip = occ.weather_hot;
        else if (tip === 'rainy') weatherTip = occ.weather_rain;
        else if (tip === 'cold') weatherTip = occ.weather_cold;
        else weatherTip = occ.weather_hot; // fallback

        weatherBadge = `
      <div class="occ-weather-badge">
        <span class="occ-weather-emoji">${weather.emoji}</span>
        <span><b>${weather.condition}</b> ${weather.temperature ? `· ${weather.temperature}°C` : ''}</span>
      </div>`;
    }

    // Colours
    const coloursHtml = data.colours.map(c =>
        `<div class="occ-colour-tag" title="${c}">${c}</div>`
    ).join('');

    // Accessories
    const accsHtml = occ.accessories.map(a =>
        `<li>✅ ${a}</li>`
    ).join('');

    result.innerHTML = `
    <div class="occ-result-card">
      <!-- Header -->
      <div class="occ-result-header">
        <div class="occ-result-emoji">${occ.emoji}</div>
        <div>
          <h2 class="occ-result-title">${occ.label}</h2>
          <p class="occ-result-desc">${occ.description} · ${gender === 'womens' ? 'Women\'s' : 'Men\'s'} look</p>
        </div>
        ${weatherBadge}
      </div>

      <!-- Outfit -->
      <div class="occ-section">
        <div class="occ-section-title">👔 Recommended Outfit</div>
        <div class="occ-outfit-text">${data.outfit}</div>
      </div>

      <!-- Colours -->
      <div class="occ-section">
        <div class="occ-section-title">🎨 Colour Palette</div>
        <div class="occ-colours">${coloursHtml}</div>
      </div>

      <!-- Shoes -->
      <div class="occ-section">
        <div class="occ-section-title">👟 Footwear</div>
        <p class="occ-text">${data.shoes}</p>
      </div>

      <!-- Accessories -->
      <div class="occ-section">
        <div class="occ-section-title">✨ Accessories</div>
        <ul class="occ-list">${accsHtml}</ul>
      </div>

      <!-- Budget -->
      <div class="occ-section">
        <div class="occ-section-title">💰 Budget Guide</div>
        <div class="occ-budget-badge">${occ.budget.label}</div>
        <a href="budget-stylist.html" class="occ-link-btn">Browse Budget Outfits →</a>
      </div>

      <!-- Weather Tip -->
      ${weatherTip ? `
      <div class="occ-section occ-weather-section">
        <div class="occ-section-title">🌦️ Weather Tip</div>
        <p class="occ-text">${weatherTip}</p>
      </div>` : ''}

      <!-- Style Tip -->
      <div class="occ-tip">
        ${occ.tip}
      </div>
    </div>
  `;

    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================================================
// PAGE INIT
// ============================================================================

async function initOccasionSolver() {
    initAuthUI();
    // Occasion card click
    document.querySelectorAll('.occ-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.occ-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            solveOccasion();
        });
    });

    // Gender toggle
    document.querySelectorAll('.occ-gender-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.occ-gender-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            solveOccasion();
        });
    });

    // Check URL params for pre-selected occasion
    const params = new URLSearchParams(window.location.search);
    const preOcc = params.get('occasion');
    if (preOcc && OCCASIONS[preOcc]) {
        const card = document.querySelector(`.occ-card[data-occasion="${preOcc}"]`);
        if (card) {
            card.click();
        }
    }
}

async function solveOccasion() {
    const activeCard = document.querySelector('.occ-card.active');
    if (!activeCard) return;

    const occasionKey = activeCard.dataset.occasion;
    const genderBtn = document.querySelector('.occ-gender-btn.active');
    const gender = genderBtn ? genderBtn.dataset.gender : 'mens';

    // Show loading
    const result = document.getElementById('occ-result');
    if (result) {
        result.innerHTML = '<div class="occ-loading"><div class="occ-spinner"></div><p>Finding perfect outfits...</p></div>';
    }

    // Fetch weather (with timeout)
    let weather = null;
    try {
        const weatherPromise = getWeather();
        const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(null), 5000));
        weather = await Promise.race([weatherPromise, timeoutPromise]);
    } catch (e) {
        weather = null;
    }

    renderOccasionResult(occasionKey, gender, weather);
}

// Auto-init on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOccasionSolver);
} else {
    initOccasionSolver();
}
