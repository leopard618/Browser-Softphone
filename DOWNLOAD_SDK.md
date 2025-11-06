# Download Twilio Voice SDK - Step by Step

## The Problem
You're using `twilio-sync.min.js` which is the **Sync SDK** (for data synchronization), not the **Voice SDK** (for voice calls).

The error "Twilio.Device is not a constructor" confirms this - the Sync SDK doesn't have `Twilio.Device`.

## Solution: Download Voice SDK

### Step 1: Download Voice SDK

**Option A: Download via Browser (Easiest)**

1. **Open this URL in your browser:**
   ```
   https://sdk.twilio.com/js/client/releases/2.0.0/twilio.min.js
   ```

2. **Save the file:**
   - Right-click on the page → "Save As" (or Ctrl+S)
   - Save as `twilio.min.js` (not `twilio-sync.min.js`)
   - Save it in your `public` folder

3. **Verify the file:**
   - Should be in: `public/twilio.min.js`
   - File size should be around 200-300 KB

**Option B: Download via PowerShell**

```powershell
# Try downloading with different user agent
$headers = @{
    'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}
Invoke-WebRequest -Uri "https://sdk.twilio.com/js/client/releases/2.0.0/twilio.min.js" -OutFile "public/twilio.min.js" -Headers $headers
```

### Step 2: Update index.html

1. **Open `public/index.html`**

2. **Find this line:**
   ```html
   <script src="/twilio-sync.min.js"></script>
   ```

3. **Change it to:**
   ```html
   <script src="/twilio.min.js"></script>
   ```

4. **Or uncomment this line (if it exists):**
   ```html
   <!-- <script src="/twilio.min.js"></script> -->
   ```
   Remove the `<!--` and `-->` to uncomment it.

### Step 3: Delete Wrong SDK

1. **Delete `public/twilio-sync.min.js`** (this is the wrong SDK)

2. **Keep `public/twilio.min.js`** (this is the correct Voice SDK)

### Step 4: Commit and Deploy

1. **Commit changes:**
   ```powershell
   git add public/twilio.min.js public/index.html
   git commit -m "Use correct Twilio Voice SDK instead of Sync SDK"
   git push
   ```

2. **Render will auto-deploy**

3. **Test after deployment:**
   - Refresh browser (Ctrl+F5)
   - Check Network tab - `twilio.min.js` should load ✅
   - Check browser logs - Should see "Device ready!" ✅
   - Test call - Should work now ✅

## Verify SDK is Correct

After downloading, check the file:

1. **Open `public/twilio.min.js` in a text editor**
2. **Search for "Device"** (Ctrl+F)
3. **Should see:** `Twilio.Device` or similar
4. **If you see "Sync" instead, you have the wrong SDK**

## Summary

✅ **Correct SDK:** `twilio.min.js` (Voice SDK)
❌ **Wrong SDK:** `twilio-sync.min.js` (Sync SDK)

**Fix:**
1. Download `twilio.min.js` from Twilio CDN
2. Place in `public` folder
3. Update `index.html` to use `/twilio.min.js`
4. Delete `twilio-sync.min.js`
5. Deploy to Render

