let uploadedImage = null;
const API_URL = 'https://ai-fashion-stylist-pro-production.up.railway.app/predict';

const imageInput = document.getElementById('imageInput');
const uploadArea = document.getElementById('uploadArea');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');
const imageCanvas = document.getElementById('imageCanvas');
const generateBtn = document.getElementById('generateBtn');
const resultsSection = document.getElementById('resultsSection');
const tryAnotherBtn = document.getElementById('tryAnotherBtn');

const occasionSelect = document.getElementById('occasion');
const occasionSubtypeSelect = document.getElementById('occasionSubtype');
const occasionSubtypeGroup = document.getElementById('occasionSubtypeGroup');
const climateSelect = document.getElementById('climate');
const clothingStyleSelect = document.getElementById('clothingStyle');
const bodyTypeSelect = document.getElementById('bodyType');
const budgetSelect = document.getElementById('budget');

const outfitType = document.getElementById('outfitType');
const confidenceFill = document.getElementById('confidenceFill');
const confidenceText = document.getElementById('confidenceText');
const outfitsContainer = document.getElementById('outfitsContainer');

const occasionSubtypes = {
    casual: [
        { value: 'college', label: 'College' },
        { value: 'travel', label: 'Travel' },
        { value: 'daily', label: 'Daily Wear' }
    ],
    formal: [
        { value: 'office', label: 'Office' },
        { value: 'interview', label: 'Interview' },
        { value: 'meeting', label: 'Meeting' }
    ],
    party: [
        { value: 'night', label: 'Night Out' },
        { value: 'wedding', label: 'Wedding' },
        { value: 'festival', label: 'Festival' }
    ],
    ethnic: [
        { value: 'traditional', label: 'Traditional' },
        { value: 'festive', label: 'Festive' }
    ]
};

occasionSelect.addEventListener('change', () => {
    const occasion = occasionSelect.value;
    const subtypes = occasionSubtypes[occasion];

    if (subtypes) {
        occasionSubtypeSelect.innerHTML = '';
        subtypes.forEach(subtype => {
            const option = document.createElement('option');
            option.value = subtype.value;
            option.textContent = subtype.label;
            occasionSubtypeSelect.appendChild(option);
        });
        occasionSubtypeGroup.hidden = false;
    } else {
        occasionSubtypeGroup.hidden = true;
    }
});

occasionSelect.dispatchEvent(new Event('change'));

uploadArea.addEventListener('click', () => {
    imageInput.click();
});

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--color-secondary)';
    uploadArea.style.background = 'var(--color-background)';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = 'var(--color-border)';
    uploadArea.style.background = 'var(--color-surface)';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--color-border)';
    uploadArea.style.background = 'var(--color-surface)';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleImageUpload(file);
    }
});

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleImageUpload(file);
    }
});

function handleImageUpload(file) {
    if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const ctx = imageCanvas.getContext('2d');
            const maxWidth = uploadArea.clientWidth - 80;
            const maxHeight = 400;

            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }

            imageCanvas.width = width;
            imageCanvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            uploadPlaceholder.hidden = true;
            imageCanvas.hidden = false;

            uploadedImage = file;
            generateBtn.disabled = false;
            resultsSection.hidden = true;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

