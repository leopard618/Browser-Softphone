# Twilio Browser Softphone for Voice AI Testing

A complete browser-based softphone solution using Twilio Voice SDK and LiveKit integration for testing voice AI agents. This allows you to make calls from your browser without a physical phone.

## 🎯 Features

- **Browser-based calling** - Make calls directly from your browser using WebRTC
- **Twilio Voice SDK integration** - Full Twilio Voice SDK support
- **Media Streams support** - Real-time audio streaming to your AI/STT services
- **LiveKit ready** - Easy integration with LiveKit for voice AI processing
- **Multiple TwiML endpoints** - Support for dialing, SIP, and media streaming
- **Production-ready** - Includes error handling, logging, and security best practices

## 📋 Prerequisites

- Node.js 16+ installed
- Twilio account with:
  - Account SID
  - API Key SID and Secret (create in [Twilio Console](https://console.twilio.com/us1/develop/api-keys))
  - Twilio phone number
  - TwiML App configured (optional but recommended)

## 🔑 How to Get Twilio API Key SID and Secret

**Important:** You need to create an API Key in Twilio Console. You cannot use your Account Auth Token for this - you must create a dedicated API Key.

### Step-by-Step Instructions:

1. **Log in to Twilio Console**
   - Go to [https://console.twilio.com](https://console.twilio.com)
   - Sign in with your Twilio account

2. **Navigate to API Keys** (from where you are now)
   
   **Option A - Using Left Sidebar:**
   - Look at the **left sidebar** (where you see "Develop", "Monitor", etc.)
   - Click on **"Account Dashboard"** at the top of the sidebar
   - This will take you to your account overview page
   - Look for **"API Keys & Tokens"** or **"Keys & Credentials"** section
   - Click on **"API Keys"** or **"API Keys & Tokens"**
   
   **Option B - Using Top Header:**
   - Look at the **top header bar** (where you see "Buy a number" button)
   - Click on the **"Admin"** dropdown (next to the search bar)
   - Look for **"Account"** or **"API Keys & Tokens"** in the dropdown menu
   - Click on it to navigate to the API Keys page
   
   **Option C - Direct Link (Easiest):**
   - Simply click this direct link: [https://console.twilio.com/us1/account/keys-credentials/api-keys](https://console.twilio.com/us1/account/keys-credentials/api-keys)
   - Or copy/paste this URL in your browser: `https://console.twilio.com/us1/account/keys-credentials/api-keys`

3. **Create a New API Key**
   - Click the **"Create API Key"** button (or **"+"** button)
   - Enter a **Friendly Name** (e.g., "Browser Softphone API Key")
   - Click **"Create API Key"**

4. **Copy Your Credentials**
   - **⚠️ IMPORTANT:** The Secret is shown **ONLY ONCE** when you create the key
   - You'll see:
     - **API Key SID** (starts with `SK...`) - This is your `TWILIO_API_KEY_SID`
     - **API Key Secret** (shown only once) - This is your `TWILIO_API_KEY_SECRET`
   - **Copy both values immediately** and save them securely
   - If you lose the Secret, you'll need to create a new API Key

5. **Get Your Account SID**
   - On the same page or in the main dashboard
   - Your **Account SID** is shown at the top (starts with `AC...`)
   - This is your `TWILIO_ACCOUNT_SID`

### Quick Links (Easiest Method):
- **🔗 Direct Link to API Keys:** [https://console.twilio.com/us1/account/keys-credentials/api-keys](https://console.twilio.com/us1/account/keys-credentials/api-keys)
  - Just click this link or copy/paste it in your browser - it will take you directly to the API Keys page!
- **Account Dashboard:** [https://console.twilio.com](https://console.twilio.com)

### What You'll See on the API Keys Page:
Once you navigate to the API Keys page, you should see:
- A list of your existing API Keys (if any)
- A **"Create API Key"** or **"+"** button to create a new key
- Your Account SID displayed at the top of the page

### ⚠️ Security Notes:
- **Never share your API Key Secret** - treat it like a password
- **Never commit API Keys to Git** - use `.env` file (already in `.gitignore`)
- **Use different API Keys for different projects** - you can create multiple keys
- **Rotate keys regularly** - delete old keys when no longer needed
- **The Secret is shown only once** - if you lose it, create a new key

### Difference: API Key vs Account Auth Token
- **API Key (SK...)** - Used for generating Access Tokens (what we need)
- **Account Auth Token** - Used for direct API calls (not what we need here)

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Install dependencies
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your Twilio credentials:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY_SID=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY_SECRET=your_api_key_secret_here
TWIML_APP_SID=APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

### 3. Create TwiML App in Twilio Console

1. **Go to TwiML Apps:**
   - Navigate to [Twilio Console → Voice → TwiML Apps](https://console.twilio.com/us1/develop/voice/manage/twiml-apps)
   - Or: Left sidebar → **Develop** → **Voice** → **TwiML Apps**

2. **Click "Create new TwiML App"** button

3. **Fill out the form:**

   **Friendly Name (Required):**
   - Enter a name like: `Browser Softphone App` or `Voice AI Testing App`
   - This is just for your reference

   **Voice Configuration:**
   - **Request URL:** Enter your server endpoint:
     - **For local development (with ngrok):** 
       ```
       https://your-ngrok-url.ngrok.io/twiml/outgoing
       ```
       - Replace `your-ngrok-url.ngrok.io` with your actual ngrok URL
       - Example: `https://abc123.ngrok.io/twiml/outgoing`
     - **For production:**
       ```
       https://your-domain.com/twiml/outgoing
       ```
   - **Request Method:** Keep as **"HTTP POST"** (default)

   **Messaging Configuration (Optional):**
   - You can leave this empty for now (we're focusing on voice calls)
   - Or set it to the same URL if you want to handle messages later

4. **Click "Create"** button

5. **Copy the TwiML App SID:**
   - After creation, you'll see the TwiML App SID (starts with `AP...`)
   - Copy this SID and add it to your `.env` file as `TWIML_APP_SID`

### 📝 Example TwiML App Configuration:

```
Friendly Name: Browser Softphone App
Voice Request URL: https://abc123.ngrok.io/twiml/outgoing
Voice Request Method: HTTP POST
Messaging: (leave empty or set later)
```

### ⚠️ Important Notes:

- **You need ngrok running** before creating the TwiML App (see step 5 below)
- The URL must be **HTTPS** (not HTTP) - Twilio requires secure connections
- Make sure your server is running and accessible at that URL
- Test the URL in your browser first: `https://your-ngrok-url.ngrok.io/twiml/outgoing` should return TwiML XML

### 4. Start the Servers

**Terminal 1 - Main Server:**
```bash
npm start
# or for development with auto-reload:
npm run dev
```

**Terminal 2 - Media Stream Server (optional, for Media Streams):**
```bash
node media-stream-server.js
```

### 5. Expose Your Server (for local development)

**⚠️ IMPORTANT:** You need to do this BEFORE creating the TwiML App (step 3), or update the TwiML App URL after starting ngrok.

Twilio requires HTTPS for webhooks. Use ngrok or similar:

1. **Install ngrok:**
   - Download from: [https://ngrok.com/](https://ngrok.com/)
   - Or install via package manager:
     ```bash
     # Windows (with Chocolatey)
     choco install ngrok
     
     # macOS (with Homebrew)
     brew install ngrok
     ```

2. **Start your server first:**
   ```bash
   npm start
   ```
   Your server should be running on `http://localhost:3000`

3. **Start ngrok in a new terminal:**
   ```bash
   ngrok http 3000
   ```
   
   **⚠️ IMPORTANT - ngrok Interstitial Page Issue:**
   
   If you're using ngrok's free tier (`ngrok-free.app`), Twilio's automated requests will be blocked by ngrok's interstitial warning page. You have a few options:
   
   **Option A: Use ngrok paid plan** (recommended for production)
   - Paid plans don't show the interstitial page
   - Use your custom domain
   
   **Option B: Use a different tunneling service**
   - [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
   - [localtunnel](https://localtunnel.github.io/www/)
   - [serveo](https://serveo.net/)
   
   **Option C: Configure Twilio to send custom header** (if supported)
   - Some tunneling services allow configuring headers
   - Check your tunneling service documentation

4. **Copy your ngrok HTTPS URL:**
   - You'll see output like:
     ```
     Forwarding   https://abc123.ngrok.io -> http://localhost:3000
     ```
   - Copy the **HTTPS URL** (the one starting with `https://`)
   - Example: `https://abc123.ngrok.io`

5. **Use this URL in your TwiML App:**
   - When creating the TwiML App (step 3), use:
     ```
     https://abc123.ngrok.io/twiml/outgoing
     ```
   - Replace `abc123.ngrok.io` with your actual ngrok URL

6. **Keep ngrok running:**
   - Keep the ngrok terminal window open while testing
   - If you restart ngrok, you'll get a new URL and need to update your TwiML App

### 6. Open Browser Client

Navigate to:
- Local: `http://localhost:3000`
- Or via ngrok: `https://your-ngrok-url.ngrok.io`

Allow microphone access when prompted, enter a phone number, and click "Call"!

## 📁 Project Structure

```
.
├── server.js                 # Main Express server (token + TwiML endpoints)
├── media-stream-server.js    # WebSocket server for Media Streams
├── public/
│   └── index.html           # Browser client UI
├── package.json             # Dependencies
├── .env.example             # Environment variables template
└── README.md               # This file
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `TWILIO_ACCOUNT_SID` | Your Twilio Account SID | Yes |
| `TWILIO_API_KEY_SID` | API Key SID (create in Console) | Yes |
| `TWILIO_API_KEY_SECRET` | API Key Secret | Yes |
| `TWIML_APP_SID` | TwiML App SID (optional) | No |
| `TWILIO_PHONE_NUMBER` | Your Twilio phone number | Yes |
| `MEDIA_STREAM_URL` | WebSocket URL for Media Streams | No |
| `PORT` | Server port (default: 3000) | No |
| `MEDIA_STREAM_PORT` | Media Stream server port (default: 8080) | No |

### TwiML Endpoints

The server provides three TwiML endpoints:

1. **`/twiml/outgoing`** - Simple dial to PSTN number
2. **`/twiml/withstream`** - Dial with Media Streams (for AI/STT)
3. **`/twiml/dial-sip`** - Dial to SIP endpoint (e.g., LiveKit SIP gateway)

## 🎧 Media Streams Integration

Media Streams allow you to receive real-time audio from Twilio calls for processing with your AI agent.

### Setup Media Streams

1. **Start the Media Stream server:**
   ```bash
   node media-stream-server.js
   ```

2. **Expose it via ngrok (WSS required):**
   ```bash
   ngrok http 8080
   ```

3. **Update `.env` with the WSS URL:**
   ```env
   MEDIA_STREAM_URL=wss://your-ngrok-url.ngrok.io/media-stream
   ```

4. **Configure your TwiML App to use `/twiml/withstream`**

### Forwarding Audio to STT/LiveKit

Edit `media-stream-server.js` and implement the `processAudioFrame()` function:

```javascript
function processAudioFrame(streamId, audioBuffer, message) {
  // Example: Forward to Google Speech-to-Text
  // Example: Forward to LiveKit room
  // Example: Process with your AI agent
}
```

## 🔗 LiveKit Integration

### Option 1: Media Streams → LiveKit

1. Receive audio via Media Streams WebSocket
2. Decode mu-law audio to PCM
3. Publish to LiveKit room as audio track

### Option 2: SIP Gateway

1. Configure LiveKit SIP gateway
2. Use `/twiml/dial-sip` endpoint
3. Set `SIP_URI` in `.env` to your LiveKit SIP endpoint

## 🔒 Security Best Practices

- ✅ **Never expose API keys or secrets** - Always mint tokens server-side
- ✅ **Use HTTPS in production** - Required for Twilio webhooks
- ✅ **Set short token TTLs** - Default is 1 hour
- ✅ **Validate Media Stream requests** - Check sessionId and other params
- ✅ **Use environment variables** - Never hardcode credentials

## 🐛 Troubleshooting

### "Device error" or "Token error"

- Verify your `.env` file has correct credentials
- Check that API Key SID and Secret are correct (not Account Auth Token)
- Ensure server is running and accessible

### "No audio" or "One-way audio"

- Check browser microphone permissions
- Verify you're using HTTPS or localhost
- Check NAT/firewall settings (Twilio SDK handles STUN/TURN)
- Try a different network if behind corporate firewall

### "TwiML not executed"

- Verify TwiML App Voice URL is set correctly
- Check ngrok URL is accessible
- Review Twilio Console → Monitor → Debugger for errors
- Ensure `TWIML_APP_SID` matches your TwiML App

### "Media Streams connection failed"

- Verify WSS URL is accessible (test in browser)
- Check TLS certificate is valid
- Ensure firewall allows inbound WebSocket connections
- Check Media Stream server is running

### "Call not connecting"

- Verify phone number is in E.164 format (+1234567890)
- Check Twilio phone number is active
- Review call logs in Twilio Console
- Ensure TwiML App is configured correctly

## 📊 Testing Checklist

- [ ] Server starts without errors
- [ ] `/token` endpoint returns valid token
- [ ] Browser client loads and requests mic permission
- [ ] TwiML App Voice URL is configured
- [ ] Can make outbound call from browser
- [ ] Audio works both ways
- [ ] Media Streams server receives audio (if using)
- [ ] Call logs appear in Twilio Console

## 🔍 Monitoring

- **Twilio Console → Monitor → Calls** - View call logs and details
- **Twilio Console → Monitor → Debugger** - Real-time error tracking
- **Server logs** - Check terminal output for errors
- **Browser console** - Check for JavaScript errors

## 📚 Additional Resources

- [Twilio Voice SDK Documentation](https://www.twilio.com/docs/voice/sdks/javascript)
- [Twilio Media Streams Guide](https://www.twilio.com/docs/voice/twiml/stream)
- [Twilio TwiML Reference](https://www.twilio.com/docs/voice/twiml)
- [LiveKit Documentation](https://docs.livekit.io/)

## 🤝 Support

For issues:
1. Check the troubleshooting section above
2. Review Twilio Console Debugger
3. Check server and browser console logs
4. Verify all environment variables are set correctly

## 📝 License

MIT

---

**Happy Testing! 🎉**

