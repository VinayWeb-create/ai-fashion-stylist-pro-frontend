# AI Fashion Stylist Pro - Render Deployment Guide

## Deployment Configuration for Render

### Step 1: Connect Your Git Repository
1. Push your code to GitHub/GitLab
2. Connect your repository to Render

### Step 2: Configure the Web Service

Use these exact settings in the Render deployment form:

**Basic Settings:**
- **Name:** `ai-fashion-stylist-pro`
- **Language:** Python 3
- **Region:** Oregon (US West) - or your preferred region

**Build & Deploy:**
- **Root Directory:** `backend` (IMPORTANT - tells Render to build from backend folder)
- **Build Command:** 
  ```
  pip install -r requirements.txt
  ```
- **Start Command:**
  ```
  gunicorn -w 4 -b 0.0.0.0:$PORT app:app
  ```

**Instance Type:**
- **Free** (for testing) or **Starter** ($7/month for production)
- Free instances spin down after inactivity, which is fine for development

**Environment Variables (Optional):**
- Add these if needed for production:
  - `FLASK_ENV=production`
  - `DEBUG=False`

### Step 3: Deploy

1. Click "Create Web Service"
2. Render will automatically build and deploy
3. You'll get a URL like: `https://ai-fashion-stylist-pro.onrender.com`

### Step 4: Update Frontend API URL

Once deployed, update your frontend to use the Render URL:

In `frontend/script.js`, change:
```javascript
const API_URL = 'https://ai-fashion-stylist-pro.onrender.com/predict';
```

Or use an environment variable for flexibility.

### Step 5: Deploy Frontend

Deploy your frontend separately:
- Use **Render Static Site** for the frontend folder
- Or use **Vercel/Netlify** for better static hosting

### Important Notes:

1. **TensorFlow/Keras**: These are heavy libraries. The deployment may take 5-10 minutes.
2. **Free Tier Limitations**: 
   - Spins down after 15 minutes of inactivity
   - Limited memory (512 MB)
   - No persistent storage
3. **CORS**: Already configured in app.py with `CORS(app)`
4. **Port**: Automatically uses `$PORT` environment variable provided by Render

### Troubleshooting:

- Check logs in Render dashboard if deployment fails
- Ensure all required packages are in `requirements.txt`
- Verify the `Root Directory` is set to `backend`
- Make sure `gunicorn` is in requirements.txt ✓

### Alternative: Docker Deployment

If you want more control, create a `Dockerfile`:

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:$PORT", "app:app"]
```

Then in Render, select "Docker" as the runtime.

---

**Your API will be live at:**
```
https://ai-fashion-stylist-pro.onrender.com/
https://ai-fashion-stylist-pro.onrender.com/predict
https://ai-fashion-stylist-pro.onrender.com/health
```