generateBtn.addEventListener('click', async () => {
    if (!uploadedImage) {
        alert('Please upload an image first');
        return;
    }

    const btnText = generateBtn.querySelector('.btn-text');
    const btnLoader = generateBtn.querySelector('.btn-loader');
    btnText.hidden = true;
    btnLoader.hidden = false;
    generateBtn.disabled = true;

    try {
        const formData = new FormData();
        formData.append('image', uploadedImage);
        formData.append('occasion', occasionSelect.value);
        formData.append('occasion_subtype', occasionSubtypeSelect.value || '');
        formData.append('climate', climateSelect.value);
        formData.append('clothing_style', clothingStyleSelect.value);
        formData.append('body_type', bodyTypeSelect.value);
        formData.append('budget', budgetSelect.value);

        const response = await fetch(API_URL, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received data:', data);
        displayResults(data.prediction);

    } catch (error) {
        console.error('Error:', error);
        alert('Error generating recommendations. Please make sure the backend server is running and try again.');
    } finally {
        btnText.hidden = false;
        btnLoader.hidden = true;
        generateBtn.disabled = false;
    }
});

function displayResults(data) {
    resultsSection.hidden = false;
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    outfitType.textContent = data.clothing_type || 'Unknown';

    const confidence = Math.round((data.confidence || 0.95) * 100);
    confidenceFill.style.width = `${confidence}%`;
    confidenceText.textContent = `${confidence}%`;

    outfitsContainer.innerHTML = '';

    console.log('Number of outfits:', data.outfits ? data.outfits.length : 0);

    if (data.outfits && data.outfits.length > 0) {
        data.outfits.forEach((outfit, index) => {
            console.log(`Creating card ${index + 1}:`, outfit.name);

            const card = document.createElement('div');
            card.className = 'outfit-card';

            const colorsHtml = outfit.colors ? outfit.colors.map(color =>
                `<div class="color-swatch" style="background-color: ${getColorCode(color)}" title="${color}"></div>`
            ).join('') : '';

            const accessoriesHtml = outfit.accessories ? outfit.accessories.map(acc =>
                `<li>${acc}</li>`
            ).join('') : '<li>No specific accessories</li>';

            const ratingStars = outfit.average_rating ? '⭐'.repeat(Math.round(outfit.average_rating)) : '';
            const ratingDisplay = outfit.average_rating ? `<div class="outfit-rating">${ratingStars} ${outfit.average_rating.toFixed(1)}</div>` : '';

            card.innerHTML = `
                <div class="outfit-header">
                    <h4 class="outfit-title">${outfit.name || `Option ${index + 1}`}</h4>
                    ${ratingDisplay}
                    <p class="outfit-description">${outfit.description || ''}</p>
                </div>
                
                <div class="outfit-section">
                    <p class="outfit-description" style="margin-bottom: 16px;">${outfit.reasoning || ''}</p>
                </div>

                <div class="outfit-section">
                    <div class="outfit-section-title">
                        <span>👔</span> Key Items
                    </div>
                    <ul class="items-list">
                        ${outfit.items ? outfit.items.map(item => `<li class="item-badge">${item}</li>`).join('') : ''}
                    </ul>
                    
                    <div class="shopping-container">
                        ${outfit.shopping_links ? outfit.shopping_links.map(linkObj => `
                            <div class="shopping-item">
                                <span class="shopping-item-name">${linkObj.item}</span>
                                <div class="shopping-buttons">
                                    <a href="${linkObj.links.amazon}" target="_blank" class="btn-shop btn-amazon" rel="noopener noreferrer">
                                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                            <path d="M14.12 17.09c-2.62 1.93-6.43 2.96-9.71 2.96-4.59 0-8.73-1.7-11.86-4.52-.25-.22-.02-.53.27-.36 3.45 2.01 7.71 3.22 12.12 3.22 2.97 0 6.24-.62 9.25-1.9.45-.19.83.3.4.6zm1.09-1.24c-.34-.43-2.23-.21-3.08-.1-.26.03-.3-.19-.07-.36 1.51-1.06 3.99-.75 4.28-.4.29.36-.08 2.85-1.5 4.04-.22.18-.43.09-.33-.16.32-.8 1.04-2.59.7-3.02z"/>
                                            <path d="M13.52 9.09c0 .74.02 1.36-.35 2.02-.3.54-.78.87-1.31.87-.73 0-1.16-.55-1.16-1.37 0-1.61 1.45-1.91 2.82-1.91v.39zm1.74 4.22c-.11.1-.28.11-.41.04-.58-.48-.68-.7-1-1.16-.95.97-1.63 1.27-2.86 1.27-1.46 0-2.6-.9-2.6-2.71 0-1.41.76-2.37 1.85-2.84 .94-.42 2.25-.49 3.25-.61v-.23c0-.43.03-.94-.22-1.31-.22-.33-.63-.47-.99-.47-.67 0-1.27.35-1.42 1.06-.03.16-.15.31-.31.32l-1.68-.18c-.15-.03-.31-.15-.27-.37.4-2.11 2.31-2.75 4.02-2.75.87 0 2.01.23 2.7.89.87.82.79 1.91.79 3.1v2.81c0 .84.35 1.21.68 1.67.12.16.14.35-.01.47-.37.31-.99.85-1.34 1.16l-.02-.02z"/>
                                        </svg>
                                        Amazon
                                    </a>
                                    <a href="${linkObj.links.flipkart}" target="_blank" class="btn-shop btn-flipkart" rel="noopener noreferrer">
                                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                            <path d="M3.833 5.333h3.334v13.334H3.833V5.333zm13.334 0H20.5v13.334h-3.333V5.333zM10.5 2h3v20h-3V2z"/>
                                            <path d="M8.5 8.5h7v7h-7v-7z" fill="#FFD700"/>
                                        </svg>
                                        Flipkart
                                    </a>
                                    <a href="${linkObj.links.meesho}" target="_blank" class="btn-shop btn-meesho" rel="noopener noreferrer">
                                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
                                            <circle cx="12" cy="13" r="4"/>
                                        </svg>
                                        Meesho
                                    </a>
                                </div>
                            </div>
                        `).join('') : '<p>No shopping links available</p>'}
                    </div>
                </div>

                <div class="outfit-section">
                    <div class="outfit-section-title">
                        <span>🎨</span> Palette
                    </div>
                    <div class="color-palette">
                        ${colorsHtml}
                    </div>
                </div>

                <div class="outfit-section">
                    <div class="outfit-section-title">
                        <span>✨</span> Accessories
                    </div>
                    <ul class="recommendation-list">
                        ${accessoriesHtml}
                    </ul>
                </div>

                <div class="outfit-section">
                    <div class="outfit-section-title">
                        <span>👟</span> Footwear
                    </div>
                    <p style="color: var(--color-text); font-size: 14px;">${outfit.footwear || 'Not specified'}</p>
                </div>
            `;

            outfitsContainer.appendChild(card);
            console.log(`Card ${index + 1} appended to container`);
        });

        console.log('Total cards in container:', outfitsContainer.children.length);
    } else {
        outfitsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No specific outfits generated. Please try again.</p>';
    }

    const styleTipsList = document.getElementById('styleTipsList');
    if (data.style_tips && data.style_tips.length > 0) {
        styleTipsList.innerHTML = data.style_tips.map(tip => `<li>${tip}</li>`).join('');
    } else {
        styleTipsList.innerHTML = '<li>Keep your look fresh and confident</li><li>Coordinate colors for a cohesive appearance</li>';
    }
}

function getColorCode(colorName) {
    const colorMap = {
        'Black': '#000000',
        'White': '#FFFFFF',
        'Gray': '#808080',
        'Grey': '#808080',
        'Beige': '#F5F5DC',
        'Cream': '#FFFDD0',
        'Ivory': '#FFFFF0',
        'Tan': '#D2B48C',
        'Brown': '#8B4513',
        'Camel': '#C19A6B',
        'Navy': '#000080',
        'Navy Blue': '#000080',
        'Royal Blue': '#4169E1',
        'Sky Blue': '#87CEEB',
        'Light Blue': '#ADD8E6',
        'Turquoise': '#40E0D0',
        'Teal': '#008080',
        'Cobalt': '#0047AB',
        'Red': '#FF0000',
        'Burgundy': '#800020',
        'Maroon': '#800000',
        'Wine': '#722F37',
        'Pink': '#FFC0CB',
        'Hot Pink': '#FF69B4',
        'Rose': '#FF007F',
        'Coral': '#FF7F50',
        'Green': '#008000',
        'Olive': '#808000',
        'Emerald': '#50C878',
        'Forest Green': '#228B22',
        'Sage': '#BCB88A',
        'Mint': '#98FF98',
        'Lime': '#00FF00',
        'Yellow': '#FFFF00',
        'Gold': '#FFD700',
        'Mustard': '#FFDB58',
        'Orange': '#FFA500',
        'Burnt Orange': '#CC5500',
        'Peach': '#FFE5B4',
        'Purple': '#800080',
        'Lavender': '#E6E6FA',
        'Plum': '#DDA0DD',
        'Violet': '#8F00FF',
        'Mauve': '#E0B0FF',
        'Silver': '#C0C0C0',
        'Champagne': '#F7E7CE',
        'Blush': '#DE5D83',
        'Charcoal': '#36454F',
        'Floral Print': '#FFB6C1',
        'Denim Blue': '#1560BD',
        'Khaki': '#C3B091',
        'Blue': '#0000FF'
    };
    return colorMap[colorName] || '#808080';
}

tryAnotherBtn.addEventListener('click', () => {
    uploadedImage = null;
    imageInput.value = '';
    uploadPlaceholder.hidden = false;
    imageCanvas.hidden = true;
    resultsSection.hidden = true;
    generateBtn.disabled = true;
    document.getElementById('styler').scrollIntoView({ behavior: 'smooth' });
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            this.classList.add('active');
        }
    });
});

