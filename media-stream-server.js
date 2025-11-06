// media-stream-server.js
// WebSocket server to handle Twilio Media Streams
// Receives audio from Twilio and can forward to LiveKit, STT, or other services

const WebSocket = require('ws');
const http = require('http');
require('dotenv').config();

const PORT = process.env.MEDIA_STREAM_PORT || 8080;

// Create HTTP server for WebSocket upgrade
const server = http.createServer();

// Create WebSocket server
const wss = new WebSocket.Server({ 
  server,
  path: '/media-stream'
});

// Store active streams
const activeStreams = new Map();

console.log(`\n🎧 Twilio Media Streams WebSocket Server`);
console.log(`   Listening on port ${PORT}`);
console.log(`   Path: /media-stream\n`);

wss.on('connection', (ws, req) => {
  const streamId = req.url.split('?')[0] + '-' + Date.now();
  let sessionId = null;
  let callSid = null;
  
  console.log(`[Media Stream] New connection: ${streamId}`);
  
  // Parse query parameters if present
  const urlParams = new URLSearchParams(req.url.split('?')[1] || '');
  sessionId = urlParams.get('sessionId') || 'unknown';
  callSid = urlParams.get('callSid') || 'unknown';
  
  activeStreams.set(streamId, {
    ws,
    sessionId,
    callSid,
    connectedAt: new Date(),
    frameCount: 0,
    audioBytes: 0
  });
  
  console.log(`[Media Stream] Stream initialized - Session: ${sessionId}, CallSid: ${callSid}`);
  
  // Handle incoming messages from Twilio
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      
      switch (message.event) {
        case 'connected':
          console.log(`[Media Stream] Connected: ${JSON.stringify(message)}`);
          handleConnected(streamId, message);
          break;
          
        case 'start':
          console.log(`[Media Stream] Stream started: ${JSON.stringify(message)}`);
          handleStart(streamId, message);
          break;
          
        case 'media':
          handleMedia(streamId, message);
          break;
          
        case 'stop':
          console.log(`[Media Stream] Stream stopped: ${JSON.stringify(message)}`);
          handleStop(streamId, message);
          break;
          
        default:
          console.log(`[Media Stream] Unknown event: ${message.event}`);
      }
    } catch (error) {
      console.error(`[Media Stream] Error parsing message:`, error);
    }
  });
  
  ws.on('error', (error) => {
    console.error(`[Media Stream] WebSocket error for ${streamId}:`, error);
  });
  
  ws.on('close', () => {
    console.log(`[Media Stream] Connection closed: ${streamId}`);
    activeStreams.delete(streamId);
  });
});

/**
 * Handle 'connected' event from Twilio
 */
function handleConnected(streamId, message) {
  const stream = activeStreams.get(streamId);
  if (stream) {
    console.log(`[Media Stream] Protocol: ${message.protocol?.version || 'unknown'}`);
  }
}

/**
 * Handle 'start' event from Twilio
 */
function handleStart(streamId, message) {
  const stream = activeStreams.get(streamId);
  if (stream) {
    stream.started = true;
    console.log(`[Media Stream] Stream started - Media format: ${message.mediaFormat?.encoding || 'unknown'}`);
    console.log(`[Media Stream] Sample rate: ${message.mediaFormat?.sampleRate || 'unknown'} Hz`);
  }
  
  // Here you can initialize your STT service, LiveKit connection, etc.
  // Example: initializeSTT(streamId);
  // Example: connectToLiveKit(streamId);
}

/**
 * Handle 'media' event from Twilio (contains audio data)
 */
function handleMedia(streamId, message) {
  const stream = activeStreams.get(streamId);
  if (!stream) return;
  
  stream.frameCount++;
  
  // Decode base64 audio payload
  const audioPayload = message.media?.payload;
  if (audioPayload) {
    const audioBuffer = Buffer.from(audioPayload, 'base64');
    stream.audioBytes += audioBuffer.length;
    
    // Log every 100 frames to avoid spam
    if (stream.frameCount % 100 === 0) {
      console.log(`[Media Stream] ${streamId} - Frames: ${stream.frameCount}, Audio: ${(stream.audioBytes / 1024).toFixed(2)} KB`);
    }
    
    // TODO: Forward audio to your STT service or LiveKit
    // Example: forwardToSTT(streamId, audioBuffer);
    // Example: forwardToLiveKit(streamId, audioBuffer);
    
    // Example: Decode PCM audio (if needed)
    // Twilio sends mu-law encoded audio by default
    // You may need to decode it depending on your STT service requirements
    processAudioFrame(streamId, audioBuffer, message);
  }
}

/**
 * Process audio frame - placeholder for your STT/LiveKit integration
 */
function processAudioFrame(streamId, audioBuffer, message) {
  // This is where you would:
  // 1. Decode mu-law to PCM if needed
  // 2. Forward to your STT service (Google Speech-to-Text, Whisper, etc.)
  // 3. Forward to LiveKit room
  // 4. Process with your AI agent
  
  // Example structure:
  // const stream = activeStreams.get(streamId);
  // if (stream && stream.sttClient) {
  //   stream.sttClient.write(audioBuffer);
  // }
  
  // For now, we just log that we received audio
  // Uncomment the line below to see every frame (will be very verbose)
  // console.log(`[Audio] ${streamId} - Received ${audioBuffer.length} bytes`);
}

/**
 * Handle 'stop' event from Twilio
 */
function handleStop(streamId, message) {
  const stream = activeStreams.get(streamId);
  if (stream) {
    console.log(`[Media Stream] Stream stopped - Total frames: ${stream.frameCount}, Total audio: ${(stream.audioBytes / 1024).toFixed(2)} KB`);
    
    // Clean up STT connections, LiveKit connections, etc.
    // Example: cleanupSTT(streamId);
    // Example: disconnectFromLiveKit(streamId);
  }
  
  activeStreams.delete(streamId);
}

/**
 * Example: Initialize STT service (placeholder)
 */
function initializeSTT(streamId) {
  // Example: Google Speech-to-Text, OpenAI Whisper, etc.
  // const stream = activeStreams.get(streamId);
  // stream.sttClient = createSTTClient();
  console.log(`[STT] Initialize STT for stream: ${streamId}`);
}

/**
 * Example: Connect to LiveKit (placeholder)
 */
function connectToLiveKit(streamId) {
  // Example: Create LiveKit room connection
  // const stream = activeStreams.get(streamId);
  // stream.livekitConnection = await connectToLiveKitRoom();
  console.log(`[LiveKit] Connect to LiveKit for stream: ${streamId}`);
}

// Start server
server.listen(PORT, () => {
  console.log(`✅ Media Streams server ready on ws://localhost:${PORT}/media-stream`);
  console.log(`\n⚠️  Note: For production, use WSS (secure WebSocket) with valid TLS certificate`);
  console.log(`   Twilio requires WSS for Media Streams in production\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[Media Stream] Shutting down...');
  wss.clients.forEach((client) => {
    client.close();
  });
  server.close(() => {
    console.log('[Media Stream] Server closed');
    process.exit(0);
  });
});

// Export for potential use in main server
module.exports = { wss, activeStreams };

