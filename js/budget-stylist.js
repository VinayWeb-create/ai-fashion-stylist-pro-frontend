import { initAuthUI } from './auth-ui.js';

// ============================================================================
// BUDGET OUTFIT DATA (Indian context)
// ============================================================================

const BUDGET_OUTFITS = [
    {
        name: 'Classic College Casual',
        gender: 'unisex',
        tiers: ['500'],
        occasion: 'Casual / College',
        items: [
            'Solid cotton round-neck tee',
            'Jogger / trackpant',
            'White canvas sneakers',
        ],
        total_est: '₹350 – ₹499',
        shops: {
            amazon: 'https://www.amazon.in/s?k=cotton+tee+jogger+combo',
            flipkart: 'https://www.flipkart.com/search?q=tshirt+jogger+combo',
            meesho: 'https://www.meesho.com/search?q=cotton+tee+combo',
        },
        tip: 'Meesho often has tee + jogger sets under ₹299. Grab 2 to rotate!',
        colours: ['White', 'Navy', 'Grey', 'Black'],
    },
    {
        name: 'Budget Ethnic Kurti Set',
        gender: 'womens',
        tiers: ['500'],
        occasion: 'Casual / Daily',
        items: [
            'Printed cotton kurti',
            'Leggings / churidar',
            'Flats (kolhapuri or slippers)',
        ],
        total_est: '₹380 – ₹480',
        shops: {
            amazon: 'https://www.amazon.in/s?k=cotton+kurti+leggings+combo',
            flipkart: 'https://www.flipkart.com/search?q=kurti+leggings+set',
            meesho: 'https://www.meesho.com/search?q=kurti+combo',
        },
        tip: 'Block-print kurtis feel ethnic and fresh without spending much.',
        colours: ['Coral', 'Sky Blue', 'Mint', 'Mustard'],
    },
    {
        name: 'Smart Casual Day Out',
        gender: 'mens',
        tiers: ['1000'],
        occasion: 'Casual / Outing',
        items: [
            'Oxford button-down shirt',
            'Slim chino trousers',
            'White sneakers or loafers',
        ],
        total_est: '₹750 – ₹999',
        shops: {
            amazon: 'https://www.amazon.in/s?k=slim+chino+shirt+combo+men',
            flipkart: 'https://www.flipkart.com/search?q=men+chino+shirt+casual',
            meesho: 'https://www.meesho.com/search?q=men+chino+shirt',
        },
        tip: 'Flipkart\'s "The Roadster Life Co." has great value-for-money chinos under ₹599.',
        colours: ['Khaki', 'Navy', 'Olive', 'Beige'],
    },
    {
        name: 'Trendy Co-Ord Set',
        gender: 'womens',
        tiers: ['1000'],
        occasion: 'Casual / Brunch',
        items: [
            'Crop top + wide-leg palazzo co-ord',
            'Strappy flat sandals',
            'Mini sling bag',
        ],
        total_est: '₹799 – ₹999',
        shops: {
            amazon: 'https://www.amazon.in/s?k=women+coord+set+palazzo',
            flipkart: 'https://www.flipkart.com/search?q=women+coord+set',
            meesho: 'https://www.meesho.com/search?q=women+coord+set',
        },
        tip: 'Co-ords look expensive but Meesho/Flipkart have amazing sets under ₹800.',
        colours: ['Lavender', 'Peach', 'White', 'Sage Green'],
    },
    {
        name: 'Formal Office Wardrobe',
        gender: 'mens',
        tiers: ['3000'],
        occasion: 'Office / Formal',
        items: [
            'Van Heusen / Arrow formal shirt',
            'Slim formal trousers',
            'Leather Oxford shoes',
            'Premium leather belt',
        ],
        total_est: '₹2200 – ₹3000',
        shops: {
            amazon: 'https://www.amazon.in/s?k=van+heusen+formal+shirt',
            flipkart: 'https://www.flipkart.com/search?q=formal+shirt+trouser+combo',
            meesho: 'https://www.meesho.com/search?q=formal+shirt+trouser',
        },
        tip: 'Invest in 2-3 quality formal shirts — they outlast many cheaper ones.',
        colours: ['White', 'Light Blue', 'Grey', 'Lavender'],
    },
    {
        name: 'Festive Anarkali Look',
        gender: 'womens',
        tiers: ['3000'],
        occasion: 'Wedding / Puja / Festival',
        items: [
            'Embroidered Anarkali suit',
            'Chooridar / cigarette pants',
            'Embellished heels or mojris',
            'Dupatta with border',
        ],
        total_est: '₹1800 – ₹2999',
        shops: {
            amazon: 'https://www.amazon.in/s?k=anarkali+suit+embroidered',
            flipkart: 'https://www.flipkart.com/search?q=anarkali+suit',
            meesho: 'https://www.meesho.com/search?q=anarkali+suit',
        },
        tip: 'Biba and W on Flipkart have gorgeous Diwali/puja collections under ₹2500.',
        colours: ['Magenta', 'Royal Blue', 'Teal', 'Gold', 'Maroon'],
    },
    {
        name: 'Premium Smart Casual',
        gender: 'unisex',
        tiers: ['custom'],
        occasion: 'Outing / Date / Travel',
        items: [
            'Premium denim jeans',
            'Linen/cotton casual shirt or top',
            'Branded sneakers',
            'Stylish belt or sling bag',
        ],
        total_est: '₹3500+',
        shops: {
            amazon: 'https://www.amazon.in/s?k=premium+denim+casual+outfit',
            flipkart: 'https://www.flipkart.com/search?q=premium+casual+outfit',
            meesho: 'https://www.meesho.com/search?q=premium+casual+outfit',
        },
        tip: 'Spend on fit, not just brand. A well-fitted mid-range piece beats an ill-fitting designer item.',
        colours: ['Indigo Blue', 'Off-White', 'Olive', 'Charcoal'],
    },
];

