


// Toast Notification System
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = '✨';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';

    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.5s ease-in forwards';
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

function createToastContainer() {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
}

import * as Auth from './auth.js';

// ============================================================================
// GLOBAL VARIABLES
// ============================================================================

let uploadedImage = null;
let currentPrediction = null;
const API_URL = 'https://ai-fashion-stylist-pro-production.up.railway.app/predict';

// ============================================================================
// DOM ELEMENT REFERENCES
// ============================================================================

// Image Upload Elements
const imageInput = document.getElementById('imageInput');
const uploadArea = document.getElementById('uploadArea');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');
const imageCanvas = document.getElementById('imageCanvas');
const generateBtn = document.getElementById('generateBtn');
const resultsSection = document.getElementById('resultsSection');
const tryAnotherBtn = document.getElementById('tryAnotherBtn');

// DOM Elements
const themeToggle = document.getElementById('themeToggle');
const sunIcon = document.querySelector('.sun-icon');
const moonIcon = document.querySelector('.moon-icon');

// Initialize Theme
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcons(savedTheme);
}

function updateThemeIcons(theme) {
    if (theme === 'dark') {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    }
}

themeToggle?.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcons(newTheme);
});

initTheme();

function initApp() {
    setupNavigation();
    setupImageUpload();
    setupFormValidation();
    initAuthUI();

    // Add Scroll Reveal Animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.feature-card, .testimonial-card, .section-header').forEach(el => {
        observer.observe(el);
    });
}
// Form Elements
const occasionSelect = document.getElementById('occasion');
const occasionSubtypeSelect = document.getElementById('occasionSubtype');
const occasionSubtypeGroup = document.getElementById('occasionSubtypeGroup');
const climateSelect = document.getElementById('climate');
const clothingStyleSelect = document.getElementById('clothingStyle');
const bodyTypeSelect = document.getElementById('bodyType');
const budgetSelect = document.getElementById('budget');
const detectFaceCheckbox = document.getElementById('detectFace');

// Results Elements
const outfitType = document.getElementById('outfitType');
const confidenceFill = document.getElementById('confidenceFill');
const confidenceText = document.getElementById('confidenceText');
const outfitsContainer = document.getElementById('outfitsContainer');

// ============================================================================
// OCCASION SUBTYPES MAPPING
// ============================================================================

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

// ============================================================================
// COLOR MAPPING
// ============================================================================

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

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getColorCode(colorName) {
    return colorMap[colorName] || '#808080';
}

// ============================================================================
// AUTHENTICATION UI INITIALIZATION
// ============================================================================

