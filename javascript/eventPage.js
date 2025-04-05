// Import Speech SDK and configuration
import { azureConfig } from './config.js';
let SpeechSDK;

// Variables for audio processing
let audioContext;
let destination;

let tabStream,
  micStream,
  tabAudio,
  micAudio,
  output,
  audioConfig,
  recognizer,
  text = '',
  score = 0,
  micable = true,
  paused = false,
  email,
  duration;

// Reset variables for new recording session
function resetRecordingState() {
  text = '';
  score = 0;
  duration = null;
  paused = false;
}

// Load the Speech SDK using dynamic import for module-type service worker compatibility
const loadSpeechSDK = async () => {
  try {
    // Use dynamic import instead of importScripts
    const speechModule = await import('./microsoft.cognitiveservices.speech.sdk.bundle-min.js');
    SpeechSDK = speechModule.default || speechModule.SpeechSDK || self.Microsoft.CognitiveServices.Speech.SpeechSDK;
    console.log('Speech SDK loaded successfully');
    return true;
  } catch (error) {
    console.error('Failed to load Speech SDK:', error);
    return false;
  }
};

// Initialize the SDK
loadSpeechSDK();


const constraints = {
  audio: true,
};

// Initialize audio context
const initAudioContext = () => {
  audioContext = new AudioContext();
  destination = audioContext.createMediaStreamDestination();
};

// azure speech configurations
const initSpeechConfig = () => {
  const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
    azureConfig.subscriptionKey,
    azureConfig.serviceRegion
  );
  speechConfig.speechRecognitionLanguage = azureConfig.language;
  speechConfig.outputFormat = 1;
  return speechConfig;
};

// get tab audio
function getTabAudio() {
  if (!audioContext) {
    initAudioContext();
  }
  const speechConfig = initSpeechConfig();
  
  chrome.tabCapture.capture(constraints, (_stream) => {
    // keep playing the audio in the background
    const audio = new Audio();
    audio.srcObject = _stream;
    audio.play();

    tabStream = _stream;
    tabAudio = audioContext.createMediaStreamSource(tabStream);
    tabAudio.connect(destination);

    output = new MediaStream();
    output.addTrack(destination.stream.getAudioTracks()[0]);

    audioConfig = SpeechSDK.AudioConfig.fromStreamInput(output);
    recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

    recognizer.startContinuousRecognitionAsync();

    recognizer.recognizing = (s, e) =>
      console.log(`RECOGNIZING: Text=${e.result.text}`);

    recognizer.recognized = (s, e) => {
      text += e.result.text;
      if (score == 0) {
        score = Math.max(score, JSON.parse(e.result.json).NBest[0].Confidence);
      } else {
        score = (score + JSON.parse(e.result.json).NBest[0].Confidence) / 2;
      }
    };

    recognizer.canceled = (s, e) => {
      console.log(`CANCELED: Reason=${e.reason}`);
      recognizer.stopContinuousRecognitionAsync();
    };

    recognizer.sessionStopped = (s, e) => {
      console.log('\n Session stopped event.');
      recognizer.stopContinuousRecognitionAsync();
      chrome.action.setIcon({ path: '../assets/icon48.png' });

      chrome.storage.sync.get('email', (data) => {
        const newWindow = window.open('../html/textEditor.html');
        newWindow.text = text.replace('undefined', '');
        newWindow.email = data.email;
        newWindow.duration = duration;
        newWindow.confidenceScore = (100 * score).toFixed(2);
      });

      // reload the background script to reset the variables
      reloadBackgroundScript();
    };
  });
}

function reloadBackgroundScript() {
  // In Manifest V3, we can't use chrome.extension.getBackgroundPage()
  // Instead, we'll reload the service worker
  chrome.runtime.reload();
}

function cancelStream() {
  chrome.action.setIcon({ path: '../assets/icon48.png' });
  reloadBackgroundScript();
}

// get mic audio
function getMicAudio() {
  navigator.mediaDevices.getUserMedia(constraints).then((mic) => {
    micStream = mic;
    micAudio = audioContext.createMediaStreamSource(micStream);
    micAudio.connect(destination);

    getTabAudio();
  });
}

// start recording the stream
function startRecord() {
  resetRecordingState();
  setTimeout(() => {
    chrome.action.setIcon({ path: '../assets/icon_red.png' });
    getMicAudio();
  }, 3000);
}

function pauseResumeRecord() {
  if (!paused) {
    tabAudio.disconnect(destination);
    if (micable) {
      micAudio.disconnect(destination);
    }
    paused = true;
  } else {
    tabAudio.connect(destination);
    if (micable) {
      micAudio.connect(destination);
    }
    paused = false;
  }
}

function muteMic() {
  if (micable) {
    micAudio.disconnect(destination);
    micable = false;
  } else {
    micAudio.connect(destination);
    micable = true;
  }
}

// stop record -> stop all the tracks
function stopRecord(totalTime) {
  micStream.getTracks().forEach((t) => t.stop());
  tabStream.getTracks().forEach((t) => t.stop());
  duration = totalTime;

  recognizer.stopContinuousRecognitionAsync();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'record':
      startRecord();
      break;
    case 'stop':
      stopRecord(request.duration);
      break;
    case 'pause':
      pauseResumeRecord();
      break;
    case 'mute':
      muteMic();
      break;
    case 'cancel':
      cancelStream();
      break;
    default:
      break;
  }
});