window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + 100;
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
});

/**
 * Authentication Module for AI Fashion Stylist Pro Frontend
 * Handles JWT tokens, login, registration, magic links, and user state
 */

const API_URL = 'https://ai-fashion-stylist-pro-production.up.railway.app';
const TOKEN_KEY = 'fashion_stylist_token';
const USER_KEY = 'fashion_stylist_user';

// ============================================
// TOKEN MANAGEMENT
// ============================================

export function saveToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
}

export function isTokenValid() {
    const token = getToken();
    if (!token) return false;

    try {
        const parts = token.split('.');
        if (parts.length !== 3) return false;
        
        const payload = JSON.parse(atob(parts[1]));
        return payload.exp * 1000 > Date.now();
    } catch {
        return false;
    }
}

// ============================================
// USER MANAGEMENT
// ============================================

export function saveUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser() {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
}

export function clearUser() {
    localStorage.removeItem(USER_KEY);
}

export function logout() {
    clearToken();
    clearUser();
    triggerAuthStateChange();
    window.location.href = '/';
}

export function isLoggedIn() {
    return isTokenValid() && getUser() !== null;
}

// ============================================
// API REQUESTS WITH AUTHENTICATION
// ============================================

export async function authenticatedFetch(endpoint, options = {}) {
    const token = getToken();
    
    if (!token) {
        throw new Error('No authentication token found');
    }

    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });

    if (response.status === 401) {
        clearToken();
        clearUser();
        triggerAuthStateChange();
        window.location.href = '/login';
        throw new Error('Session expired. Please log in again.');
    }

    return response;
}

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

