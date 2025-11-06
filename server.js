// server.js
// Main Express server for Twilio Access Token generation and TwiML endpoints

const express = require('express');
const twilio = require('twilio');
const AccessToken = twilio.jwt.AccessToken;
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to log all incoming requests (for debugging)
app.use((req, res, next) => {
  if (req.path.startsWith('/twiml/')) {
    console.log(`\n[REQUEST] ${req.method} ${req.path} - ${new Date().toISOString()}`);
    console.log('[REQUEST] Headers:', JSON.stringify(req.headers, null, 2));
    if (Object.keys(req.body).length > 0) {
      console.log('[REQUEST] Body:', JSON.stringify(req.body, null, 2));
    }
  }
  next();
});

// Serve static files from public directory
app.use(express.static('public'));

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const API_KEY_SID = process.env.TWILIO_API_KEY_SID;
const API_KEY_SECRET = process.env.TWILIO_API_KEY_SECRET;
const OUTGOING_APP_SID = process.env.TWIML_APP_SID; // optional
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const MEDIA_STREAM_URL = process.env.MEDIA_STREAM_URL || 'wss://localhost:8080/media-stream';

// Validate required environment variables
if (!ACCOUNT_SID || !API_KEY_SID || !API_KEY_SECRET) {
  console.error('ERROR: Missing required Twilio credentials in .env file');
  console.error('Required: TWILIO_ACCOUNT_SID, TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET');
  process.exit(1);
}

/**
 * GET /token
 * Generates a Twilio Access Token with VoiceGrant for browser client
 */
