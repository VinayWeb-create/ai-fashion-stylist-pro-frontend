// =================================
// Global Variables
// =================================
let uploadedImage = null;
const API_URL =
  'https://ai-fashion-stylist-pro-production.up.railway.app/predict';

// =================================
// DOM Elements
// =================================
const imageInput = document.getElementById('imageInput');
const uploadArea = document.getElementById('uploadArea');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');
const imageCanvas = document.getElementById('imageCanvas');
const generateBtn = document.getElementById('generateBtn');
const resultsSection = document.getElementById('resultsSection');
const tryAnotherBtn = document.getElementById('tryAnotherBtn');

// Form elements
const occasionSelect = document.getElementById('occasion');
const climateSelect = document.getElementById('climate');
const clothingStyleSelect = document.getElementById('clothingStyle');
const detectFaceCheckbox = document.getElementById('detectFace');
const colorPreferencesInput = document.getElementById('colorPreferences');
const budgetRangeSelect = document.getElementById('budgetRange');
const brandPreferencesInput = document.getElementById('brandPreferences');
const styleTagsInput = document.getElementById('styleTags');
const seasonPreferenceSelect = document.getElementById('seasonPreference');

// Result elements
const outfitType = document.getElementById('outfitType');
const confidenceFill = document.getElementById('confidenceFill');
const confidenceText = document.getElementById('confidenceText');
const styleCategory = document.getElementById('styleCategory');
const clothingStyleBadge = document.getElementById('clothingStyleBadge');
const colorSwatches = document.getElementById('colorSwatches');
const colorList = document.getElementById('colorList');
const accessoriesList = document.getElementById('accessoriesList');
const footwearList = document.getElementById('footwearList');

// New recommendation elements
const hairStylesList = document.getElementById('hairStylesList');
const makeupList = document.getElementById('makeupList');
const patternsList = document.getElementById('patternsList');
const styleTipsList = document.getElementById('styleTipsList');
const faceDetectionCard = document.getElementById('faceDetectionCard');
const skinTone = document.getElementById('skinTone');
const colorNote = document.getElementById('colorNote');

// =================================
// Image Upload Handling
// =================================
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

// =================================
// Generate Style Recommendations
// =================================
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
        formData.append('climate', climateSelect.value);
        formData.append('clothing_style', clothingStyleSelect.value);
        formData.append('detect_face', detectFaceCheckbox.checked ? 'true' : 'false');
        
        if (colorPreferencesInput && colorPreferencesInput.value.trim()) {
            formData.append('color_preferences', colorPreferencesInput.value.trim());
        }
        
        if (budgetRangeSelect && budgetRangeSelect.value) {
            formData.append('budget_range', budgetRangeSelect.value);
        }
        
        if (brandPreferencesInput && brandPreferencesInput.value.trim()) {
            formData.append('brand_preferences', brandPreferencesInput.value.trim());
        }
        
        if (styleTagsInput && styleTagsInput.value.trim()) {
            formData.append('style_tags', styleTagsInput.value.trim());
        }
        
        if (seasonPreferenceSelect && seasonPreferenceSelect.value) {
            formData.append('season_preference', seasonPreferenceSelect.value);
        }

        const response = await fetch(API_URL, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

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

// =================================
// Display Results
// =================================
function displayResults(data) {
    resultsSection.hidden = false;

    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    outfitType.textContent = data.clothing_type || 'Unknown';

    const confidence = Math.round((data.confidence || 0.95) * 100);
    confidenceFill.style.width = `${confidence}%`;
    confidenceText.textContent = `${confidence}%`;

    outfitsContainer.innerHTML = '';

    if (data.outfits && data.outfits.length > 0) {
        data.outfits.forEach((outfit, index) => {
            const card = document.createElement('div');
            card.className = 'outfit-card';
            card.style.animationDelay = `${index * 0.2}s`;
            card.className += ' feature-card';

            const itemsHtml = outfit.items ? outfit.items.map(item =>
                `<li class="item-badge">${item}</li>`
            ).join('') : '';

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
                        <span>👔</span> Key Items & Shopping Links
                    </div>
                    <ul class="items-list">
                        ${outfit.items ? outfit.items.map(item => `<li class="item-badge">${item}</li>`).join('') : ''}
                    </ul>
                    
                    <div class="shopping-container">
                        ${outfit.shopping_links ? outfit.shopping_links.map(linkObj => `
                            <div class="shopping-item">
                                <span class="shopping-item-name">${linkObj.item}</span>
                                <div class="shopping-buttons">
                                    <a href="${linkObj.links.amazon}" target="_blank" class="btn-shop btn-amazon">Amazon</a>
                                    <a href="${linkObj.links.flipkart}" target="_blank" class="btn-shop btn-flipkart">Flipkart</a>
                                    <a href="${linkObj.links.meesho}" target="_blank" class="btn-shop btn-meesho">Meesho</a>
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

            observer.observe(card);
        });
    } else {
        outfitsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No specific outfits generated. Please try again.</p>';
    }

    if (data.face_detection && data.face_detection.detected) {
        faceDetectionCard.hidden = false;
        skinTone.textContent = data.face_detection.skin_tone || 'Not detected';
        colorNote.textContent = data.face_detection.description || 'Analysis complete';
    } else {
        faceDetectionCard.hidden = true;
    }
}

// =================================
// Helper: Get Color Code
// =================================
function getColorCode(colorName) {
    const colorMap = {
        'Black': '#000000',
        'White': '#FFFFFF',
        'Gray': '#808080',
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
        'Khaki': '#C3B091'
    };

    return colorMap[colorName] || '#808080';
}

// =================================
// Try Another Button
// =================================
tryAnotherBtn.addEventListener('click', () => {
    uploadedImage = null;
    imageInput.value = '';
    uploadPlaceholder.hidden = false;
    imageCanvas.hidden = true;
    resultsSection.hidden = true;
    generateBtn.disabled = true;
    faceDetectionCard.hidden = true;

    document.getElementById('styler').scrollIntoView({ behavior: 'smooth' });
});

// =================================
// Smooth Scroll for Navigation
// =================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            this.classList.add('active');
        }
    });
});

// =================================
// Intersection Observer for Animations
// =================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.feature-card, .recommendation-card, .tech-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
});

// =================================
// Active Navigation Highlighting
// =================================
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
