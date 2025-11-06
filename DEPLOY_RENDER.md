# Deploy to Render - Step by Step Guide

## Prerequisites
1. GitHub account (or GitLab/Bitbucket)
2. Render account (free at https://render.com)
3. Your code pushed to a Git repository

## Step 1: Push Your Code to GitHub

1. **Create a new repository on GitHub:**
   - Go to: https://github.com/new
   - Name it: `twilio-browser-softphone`
   - Make it **Public** (for free Render tier)
   - Click "Create repository"

2. **Push your code to GitHub:**
   ```powershell
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/twilio-browser-softphone.git
   git push -u origin main
   ```

## Step 2: Create Render Account

1. Go to: https://render.com
2. Sign up with GitHub (recommended)
3. Connect your GitHub account

## Step 3: Deploy on Render

1. **Click "New +" → "Web Service"**

2. **Connect your repository:**
   - Select your GitHub account
   - Find and select `twilio-browser-softphone`
   - Click "Connect"

3. **Configure the service:**
   - **Name:** `twilio-browser-softphone` (or any name you like)
   - **Environment:** `Node`
   - **Region:** Choose closest to you
   - **Branch:** `main`
   - **Root Directory:** (leave empty)
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** `Free` (or paid if you prefer)

4. **Add Environment Variables:**
   Click "Advanced" → "Add Environment Variable" and add:
   ```
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_API_KEY_SID=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_API_KEY_SECRET=your_api_key_secret_here
   TWIML_APP_SID=APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_PHONE_NUMBER=+19795895651
   PORT=10000
   NODE_ENV=production
   ```
   **Important:** Replace with your actual values from `.env` file

5. **Click "Create Web Service"**

6. **Wait for deployment:**
   - Render will build and deploy your app
   - This takes 2-5 minutes
   - You'll see build logs in real-time

7. **Get your public URL:**
   - Once deployed, you'll get a URL like:
     ```
     https://twilio-browser-softphone.onrender.com
     ```
   - **Copy this URL!**

## Step 4: Update TwiML App in Twilio Console

1. **Go to Twilio Console:**
   - https://console.twilio.com/us1/develop/voice/manage/twiml-apps

2. **Click on "Voice AI Testing App"**

3. **Update Voice Configuration:**
   - **Request URL:** `https://twilio-browser-softphone.onrender.com/twiml/outgoing`
   - **Request Method:** `HTTP POST`
   - **Remove any double slashes** (`//`)

4. **Click "Save"**

## Step 5: Test Your Deployment

1. **Test the health endpoint:**
   ```
   https://twilio-browser-softphone.onrender.com/health
   ```
   Should return: `{"status":"ok",...}`

2. **Test the TwiML endpoint:**
   ```
   https://twilio-browser-softphone.onrender.com/twiml/outgoing
   ```
   Should return TwiML XML

3. **Test the token endpoint:**
   ```
   https://twilio-browser-softphone.onrender.com/token
   ```
   Should return: `{"token":"...","identity":"..."}`

4. **Test your browser softphone:**
   - Open: `https://twilio-browser-softphone.onrender.com`
   - Click "Test Token" (should work)
   - Enter phone number: `+19795895651`
   - Click "Call"

## Step 6: Check Server Logs

1. **In Render Dashboard:**
   - Go to your service
   - Click "Logs" tab
   - You should see server logs

2. **When you make a call, you should see:**
   ```
   [REQUEST] POST /twiml/outgoing
   [TwiML] ✅ Outgoing call request received!
   ```

## Troubleshooting

### Build Fails
- Check build logs in Render
- Make sure `package.json` is correct
- Verify all dependencies are listed

### Service Won't Start
- Check logs in Render
- Verify environment variables are set correctly
- Make sure `PORT` is set (Render uses `PORT` env var)

### TwiML Not Working
- Verify TwiML App URL is correct (no double slashes)
- Check Render logs for errors
- Test the endpoint directly in browser

### Environment Variables Not Working
- Make sure you added them in Render dashboard
- Check spelling (case-sensitive)
- Redeploy after adding env vars

## Important Notes

- **Free tier:** Render free tier spins down after 15 minutes of inactivity
- **First request:** May take 30-60 seconds to wake up
- **HTTPS:** Render provides HTTPS automatically
- **Custom domain:** Available on paid plans

## Next Steps

1. ✅ Deploy to Render
2. ✅ Get public URL
3. ✅ Update TwiML App URL
4. ✅ Test the call
5. ✅ Check logs to confirm it works

## Success!

Once deployed, you'll have:
- ✅ Public HTTPS URL (no interstitial pages!)
- ✅ Twilio can reach your server
- ✅ Calls should connect successfully

Good luck! 🚀