app.get('/token', (req, res) => {
  try {
    // Validate credentials are present
    if (!ACCOUNT_SID || !API_KEY_SID || !API_KEY_SECRET) {
      console.error('[TOKEN] Missing credentials:', {
        hasAccountSid: !!ACCOUNT_SID,
        hasApiKeySid: !!API_KEY_SID,
        hasApiKeySecret: !!API_KEY_SECRET
      });
      return res.status(500).json({ 
        error: 'Missing Twilio credentials', 
        message: 'Please check your .env file has TWILIO_ACCOUNT_SID, TWILIO_API_KEY_SID, and TWILIO_API_KEY_SECRET' 
      });
    }

    // Validate credential formats
    if (!ACCOUNT_SID.startsWith('AC') || !API_KEY_SID.startsWith('SK')) {
      console.error('[TOKEN] Invalid credential format:', {
        accountSidFormat: ACCOUNT_SID.substring(0, 2),
        apiKeySidFormat: API_KEY_SID.substring(0, 2)
      });
      return res.status(500).json({ 
        error: 'Invalid credential format', 
        message: 'ACCOUNT_SID should start with AC, API_KEY_SID should start with SK' 
      });
    }

    const identity = 'browser-user-' + Math.random().toString(36).slice(2, 9);
    
    console.log('[TOKEN] Creating token with:', {
      accountSid: ACCOUNT_SID.substring(0, 5) + '...',
      apiKeySid: API_KEY_SID.substring(0, 5) + '...',
      identity: identity
    });
    
    // Identity must be specified in the options object
    const token = new AccessToken(ACCOUNT_SID, API_KEY_SID, API_KEY_SECRET, { 
      identity: identity,
      ttl: 3600 // 1 hour
    });
    
    const grantOptions = {};
    // Validate and trim TwiML App SID
    const twimlAppSid = OUTGOING_APP_SID ? OUTGOING_APP_SID.trim() : null;
    
    if (twimlAppSid && twimlAppSid.length > 0 && twimlAppSid.startsWith('AP')) {
      grantOptions.outgoingApplicationSid = twimlAppSid;
      console.log('[TOKEN] Using TwiML App SID:', twimlAppSid.substring(0, 5) + '...');
      console.log('[TOKEN] Full TwiML App SID:', twimlAppSid);
    } else {
      console.warn('[TOKEN] ⚠️  WARNING: TWIML_APP_SID not set or invalid in environment variables');
      console.warn('[TOKEN] Current value:', OUTGOING_APP_SID || 'undefined');
      console.warn('[TOKEN] Voice SDK requires a TwiML App to be configured');
      console.warn('[TOKEN] Set TWIML_APP_SID in Render environment variables (must start with AP...)');
    }
    
    // VoiceGrant allows the client to make and receive calls
    const voiceGrant = new AccessToken.VoiceGrant(grantOptions);
    token.addGrant(voiceGrant);
    
    // Log grant options for debugging
    console.log('[TOKEN] VoiceGrant options:', JSON.stringify(grantOptions));
    
    const jwt = token.toJwt();
    
    // Verify token includes TwiML App SID (decode JWT payload)
    try {
      const parts = jwt.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        if (payload.grants && payload.grants.voice) {
          const outgoingAppSid = payload.grants.voice.outgoingApplicationSid;
          console.log('[TOKEN] Token includes VoiceGrant:', {
            outgoingApplicationSid: outgoingAppSid || 'MISSING',
            incomingAllow: payload.grants.voice.incomingAllow || false
          });
          if (!outgoingAppSid) {
            console.error('[TOKEN] ❌ ERROR: Token does NOT include outgoingApplicationSid!');
            console.error('[TOKEN] Device will NOT be able to register without this!');
            console.error('[TOKEN] Check that TWIML_APP_SID is set correctly in Render environment variables');
            console.error('[TOKEN] Expected format: APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
            console.error('[TOKEN] Current TWIML_APP_SID value:', OUTGOING_APP_SID || 'NOT SET');
          } else {
            console.log('[TOKEN] ✅ Token includes outgoingApplicationSid:', outgoingAppSid);
            console.log('[TOKEN] ✅ Device should be able to register and connect via WebSocket');
          }
        } else {
          console.error('[TOKEN] ❌ ERROR: Token does NOT include VoiceGrant!');
        }
      }
    } catch (e) {
      console.warn('[TOKEN] Could not decode token for verification:', e.message);
    }
    
    console.log(`[TOKEN] ✅ Generated token successfully for identity: ${identity}`);
    
    res.json({ 
      token: jwt, 
      identity 
    });
  } catch (error) {
    console.error('[TOKEN] ❌ Error generating token:', error);
    console.error('[TOKEN] Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to generate token', 
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * POST /twiml/outgoing
 * TwiML endpoint for simple dialing to PSTN number
 * This is called by Twilio when browser initiates an outgoing call
 */
app.post('/twiml/outgoing', (req, res) => {
  console.log('\n[TwiML] ========================================');
  console.log('[TwiML] ✅ Outgoing call request received!');
  console.log('[TwiML] Request body:', JSON.stringify(req.body, null, 2));
  console.log('[TwiML] Request headers:', JSON.stringify(req.headers, null, 2));
  console.log('[TwiML] ========================================\n');
  
  const targetNumber = req.body.To || TWILIO_PHONE_NUMBER;
  
  if (!targetNumber) {
    console.error('[TwiML] ❌ No target number provided');
    console.error('[TwiML] Request body:', req.body);
    res.type('text/xml');
    return res.send(`
      <Response>
        <Say>Error: No phone number configured.</Say>
        <Hangup/>
      </Response>
    `);
  }
  
  console.log(`[TwiML] ✅ Dialing number: ${targetNumber}`);
  console.log(`[TwiML] Using caller ID: ${TWILIO_PHONE_NUMBER || 'default'}`);
  
  const twiml = `
    <Response>
      <Say>Connecting your browser call to the phone number now.</Say>
      <Dial timeout="30" callerId="${TWILIO_PHONE_NUMBER || ''}">
        <Number>${targetNumber}</Number>
      </Dial>
    </Response>
  `;
  
  console.log('[TwiML] Sending TwiML response:');
  console.log(twiml);
  
  res.type('text/xml');
  res.send(twiml);
});

/**
 * POST /twiml/withstream
 * TwiML endpoint that uses Media Streams to send audio to WebSocket server
 * This enables real-time audio streaming to your AI/STT service
 */
app.post('/twiml/withstream', (req, res) => {
  console.log('[TwiML] Media Stream request:', req.body);
  
  const sessionId = 'browser-call-' + Math.random().toString(36).slice(2, 9);
  
  res.type('text/xml');
  res.send(`
    <Response>
      <Say>Connecting to AI stream.</Say>
      <Connect>
        <Stream url="${MEDIA_STREAM_URL}">
          <Parameter name="sessionId" value="${sessionId}"/>
          <Parameter name="callSid" value="${req.body.CallSid || ''}"/>
        </Stream>
      </Connect>
    </Response>
  `);
});

/**
 * POST /twiml/dial-sip
 * TwiML endpoint for dialing to SIP endpoint (e.g., LiveKit SIP gateway)
 */
app.post('/twiml/dial-sip', (req, res) => {
  console.log('[TwiML] SIP dial request:', req.body);
  
  const sipUri = process.env.SIP_URI || 'sip:livekit@your-sip-gateway.example.com';
  
  res.type('text/xml');
  res.send(`
    <Response>
      <Say>Forwarding to SIP gateway.</Say>
      <Dial timeout="30">
        <Sip>${sipUri}</Sip>
      </Dial>
    </Response>
  `);
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    hasCredentials: !!(ACCOUNT_SID && API_KEY_SID && API_KEY_SECRET),
    credentials: {
      hasAccountSid: !!ACCOUNT_SID,
      accountSidPrefix: ACCOUNT_SID ? ACCOUNT_SID.substring(0, 2) : 'missing',
      hasApiKeySid: !!API_KEY_SID,
      apiKeySidPrefix: API_KEY_SID ? API_KEY_SID.substring(0, 2) : 'missing',
      hasApiKeySecret: !!API_KEY_SECRET,
      hasTwiMLAppSid: !!OUTGOING_APP_SID,
      hasPhoneNumber: !!TWILIO_PHONE_NUMBER
    }
  });
});

/**
 * Test endpoint to verify server is accessible via ngrok
 */
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Server is accessible!',
    timestamp: new Date().toISOString(),
    path: '/test',
    method: req.method,
    headers: req.headers
  });
});