// ============================================================================
// RENDER FUNCTIONS
// ============================================================================

/**
 * Render outfit cards for a given budget tier and gender filter.
 * @param {string} tier  - '500' | '1000' | '3000' | 'custom' | 'all'
 * @param {string} gender - 'all' | 'mens' | 'womens' | 'unisex'
 * @param {number|null} customAmount - custom rupee amount
 */
function renderBudgetOutfits(tier, gender, customAmount = null) {
    const container = document.getElementById('budget-results');
    if (!container) return;

    container.innerHTML = '<div class="budget-loading"><div class="budget-spinner"></div><p>Finding best outfits for your budget...</p></div>';

    setTimeout(() => {
        let filtered = BUDGET_OUTFITS;

        // Filter by tier
        if (tier !== 'all') {
            filtered = filtered.filter(o => o.tiers.includes(tier));

            // For custom amount, include tiers that match range
            if (tier === 'custom' && customAmount) {
                filtered = BUDGET_OUTFITS.filter(o => {
                    if (customAmount <= 500) return o.tiers.includes('500');
                    if (customAmount <= 1000) return o.tiers.includes('1000') || o.tiers.includes('500');
                    if (customAmount <= 3000) return o.tiers.includes('3000') || o.tiers.includes('1000');
                    return true; // over 3000: show all
                });
            }
        }

        // Filter by gender
        if (gender !== 'all') {
            filtered = filtered.filter(o => o.gender === gender || o.gender === 'unisex');
        }

        if (filtered.length === 0) {
            container.innerHTML = `
        <div class="budget-empty">
          <div style="font-size:3rem;margin-bottom:1rem;">👜</div>
          <h3>No outfits found for this filter</h3>
          <p>Try a different budget or gender selection.</p>
        </div>`;
            return;
        }

        container.innerHTML = filtered.map((outfit, i) => `
      <div class="budget-card" style="animation-delay:${i * 0.08}s">
        <div class="budget-card-header">
          <div>
            <h3 class="budget-card-title">${outfit.name}</h3>
            <div class="budget-card-occasion">${outfit.occasion}</div>
          </div>
          <div class="budget-price-badge">${outfit.total_est}</div>
        </div>

        <div class="budget-items">
          ${outfit.items.map(item => `<div class="budget-item">✅ ${item}</div>`).join('')}
        </div>

        <div class="budget-colours">
          ${outfit.colours.map(c => `<span class="budget-colour-tag">${c}</span>`).join('')}
        </div>

        <div class="budget-tip">💡 ${outfit.tip}</div>

        <div class="budget-shop-row">
          <a href="${outfit.shops.amazon}" target="_blank" rel="noopener" class="budget-shop-btn btn-amazon-budget">
            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M14.12 17.09c-2.62 1.93-6.43 2.96-9.71 2.96-4.59 0-8.73-1.7-11.86-4.52-.25-.22-.02-.53.27-.36 3.45 2.01 7.71 3.22 12.12 3.22 2.97 0 6.24-.62 9.25-1.9.45-.19.83.3.4.6z"/></svg>
            Amazon
          </a>
          <a href="${outfit.shops.flipkart}" target="_blank" rel="noopener" class="budget-shop-btn btn-flipkart-budget">
            🛒 Flipkart
          </a>
          <a href="${outfit.shops.meesho}" target="_blank" rel="noopener" class="budget-shop-btn btn-meesho-budget">
            ✨ Meesho
          </a>
        </div>
      </div>
    `).join('');
    }, 600);
}

// ============================================================================
// PAGE INIT
// ============================================================================

function initBudgetStylist() {
    initAuthUI();
    // Budget tier buttons
    document.querySelectorAll('.budget-tier-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.budget-tier-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const customInput = document.getElementById('budget-custom-input');
            if (btn.dataset.tier === 'custom') {
                if (customInput) { customInput.classList.add('visible'); customInput.focus(); }
            } else {
                if (customInput) customInput.classList.remove('visible');
                refreshResults();
            }
        });
    });

    // Custom amount input
    const customInput = document.getElementById('budget-custom-input');
    customInput?.addEventListener('input', refreshResults);

    // Gender filter
    document.querySelectorAll('.budget-gender-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.budget-gender-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            refreshResults();
        });
    });

    // Load default
    refreshResults();
}

function refreshResults() {
    const activeBtn = document.querySelector('.budget-tier-btn.active');
    const tier = activeBtn ? activeBtn.dataset.tier : '1000';
    const genderBtn = document.querySelector('.budget-gender-btn.active');
    const gender = genderBtn ? genderBtn.dataset.gender : 'all';
    const customInput = document.getElementById('budget-custom-input');
    const customAmt = tier === 'custom' && customInput ? parseInt(customInput.value) || null : null;
    renderBudgetOutfits(tier, gender, customAmt);
}

// Auto-init on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBudgetStylist);
} else {
    initBudgetStylist();
}