export async function register(email, password, profile = {}) {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email,
            password,
            profile: {
                body_type: profile.body_type || 'regular',
                lifestyle: profile.lifestyle || 'mixed',
                budget_preference: profile.budget_preference || 'medium',
                age_group: profile.age_group || 'adult',
                ...profile
            }
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
    }

    const data = await response.json();
    
    if (data.token) {
        saveToken(data.token);
        saveUser(data.user);
        triggerAuthStateChange();
    }

    return data;
}

export async function login(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    
    if (data.token) {
        saveToken(data.token);
        saveUser(data.user);
        triggerAuthStateChange();
    }

    return data;
}

export async function requestMagicLink(email) {
    const response = await fetch(`${API_URL}/auth/magic-link`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send magic link');
    }

    return await response.json();
}

export async function verifyMagicLink(token) {
    const response = await fetch(`${API_URL}/auth/verify-magic`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Invalid or expired magic link');
    }

    const data = await response.json();
    
    if (data.token) {
        saveToken(data.token);
        saveUser(data.user);
        triggerAuthStateChange();
    }

    return data;
}

export async function getCurrentUser() {
    const response = await authenticatedFetch('/auth/me');

    if (!response.ok) {
        throw new Error('Failed to fetch user data');
    }

    const data = await response.json();
    saveUser(data.user);
    return data.user;
}

export async function updateProfile(profileData) {
    const response = await authenticatedFetch('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ profile: profileData })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
    }

    const data = await response.json();
    saveUser(data.user);
    return data.user;
}

// ============================================
// WARDROBE ENDPOINTS
// ============================================

export async function getWardrobeItems(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.occasion) params.append('occasion', filters.occasion);
    if (filters.owned !== undefined) params.append('owned', filters.owned);

    const response = await authenticatedFetch(
        `/wardrobe/items?${params.toString()}`
    );

    if (!response.ok) {
        throw new Error('Failed to fetch wardrobe items');
    }

    return await response.json();
}

export async function addWardrobeItem(itemData) {
    const response = await authenticatedFetch('/wardrobe/add', {
        method: 'POST',
        body: JSON.stringify(itemData)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add item');
    }

    return await response.json();
}

export async function markItemOwned(itemId, owned = true) {
    const response = await authenticatedFetch(
        `/wardrobe/mark-owned/${itemId}`,
        {
            method: 'PUT',
            body: JSON.stringify({ owned })
        }
    );

    if (!response.ok) {
        throw new Error('Failed to update item');
    }

    return await response.json();
}

export async function removeWardrobeItem(itemId) {
    const response = await authenticatedFetch(
        `/wardrobe/remove/${itemId}`,
        {
            method: 'DELETE'
        }
    );

    if (!response.ok) {
        throw new Error('Failed to remove item');
    }

    return await response.json();
}

export async function getWardrobeStats() {
    const response = await authenticatedFetch('/wardrobe/stats');

    if (!response.ok) {
        throw new Error('Failed to fetch wardrobe statistics');
    }

    return await response.json();
}

// ============================================
// INSIGHTS ENDPOINTS
// ============================================

export async function getWardrobeGaps() {
    const response = await authenticatedFetch('/insights/gaps');

    if (!response.ok) {
        throw new Error('Failed to fetch wardrobe gaps');
    }

    return await response.json();
}

export async function getWardrobeBalance() {
    const response = await authenticatedFetch('/insights/balance');

    if (!response.ok) {
        throw new Error('Failed to fetch balance metrics');
    }

    return await response.json();
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function getUserProfile() {
    const user = getUser();
    return user?.profile || {
        body_type: 'regular',
        lifestyle: 'mixed',
        budget_preference: 'medium',
        age_group: 'adult'
    };
}

export function triggerAuthStateChange() {
    window.dispatchEvent(new CustomEvent('authStateChanged', {
        detail: {
            isLoggedIn: isLoggedIn(),
            user: getUser()
        }
    }));
}

export function ensureAuthenticated() {
    if (!isLoggedIn()) {
        window.location.href = '/login';
        return false;
    }
    return true;
}

export function ensureNotAuthenticated() {
    if (isLoggedIn()) {
        window.location.href = '/dashboard';
        return false;
    }
    return true;
}
