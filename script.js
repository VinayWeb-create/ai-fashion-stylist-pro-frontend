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
const climateSelect = document.getElementById('climate');
const clothingStyleSelect = document.getElementById('clothingStyle');

const outfitType = document.getElementById('outfitType');
const confidenceFill = document.getElementById('confidenceFill');
const confidenceText = document.getElementById('confidenceText');
const outfitsContainer = document.getElementById('outfitsContainer');

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
        formData.append('climate', climateSelect.value);
        formData.append('clothing_style', clothingStyleSelect.value);

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

