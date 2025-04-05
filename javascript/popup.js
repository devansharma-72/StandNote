import { clerkConfig } from './config.js';

// Clerk is loaded globally from the browser bundle in popup.html
let email;

// Initialize Clerk
const initClerk = async () => {
  // Use the global Clerk object that's already loaded via the script tag in popup.html
  if (!window.Clerk) {
    console.error('Clerk is not loaded. Make sure the script is properly included in popup.html');
    return;
  }
  
  await window.Clerk.load({
    publishableKey: clerkConfig.publishableKey,
  });

  if (window.Clerk.user) {
    email = window.Clerk.user.primaryEmailAddress.emailAddress;
    chrome.storage.sync.set({ email });
    showRecordScreen(email);
  } else {
    // Mount Clerk's sign-in component
    const signInDiv = document.getElementById('clerk-auth');
    window.Clerk.mountSignIn(signInDiv);
  }

  // Listen for auth state changes
  window.Clerk.addListener((user) => {
    if (user) {
      email = user.primaryEmailAddress.emailAddress;
      chrome.storage.sync.set({ email });
      showRecordScreen(email);
    }
  });
};

// Initialize Clerk when the popup opens
document.addEventListener('DOMContentLoaded', initClerk);


function addRecordListener() {
  const startBtn = document.getElementById('start-record');

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (
      tabs[0].url.includes('chrome://') ||
      tabs[0].url.includes('chrome-extension://') ||
      tabs[0].url.includes('chrome.com') ||
      tabs[0].url.includes('chrome.google.com')
    ) {
      startBtn.setAttribute('disabled', true);
      startBtn.innerText = "Can't record a Chrome page!";
    }
  });

  startBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'record' });

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'record' }, () => {
        window.close();
      });
    });
  });
}

function showRecordScreen(email) {
  document.getElementById('login').style.display = 'none';
  document.getElementById('content').style.display = 'block';
  document.getElementById('content-buttons').style.display = 'block';
  document.getElementById('emailID').innerText = email;
  addRecordListener();
}

function showLoginScreen() {
  document.getElementById('login').style.display = 'block';
  document.getElementById('content').style.display = 'none';
  document.getElementById('content-buttons').style.display = 'none';
}

function addLoginListeners() {
  // These functions are no longer needed as authentication is handled by Clerk
  // The login UI is now managed by Clerk's components
}

chrome.storage.sync.get('email', (data) => {
  if (!data.email) {
    document.getElementById('login').style.display = 'block';
    addLoginListeners();
  } else {
    showRecordScreen(data.email);
  }
});

document.getElementById('logOut').addEventListener('click', async () => {
  // Sign out from Clerk first
  if (window.Clerk) {
    await window.Clerk.signOut();
  }
  // Then clear Chrome storage
  chrome.storage.sync.clear(() => {
    window.close();
  });
});