/**
 * Test TwiML endpoint (GET) - for browser testing
 */
app.get('/twiml/outgoing', (req, res) => {
  console.log('[TwiML] GET request to /twiml/outgoing (test)');
  res.type('text/xml');
  res.send(`
    <Response>
      <Say>This is a test. The TwiML endpoint is accessible.</Say>
    </Response>
  `);
});

/**
 * Debug endpoint - shows credential status (without exposing secrets)
 */
app.get('/debug', (req, res) => {
  res.json({
    credentials: {
      accountSid: ACCOUNT_SID ? `${ACCOUNT_SID.substring(0, 5)}...${ACCOUNT_SID.substring(ACCOUNT_SID.length - 4)}` : 'MISSING',
      apiKeySid: API_KEY_SID ? `${API_KEY_SID.substring(0, 5)}...${API_KEY_SID.substring(API_KEY_SID.length - 4)}` : 'MISSING',
      apiKeySecret: API_KEY_SECRET ? `${API_KEY_SECRET.substring(0, 5)}...${API_KEY_SECRET.substring(API_KEY_SECRET.length - 4)}` : 'MISSING',
      twiMLAppSid: OUTGOING_APP_SID || 'NOT SET (optional)',
      phoneNumber: TWILIO_PHONE_NUMBER || 'NOT SET'
    },
    validation: {
      accountSidValid: ACCOUNT_SID ? ACCOUNT_SID.startsWith('AC') : false,
      apiKeySidValid: API_KEY_SID ? API_KEY_SID.startsWith('SK') : false,
      allRequiredPresent: !!(ACCOUNT_SID && API_KEY_SID && API_KEY_SECRET)
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Twilio Browser Softphone Server running on port ${PORT}`);
  console.log(`📱 Token endpoint: http://localhost:${PORT}/token`);
  console.log(`📞 TwiML endpoints:`);
  console.log(`   - /twiml/outgoing (simple dial)`);
  console.log(`   - /twiml/withstream (media streams)`);
  console.log(`   - /twiml/dial-sip (SIP gateway)`);
  console.log(`\n⚠️  Make sure to:`);
  console.log(`   1. Set up your TwiML App in Twilio Console`);
  console.log(`   2. Configure Voice URL to point to your server`);
  console.log(`   3. Use ngrok or similar for HTTPS in production`);
  console.log(`   4. Start media-stream-server.js if using Media Streams\n`);
});

