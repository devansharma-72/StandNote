// Clerk browser script for local implementation
// This local version provides a basic authentication UI for the Chrome extension

(function() {
  // Create a simple authentication system for the extension
  window.Clerk = window.Clerk || {};
  
  let currentUser = null;
  const listeners = [];
  
  // Load Clerk with configuration
  window.Clerk.load = function(options) {
    console.log('Clerk local script loaded with options:', options);
    // Check if user is already logged in via Chrome storage
    chrome.storage.sync.get('email', (data) => {
      if (data.email) {
        currentUser = {
          primaryEmailAddress: { emailAddress: data.email }
        };
        window.Clerk.user = currentUser;
        
        // Notify listeners
        listeners.forEach(listener => listener(currentUser));
      }
    });
    return Promise.resolve();
  };
  
  // Mount a sign-in form in the specified element
  window.Clerk.mountSignIn = function(element) {
    if (!element) return Promise.resolve();
    
    // Create a polished sign-in/sign-up form with error handling
    element.innerHTML = `
      <div class="clerk-auth form">
        <div class="auth-toggle" style="text-align: center; margin-bottom: 20px; display: flex; gap: 10px; justify-content: center;">
          <button id="signin-toggle" class="toggle-btn active" style="padding: 10px 20px; border: 2px solid #1b8045; background: transparent; color: #1b8045; font-weight: 600; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; flex: 1; max-width: 120px;">Sign In</button>
          <button id="signup-toggle" class="toggle-btn" style="padding: 10px 20px; border: 2px solid #1b8045; background: transparent; color: #1b8045; font-weight: 600; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; flex: 1; max-width: 120px;">Sign Up</button>
        </div>
        
        <div id="signin-form" class="auth-form">
          <div class="form-group" style="margin-bottom: 15px;">
            <label for="signin-email" style="color: #4a4a4a; font-weight: 600; margin-bottom: 5px;">Email</label>
            <input type="email" id="signin-email" class="form-input" placeholder="Enter your email" required />
            <div id="signin-email-error" style="color: #dc3545; font-size: 0.875rem; margin-top: 5px; display: none;"></div>
          </div>
          <div class="form-group" style="margin-bottom: 15px;">
            <label for="signin-password" style="color: #4a4a4a; font-weight: 600; margin-bottom: 5px;">Password</label>
            <input type="password" id="signin-password" class="form-input" placeholder="Enter password" required />
            <div id="signin-password-error" style="color: #dc3545; font-size: 0.875rem; margin-top: 5px; display: none;"></div>
          </div>
          <button id="clerk-sign-in-button" class="action-buttons" style="margin-top: 10px;">
            <span id="signin-button-text">Sign In</span>
            <span id="signin-button-loading" style="display: none;">Signing in...</span>
          </button>
        </div>
        
        <div id="signup-form" class="auth-form" style="display: none;">
          <div class="form-group" style="margin-bottom: 15px;">
            <label for="signup-email" style="color: #4a4a4a; font-weight: 600; margin-bottom: 5px;">Email</label>
            <input type="email" id="signup-email" class="form-input" placeholder="Enter your email" required />
            <div id="signup-email-error" style="color: #dc3545; font-size: 0.875rem; margin-top: 5px; display: none;"></div>
          </div>
          <div class="form-group" style="margin-bottom: 15px;">
            <label for="signup-password" style="color: #4a4a4a; font-weight: 600; margin-bottom: 5px;">Password</label>
            <input type="password" id="signup-password" class="form-input" placeholder="Choose password" required />
            <div id="signup-password-error" style="color: #dc3545; font-size: 0.875rem; margin-top: 5px; display: none;"></div>
          </div>
          <div class="form-group" style="margin-bottom: 15px;">
            <label for="signup-confirm-password" style="color: #4a4a4a; font-weight: 600; margin-bottom: 5px;">Confirm Password</label>
            <input type="password" id="signup-confirm-password" class="form-input" placeholder="Confirm password" required />
            <div id="signup-confirm-password-error" style="color: #dc3545; font-size: 0.875rem; margin-top: 5px; display: none;"></div>
          </div>
          <button id="clerk-sign-up-button" class="action-buttons" style="margin-top: 10px;">
            <span id="signup-button-text">Sign Up</span>
            <span id="signup-button-loading" style="display: none;">Signing up...</span>
          </button>
        </div>
      </div>
    `;

    
    // Add event listeners for form toggling
    const signinToggle = element.querySelector('#signin-toggle');
    const signupToggle = element.querySelector('#signup-toggle');
    const signinForm = element.querySelector('#signin-form');
    const signupForm = element.querySelector('#signup-form');

    // Add hover effects for toggle buttons
    const addToggleButtonEffects = (button) => {
      button.addEventListener('mouseover', () => {
        button.style.background = '#1b8045';
        button.style.color = 'white';
        button.style.transform = 'translateY(-1px)';
        button.style.boxShadow = '0 2px 4px rgba(27, 128, 69, 0.2)';
      });
      
      button.addEventListener('mouseout', () => {
        if (!button.classList.contains('active')) {
          button.style.background = 'transparent';
          button.style.color = '#1b8045';
          button.style.transform = 'none';
          button.style.boxShadow = 'none';
        }
      });
    };

    addToggleButtonEffects(signinToggle);
    addToggleButtonEffects(signupToggle);

    signinToggle.addEventListener('click', () => {
      signinForm.style.display = 'block';
      signupForm.style.display = 'none';
      signinToggle.classList.add('active');
      signupToggle.classList.remove('active');
      
      // Update active button styles
      signinToggle.style.background = '#1b8045';
      signinToggle.style.color = 'white';
      signupToggle.style.background = 'transparent';
      signupToggle.style.color = '#1b8045';
    });

    signupToggle.addEventListener('click', () => {
      signinForm.style.display = 'none';
      signupForm.style.display = 'block';
      signinToggle.classList.remove('active');
      signupToggle.classList.add('active');
      
      // Update active button styles
      signupToggle.style.background = '#1b8045';
      signupToggle.style.color = 'white';
      signinToggle.style.background = 'transparent';
      signinToggle.style.color = '#1b8045';
    });

    // Set initial active button style
    signinToggle.style.background = '#1b8045';
    signinToggle.style.color = 'white';

    // Sign In form elements
    const signInButton = element.querySelector('#clerk-sign-in-button');
    const signinEmailInput = element.querySelector('#signin-email');
    const signinPasswordInput = element.querySelector('#signin-password');
    const signinEmailError = element.querySelector('#signin-email-error');
    const signinPasswordError = element.querySelector('#signin-password-error');
    const signinButtonText = element.querySelector('#signin-button-text');
    const signinButtonLoading = element.querySelector('#signin-button-loading');

    // Sign Up form elements
    const signUpButton = element.querySelector('#clerk-sign-up-button');
    const signupEmailInput = element.querySelector('#signup-email');
    const signupPasswordInput = element.querySelector('#signup-password');
    const signupConfirmPasswordInput = element.querySelector('#signup-confirm-password');
    const signupEmailError = element.querySelector('#signup-email-error');
    const signupPasswordError = element.querySelector('#signup-password-error');
    const signupConfirmPasswordError = element.querySelector('#signup-confirm-password-error');
    const signupButtonText = element.querySelector('#signup-button-text');
    const signupButtonLoading = element.querySelector('#signup-button-loading');

    const showError = (element, message) => {
      element.textContent = message;
      element.style.display = 'block';
    };

    const hideError = (element) => {
      element.style.display = 'none';
    };

    const setLoading = (button, textElement, loadingElement, isLoading) => {
      button.disabled = isLoading;
      textElement.style.display = isLoading ? 'none' : 'block';
      loadingElement.style.display = isLoading ? 'block' : 'none';
    };

    // Sign In form input listeners
    signinEmailInput.addEventListener('input', () => hideError(signinEmailError));
    signinPasswordInput.addEventListener('input', () => hideError(signinPasswordError));

    // Sign Up form input listeners
    signupEmailInput.addEventListener('input', () => hideError(signupEmailError));
    signupPasswordInput.addEventListener('input', () => hideError(signupPasswordError));
    signupConfirmPasswordInput.addEventListener('input', () => hideError(signupConfirmPasswordError));

    // Sign In form submission
    signInButton.addEventListener('click', async () => {
      const email = signinEmailInput.value.trim();
      const password = signinPasswordInput.value.trim();
      let isValid = true;

      hideError(signinEmailError);
      hideError(signinPasswordError);

      if (!email) {
        showError(signinEmailError, 'Please enter your email address');
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError(signinEmailError, 'Please enter a valid email address');
        isValid = false;
      }

      if (!password) {
        showError(signinPasswordError, 'Please enter your password');
        isValid = false;
      } else if (password.length < 6) {
        showError(signinPasswordError, 'Password must be at least 6 characters');
        isValid = false;
      }

      if (isValid) {
        setLoading(signInButton, signinButtonText, signinButtonLoading, true);
        
        try {
          // Check if user exists in storage
          chrome.storage.sync.get(['registeredEmails'], async (data) => {
            const registeredEmails = data.registeredEmails || [];
            
            if (!registeredEmails.includes(email)) {
              showError(signinEmailError, 'Email not registered. Please sign up first.');
              signupToggle.click(); // Switch to sign up form
              signupEmailInput.value = email; // Pre-fill email
              return;
            }
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            currentUser = {
              primaryEmailAddress: { emailAddress: email }
            };
            window.Clerk.user = currentUser;
            
            // Store in Chrome storage
            chrome.storage.sync.set({ email });
            
            // Notify listeners
            listeners.forEach(listener => listener(currentUser));
          });
        } catch (error) {
          showError(signinEmailError, 'An error occurred during sign in');
        } finally {
          setLoading(signInButton, signinButtonText, signinButtonLoading, false);
        }
      }
    });

    // Sign Up form submission
    signUpButton.addEventListener('click', async () => {
      const email = signupEmailInput.value.trim();
      const password = signupPasswordInput.value.trim();
      const confirmPassword = signupConfirmPasswordInput.value.trim();
      let isValid = true;

      hideError(signupEmailError);
      hideError(signupPasswordError);
      hideError(signupConfirmPasswordError);

      if (!email) {
        showError(signupEmailError, 'Please enter your email address');
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError(signupEmailError, 'Please enter a valid email address');
        isValid = false;
      }

      if (!password) {
        showError(signupPasswordError, 'Please enter your password');
        isValid = false;
      } else if (password.length < 6) {
        showError(signupPasswordError, 'Password must be at least 6 characters');
        isValid = false;
      }

      if (!confirmPassword) {
        showError(signupConfirmPasswordError, 'Please confirm your password');
        isValid = false;
      } else if (password !== confirmPassword) {
        showError(signupConfirmPasswordError, 'Passwords do not match');
        isValid = false;
      }

      if (isValid) {
        setLoading(signUpButton, signupButtonText, signupButtonLoading, true);
        
        try {
          // Check if email is already registered
          chrome.storage.sync.get(['registeredEmails'], async (data) => {
            const registeredEmails = data.registeredEmails || [];
            
            if (registeredEmails.includes(email)) {
              showError(signupEmailError, 'Email already registered. Please sign in.');
              signinToggle.click(); // Switch to sign in form
              signinEmailInput.value = email; // Pre-fill email
              return;
            }
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Register new user
            registeredEmails.push(email);
            chrome.storage.sync.set({ registeredEmails }, () => {
              currentUser = {
                primaryEmailAddress: { emailAddress: email }
              };
              window.Clerk.user = currentUser;
              
              // Store current user email
              chrome.storage.sync.set({ email });
              
              // Notify listeners
              listeners.forEach(listener => listener(currentUser));
            });
          });
        } catch (error) {
          showError(signupEmailError, 'An error occurred during sign up');
        } finally {
          setLoading(signUpButton, signupButtonText, signupButtonLoading, false);
        }
      }
    });
    
    return Promise.resolve();
  };
  
  // Add a listener for auth state changes
  window.Clerk.addListener = function(callback) {
    if (typeof callback === 'function') {
      listeners.push(callback);
      
      // If user is already set, call the callback immediately
      if (currentUser) {
        callback(currentUser);
      }
    }
  };
  
  // Sign out function
  window.Clerk.signOut = function() {
    currentUser = null;
    window.Clerk.user = null;
    
    // Notify listeners
    listeners.forEach(listener => listener(null));
    
    return Promise.resolve();
  };
})();