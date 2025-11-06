// twilio-sdk-loader.js
// Load Twilio Voice SDK from npm package (bundled with app)

// This will be replaced with actual SDK loading
// For now, we'll use CDN with better error handling

(function() {
    console.log('[SDK Loader] Attempting to load Twilio Voice SDK...');
    
    // Try primary CDN
    var script = document.createElement('script');
    script.src = 'https://sdk.twilio.com/js/client/releases/2.0.0/twilio.min.js';
    script.crossOrigin = 'anonymous';
    script.async = true;
    
    script.onload = function() {
        console.log('[SDK Loader] ✅ Twilio SDK loaded successfully');
        if (typeof Twilio !== 'undefined') {
            console.log('[SDK Loader] Twilio object is available');
        }
    };
    
    script.onerror = function() {
        console.error('[SDK Loader] ❌ Failed to load from primary CDN, trying fallback...');
        
        // Fallback 1: Try alternative CDN
        var fallback1 = document.createElement('script');
        fallback1.src = 'https://media.twiliocdn.com/sdk/js/voice/releases/2.0.0/twilio.min.js';
        fallback1.crossOrigin = 'anonymous';
        fallback1.async = true;
        
        fallback1.onload = function() {
            console.log('[SDK Loader] ✅ Twilio SDK loaded from fallback CDN');
        };
        
        fallback1.onerror = function() {
            console.error('[SDK Loader] ❌ All CDN attempts failed');
            console.error('[SDK Loader] Please check your browser console for more details');
            console.error('[SDK Loader] You may need to disable ad blockers or privacy extensions');
        };
        
        document.head.appendChild(fallback1);
    };
    
    document.head.appendChild(script);
})();