function initAuthUI() {
    const authNav = document.getElementById('authNav');
    const userNav = document.getElementById('userNav');
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    const logoutBtn = document.getElementById('logoutBtn');
    const userInitial = document.getElementById('userInitial');

    function initAuthUI() {
    const authNav = document.getElementById('authNav');
    const userNav = document.getElementById('userNav');
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    const logoutBtn = document.getElementById('logoutBtn');

    const avatarSmall = document.getElementById("userAvatarImg");
    const avatarLarge = document.getElementById("userAvatarLarge");
    const userNameText = document.getElementById("userNameText");

    function updateAuthUI() {
        if (Auth.isLoggedIn()) {
            const user = Auth.getUser();

            if (authNav) authNav.hidden = true;
            if (userNav) userNav.hidden = false;

            if(user){
                const name = user.name || user.email || "User";

                if(userNameText) userNameText.innerText = name;

                const avatarUrl =
                user.profile_pic ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=111&color=fff`;

                if(avatarSmall) avatarSmall.src = avatarUrl;
                if(avatarLarge) avatarLarge.src = avatarUrl;
            }

        } else {
            if (authNav) authNav.hidden = false;
            if (userNav) userNav.hidden = true;
            if (userDropdown) userDropdown.hidden = true;
        }
    }

    // dropdown
    userMenuBtn?.addEventListener('click', (e)=>{
        e.stopPropagation();
        userDropdown.hidden = !userDropdown.hidden;
    });

    // outside click close
    document.addEventListener("click",()=>{
        if(userDropdown) userDropdown.hidden=true;
    });

    // logout
    logoutBtn?.addEventListener("click", ()=>{
        if(confirm("Logout?")){
            Auth.logout();
            location.reload();
        }
    });

    window.addEventListener("authStateChanged", updateAuthUI);
    updateAuthUI();
}


// ============================================================================
// OCCASION SUBTYPE HANDLING
// ============================================================================

function setupOccasionSubtypes() {
    occasionSelect?.addEventListener('change', () => {
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
            if (occasionSubtypeGroup) occasionSubtypeGroup.hidden = false;
        } else {
            if (occasionSubtypeGroup) occasionSubtypeGroup.hidden = true;
        }
    });

    if (occasionSelect) occasionSelect.dispatchEvent(new Event('change'));
}

// ============================================================================
// IMAGE UPLOAD HANDLING
// ============================================================================

function setupImageUpload() {
    uploadArea?.addEventListener('click', () => {
        imageInput?.click();
    });

    uploadArea?.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (uploadArea) {
            uploadArea.style.borderColor = 'var(--color-secondary)';
            uploadArea.style.background = 'rgba(139, 115, 85, 0.1)';
        }
    });

    uploadArea?.addEventListener('dragleave', () => {
        if (uploadArea) {
            uploadArea.style.borderColor = 'var(--color-border)';
            uploadArea.style.background = 'var(--color-surface)';
        }
    });

    uploadArea?.addEventListener('drop', (e) => {
        e.preventDefault();
        if (uploadArea) {
            uploadArea.style.borderColor = 'var(--color-border)';
            uploadArea.style.background = 'var(--color-surface)';
        }
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageUpload(file);
        } else {
            alert('Please drop an image file');
        }
    });

    imageInput?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImageUpload(file);
        }
    });
}

function handleImageUpload(file) {
    if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const ctx = imageCanvas?.getContext('2d');
            if (!ctx || !uploadArea) return;

            const maxWidth = uploadArea.clientWidth - 80;
            const maxHeight = 400;

            let width = img.width;
            let height = img.height;

            // Scale image proportionally
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

            if (uploadPlaceholder) uploadPlaceholder.hidden = true;
            if (imageCanvas) imageCanvas.hidden = false;

            uploadedImage = file;
            if (generateBtn) generateBtn.disabled = false;
            if (resultsSection) resultsSection.hidden = true;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// ============================================================================
// API COMMUNICATION
// ============================================================================

async function getAIRecommendation(formData) {
    try {
        // Add authentication token if user is logged in
        const headers = {};
        if (Auth.isLoggedIn()) {
            const token = Auth.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        const response = await fetch(API_URL, {
            method: 'POST',
            body: formData,
            headers: headers
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Server error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.status === 'success' && data.prediction) {
            displayResults(data.prediction);
        } else {
            throw new Error(data.message || 'Failed to generate recommendations');
        }

    } catch (error) {
        console.error('API Error:', error);
        alert(`Error: ${error.message}\n\nPlease check:\n1. Backend server is running\n2. API URL is correct: ${API_URL}\n3. Internet connection is stable`);
        throw error;
    }
}

// ============================================================================
// PREDICTION & RESULTS
// ============================================================================

function setupPrediction() {
    generateBtn?.addEventListener('click', async () => {
        if (!uploadedImage) {
            alert('Please upload an image first');
            return;
        }

        const btnText = generateBtn?.querySelector('.btn-text');
        const btnLoader = generateBtn?.querySelector('.btn-loader');

        if (btnText) btnText.hidden = true;
        if (btnLoader) btnLoader.hidden = false;
        if (generateBtn) generateBtn.disabled = true;

        try {
            const formData = new FormData();
            formData.append('image', uploadedImage);
            formData.append('occasion', occasionSelect?.value || 'casual');
            formData.append('occasion_subtype', occasionSubtypeSelect?.value || '');
            formData.append('climate', climateSelect?.value || 'moderate');
            formData.append('clothing_style', clothingStyleSelect?.value || 'unisex');
            formData.append('body_type', bodyTypeSelect?.value || 'regular');
            formData.append('budget', budgetSelect?.value || 'medium');
            formData.append('detect_face', detectFaceCheckbox?.checked || false);

            await getAIRecommendation(formData);

        } catch (error) {
            alert('Error generating recommendations. Please try again.');
        } finally {
            if (btnText) btnText.hidden = false;
            if (btnLoader) btnLoader.hidden = true;
            if (generateBtn) generateBtn.disabled = false;
        }
    });
}

function displayResults(data) {
    if (!resultsSection) return;

    resultsSection.hidden = false;
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Display detected item type
    if (outfitType) outfitType.textContent = data.clothing_type || 'Unknown';

    // Display confidence
    const confidence = Math.round((data.confidence || 0.95) * 100);
    if (confidenceFill) confidenceFill.style.width = `${confidence}%`;
    if (confidenceText) confidenceText.textContent = `${confidence}%`;

    // Clear previous results
    if (outfitsContainer) outfitsContainer.innerHTML = '';

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

            const saveBtn = Auth.isLoggedIn() ?
                `<button class="btn btn-secondary save-outfit-btn" data-outfit-index="${index}" style="margin-top: 16px; width: 100%;">
                    ➕ Save to Wardrobe
                </button>` :
                `<button class="btn btn-secondary" style="margin-top: 16px; width: 100%; opacity: 0.6; cursor: not-allowed;" disabled>
                    🔒 Login to Save
                </button>`;

            card.innerHTML = `
                <div class="outfit-header">
                    <h4 class="outfit-title">${outfit.name || `Option ${index + 1}`}</h4>
                    ${ratingDisplay}
                    <div class="outfit-tagline">Why this works:</div>
                    <p class="outfit-description">${outfit.reasoning || 'Perfectly matched to your preferences and selected occasion.'}</p>
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
                                        <svg viewBox="0 0 24 24" fill="currentColor" style="width: 16px; height: 16px;">
                                            <path d="M14.12 17.09c-2.62 1.93-6.43 2.96-9.71 2.96-4.59 0-8.73-1.7-11.86-4.52-.25-.22-.02-.53.27-.36 3.45 2.01 7.71 3.22 12.12 3.22 2.97 0 6.24-.62 9.25-1.9.45-.19.83.3.4.6zm1.09-1.24c-.34-.43-2.23-.21-3.08-.1-.26.03-.3-.19-.07-.36 1.51-1.06 3.99-.75 4.28-.4.29.36-.08 2.85-1.5 4.04-.22.18-.43.09-.33-.16.32-.8 1.04-2.59.7-3.02z"/>
                                            <path d="M13.52 9.09c0 .74.02 1.36-.35 2.02-.3.54-.78.87-1.31.87-.73 0-1.16-.55-1.16-1.37 0-1.61 1.45-1.91 2.82-1.91v.39zm1.74 4.22c-.11.1-.28.11-.41.04-.58-.48-.68-.7-1-1.16-.95.97-1.63 1.27-2.86 1.27-1.46 0-2.6-.9-2.6-2.71 0-1.41.76-2.37 1.85-2.84 .94-.42 2.25-.49 3.25-.61v-.23c0-.43.03-.94-.22-1.31-.22-.33-.63-.47-.99-.47-.67 0-1.27.35-1.42 1.06-.03.16-.15.31-.31.32l-1.68-.18c-.15-.03-.31-.15-.27-.37.4-2.11 2.31-2.75 4.02-2.75.87 0 2.01.23 2.7.89.87.82.79 1.91.79 3.1v2.81c0 .84.35 1.21.68 1.67.12.16.14.35-.01.47-.37.31-.99.85-1.34 1.16l-.02-.02z"/>
                                        </svg>
                                        Amazon
                                    </a>
                                    <a href="${linkObj.links.flipkart}" target="_blank" class="btn-shop btn-flipkart" rel="noopener noreferrer">
                                        <svg viewBox="0 0 24 24" fill="currentColor" style="width: 16px; height: 16px;">
                                            <path d="M3.833 5.333h3.334v13.334H3.833V5.333zm13.334 0H20.5v13.334h-3.333V5.333zM10.5 2h3v20h-3V2z"/>
                                            <path d="M8.5 8.5h7v7h-7v-7z" fill="#FFD700"/>
                                        </svg>
                                        Flipkart
                                    </a>
                                    <a href="${linkObj.links.meesho}" target="_blank" class="btn-shop btn-meesho" rel="noopener noreferrer">
                                        <svg viewBox="0 0 24 24" fill="currentColor" style="width: 16px; height: 16px;">
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
                        <span>🎨</span> Color Palette
                    </div>
                    <div class="color-palette">
                        ${colorsHtml || '<p>No color data available</p>'}
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

                ${saveBtn}
            `;

            outfitsContainer.appendChild(card);
            console.log(`Card ${index + 1} appended to container`);
        });

        // Add event listeners to save buttons
        document.querySelectorAll('.save-outfit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.outfitIndex);
                saveOutfitToWardrobe(data.outfits[index]);
            });
        });

        console.log('Total cards in container:', outfitsContainer.children.length);
    } else {
        if (outfitsContainer) {
            outfitsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--color-text-muted);">No specific outfits generated. Please try again.</p>';
        }
    }

    // Display style tips
    const styleTipsList = document.getElementById('styleTipsList');
    if (styleTipsList) {
        if (data.style_tips && data.style_tips.length > 0) {
            styleTipsList.innerHTML = data.style_tips.map(tip => `<li>${tip}</li>`).join('');
        } else {
            styleTipsList.innerHTML = `
                <li>Keep your look fresh and confident</li>
                <li>Coordinate colors for a cohesive appearance</li>
                <li>Pay attention to fabric quality and fit</li>
                <li>Accessorize appropriately for the occasion</li>
            `;
        }
    }

    // Display face detection results if available
    const faceDetectionCard = document.getElementById('faceDetectionCard');
    if (faceDetectionCard) {
        if (data.skin_tone) {
            faceDetectionCard.hidden = false;
            const skinToneEl = document.getElementById('skinTone');
            const colorNoteEl = document.getElementById('colorNote');
            if (skinToneEl) skinToneEl.textContent = data.skin_tone;
            if (colorNoteEl) colorNoteEl.textContent = `Colors that complement your ${data.skin_tone} skin tone`;
        } else {
            faceDetectionCard.hidden = true;
        }
    }
}

// ============================================================================
// WARDROBE INTEGRATION
// ============================================================================

async function saveOutfitToWardrobe(outfit) {
    if (!Auth.isLoggedIn()) {
        if (confirm('You need to log in to save items to your wardrobe. Go to login page?')) {
            window.location.href = '/login.html';
        }
        return;
    }

    try {
        // Prompt for optional tags
        const tagsInput = prompt('Add optional tags (e.g. favorite, summer, office) separated by commas:', '');
        const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];

        const occasion = document.getElementById('occasion')?.value || 'casual';
        const climate = document.getElementById('climate')?.value || 'moderate';

        const itemData = {
            name: outfit.name,
            category: 'top', // Default, could be derived from detected type
            colors: outfit.colors || [],
            occasions: [occasion],
            season: [climate], // Mapping climate to season for now
            tags: tags,
            owned: false,
            brand: outfit.brands ? outfit.brands[0] : '',
            shopping_links: outfit.shopping_links && outfit.shopping_links[0] ? outfit.shopping_links[0].links : {},
            outfit_id: outfit.id || ''
        };

        const result = await Auth.addWardrobeItem(itemData);

        if (result.status === 'success') {
            showToast('Item added to your wardrobe with tags: ' + (tags.join(', ') || 'none'));
        } else {
            showToast('Failed to add: ' + (result.message || 'Error'), 'error');
        }
    } catch (error) {
        alert('Error saving to wardrobe: ' + error.message);
    }
}

// ============================================================================
// TRY ANOTHER OUTFIT
// ============================================================================

function setupTryAnother() {
    tryAnotherBtn?.addEventListener('click', () => {
        uploadedImage = null;
        if (imageInput) imageInput.value = '';
        if (uploadPlaceholder) uploadPlaceholder.hidden = false;
        if (imageCanvas) imageCanvas.hidden = true;
        if (resultsSection) resultsSection.hidden = true;
        if (generateBtn) generateBtn.disabled = true;

        const stylerSection = document.getElementById('styler');
        if (stylerSection) {
            stylerSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// ============================================================================
// NAVIGATION
// ============================================================================

function setupNavigation() {
    // Smooth scroll to sections
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

    // Update active nav link on scroll
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
}

// ============================================================================
// PAGE INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Fashion Stylist App...');

    // Initialize auth UI first
    initAuthUI();

    // Setup all components
    setupOccasionSubtypes();
    setupImageUpload();
    setupPrediction();
    setupTryAnother();
    setupNavigation();

    console.log('✅ Fashion Stylist App Initialized Successfully');
});

// ============================================================================
// EXPORTS
// ============================================================================

export { initAuthUI };
