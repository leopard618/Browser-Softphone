# Troubleshooting Render Deployment - Call Not Connecting

## Quick Checklist

### ✅ Step 1: Verify TwiML App URL in Twilio Console

1. **Go to Twilio Console:**
   - https://console.twilio.com/us1/develop/voice/manage/twiml-apps

2. **Click on your TwiML App** (e.g., "Voice AI Testing App")

3. **Check the Voice Configuration:**
   - **Request URL** should be: `https://twilio-browser-softphone.onrender.com/twiml/outgoing`
   - **NO double slashes** (`//`) - should be single slash (`/`)
   - **Request Method** should be: `HTTP POST`
   - **Must be HTTPS** (not HTTP)

4. **Click "Save"** even if it looks correct

### ✅ Step 2: Test Your Render Endpoint

1. **Test health endpoint:**
   ```
   https://twilio-browser-softphone.onrender.com/health
   ```
   Should return: `{"status":"ok",...}`

2. **Test TwiML endpoint (GET):**
   ```
   https://twilio-browser-softphone.onrender.com/twiml/outgoing
   ```
   Should return TwiML XML

3. **Test token endpoint:**
   ```
   https://twilio-browser-softphone.onrender.com/token
   ```
   Should return: `{"token":"...","identity":"..."}`

### ✅ Step 3: Check Render Logs

1. **Go to Render Dashboard:**
   - https://dashboard.render.com

2. **Click on your service** (e.g., "twilio-browser-softphone")

3. **Click "Logs" tab**

4. **Make a call from your browser**

5. **Look for these logs:**
   ```
   [REQUEST] POST /twiml/outgoing - ...
   [TwiML] ✅ Outgoing call request received!
   ```

   **If you see these logs:** Twilio IS reaching your server ✅
   **If you DON'T see these logs:** Twilio is NOT reaching your server ❌

### ✅ Step 4: Check Twilio Debugger

1. **Go to Twilio Debugger:**
   - https://console.twilio.com/us1/monitor/debugger/errors

2. **Make a call from your browser**

3. **Refresh the Debugger page**

4. **Look for errors:**
   - "Unable to reach webhook URL"
   - "HTTP 404" or "HTTP 500" errors
   - "TwiML Error"

### ✅ Step 5: Verify Environment Variables in Render

1. **Go to Render Dashboard**
2. **Click on your service**
3. **Click "Environment" tab**
4. **Verify these are set:**
   ```
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_API_KEY_SID=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_API_KEY_SECRET=your_api_key_secret_here
   TWIML_APP_SID=APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_PHONE_NUMBER=+19795895651
   PORT=10000
   NODE_ENV=production
   ```

### ✅ Step 6: Check Render Service Status

1. **Go to Render Dashboard**
2. **Check if service is "Live"** (green status)
3. **If it's "Sleeping"** (free tier), wait 30-60 seconds for first request

## Common Issues & Solutions

### Issue 1: TwiML App URL is Wrong

**Symptoms:**
- No logs in Render when making a call
- Twilio Debugger shows "Unable to reach webhook URL"

**Solution:**
- Double-check TwiML App URL in Twilio Console
- Make sure it's exactly: `https://twilio-browser-softphone.onrender.com/twiml/outgoing`
- No typos, no double slashes
- Click "Save" in Twilio Console

### Issue 2: Render Service is Sleeping (Free Tier)

**Symptoms:**
- First request takes 30-60 seconds
- Service shows "Sleeping" status

**Solution:**
- Wait 30-60 seconds for first request
- Or upgrade to paid plan (always-on)

### Issue 3: Environment Variables Not Set

**Symptoms:**
- Server starts but token generation fails
- Errors in Render logs about missing variables

**Solution:**
- Add all environment variables in Render dashboard
- Redeploy after adding variables

### Issue 4: TwiML App SID Mismatch

**Symptoms:**
- Token works but call doesn't connect
- No TwiML requests in logs

**Solution:**
- Verify `TWIML_APP_SID` in Render matches your TwiML App SID in Twilio Console
- Update if different

### Issue 5: Wrong Endpoint in TwiML App

**Symptoms:**
- Using `/twiml/withstream` but Media Streams server not deployed

**Solution:**
- Use `/twiml/outgoing` for basic calling
- Or deploy Media Streams server separately

## Quick Test Commands

### Test Render Endpoint (PowerShell):
```powershell
# Test health
Invoke-WebRequest -Uri "https://twilio-browser-softphone.onrender.com/health" -UseBasicParsing

# Test TwiML (GET)
Invoke-WebRequest -Uri "https://twilio-browser-softphone.onrender.com/twiml/outgoing" -UseBasicParsing

# Test token
Invoke-WebRequest -Uri "https://twilio-browser-softphone.onrender.com/token" -UseBasicParsing
```

## What to Share for Help

If still not working, share:
1. **Render logs** (when you make a call)
2. **Twilio Debugger errors** (if any)
3. **TwiML App URL** (from Twilio Console)
4. **Render service URL** (your app URL)
5. **Environment variables** (names only, not values)

