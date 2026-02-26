/**
 * Centralized Language Management System
 * Handles language detection, switching, and persistence across all pages
 */

// Global language configuration
const LANGUAGE_CONFIG = {
  supported: ['en', 'pl'],
  default: 'en',
  cookieName: 'selectedLanguage',
  cookieExpiry: 7
};

// Smart language detection with multiple fallbacks
function detectAndRedirect() {
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get('lang');

  // If valid lang parameter exists, respect it and save it
  if (urlLang && LANGUAGE_CONFIG.supported.includes(urlLang)) {
    Cookies.set(LANGUAGE_CONFIG.cookieName, urlLang, { expires: LANGUAGE_CONFIG.cookieExpiry });
    return;
  }

  // Only skip detection if user explicitly chose a language (not for invalid params)
  if (urlLang && !LANGUAGE_CONFIG.supported.includes(urlLang)) {
    console.log('⚠️ Invalid language parameter:', urlLang);
  }

  // Check for explicit user language preference (only respect recent cookies)
  const savedLanguage = Cookies.get(LANGUAGE_CONFIG.cookieName);
  const cookieAge = Cookies.get(LANGUAGE_CONFIG.cookieName + '_timestamp');
  const isRecentChoice = cookieAge && (Date.now() - parseInt(cookieAge)) < 24 * 60 * 60 * 1000; // 24 hours

  if (savedLanguage && LANGUAGE_CONFIG.supported.includes(savedLanguage) && isRecentChoice) {
    redirectToLanguageVersion(savedLanguage);
    return;
  }

  // Primary: Browser language detection
  const browserLang = navigator.language.toLowerCase();
  const browserLangCode = browserLang.startsWith('pl') ? 'pl' : 'en';
  
  console.log('🌐 Browser language detected:', browserLang, '→', browserLangCode);

  // Quick geolocation check for immediate redirect
  fetch('https://api.ip-api.com/json/?fields=countryCode', {
    signal: AbortSignal.timeout(3000) // 3 second timeout
  })
    .then(response => response.json())
    .then(data => {
      const geoLang = data.countryCode === 'PL' ? 'pl' : 'en';
      console.log('🌍 Geo detected:', data.countryCode, '→', geoLang.toUpperCase());
      
      // Use geo if available, otherwise browser language
      const finalLang = geoLang;
      
      // Save choice with timestamp
      Cookies.set(LANGUAGE_CONFIG.cookieName, finalLang, { expires: LANGUAGE_CONFIG.cookieExpiry });
      Cookies.set(LANGUAGE_CONFIG.cookieName + '_timestamp', Date.now().toString(), { expires: LANGUAGE_CONFIG.cookieExpiry });
      
      redirectToLanguageVersion(finalLang);
    })
    .catch(() => {
      console.log('🔌 Geo check failed, using browser language:', browserLangCode.toUpperCase());
      
      // Fallback to browser language
      Cookies.set(LANGUAGE_CONFIG.cookieName, browserLangCode, { expires: LANGUAGE_CONFIG.cookieExpiry });
      Cookies.set(LANGUAGE_CONFIG.cookieName + '_timestamp', Date.now().toString(), { expires: LANGUAGE_CONFIG.cookieExpiry });
      
      redirectToLanguageVersion(browserLangCode);
    });
}

// Background geolocation check (non-blocking)
function tryGeolocationForFutureVisits(fallbackLang) {
  // Only try if we haven't checked recently
  const lastGeoCheck = localStorage.getItem('lastGeoCheck');
  const now = Date.now();
  
  // Check at most once per day
  if (lastGeoCheck && (now - parseInt(lastGeoCheck)) < 24 * 60 * 60 * 1000) {
    return;
  }

  // Set a timeout to prevent hanging
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
  
  fetch('https://api.ip-api.com/json/?fields=countryCode,country', {
    signal: controller.signal
  })
    .then(response => {
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(data => {
      console.log('🌍 Background geo check:', data.country, `(${data.countryCode})`);
      
      // Store geo info for future reference
      localStorage.setItem('geoCountry', data.countryCode);
      localStorage.setItem('lastGeoCheck', now.toString());
      
      // If geo suggests different language, store as suggestion
      const geoLang = data.countryCode === 'PL' ? 'pl' : 'en';
      if (geoLang !== fallbackLang) {
        localStorage.setItem('geoLanguageSuggestion', geoLang);
        console.log(`💡 Geo suggests ${geoLang.toUpperCase()}, but using browser choice ${fallbackLang.toUpperCase()}`);
      }
    })
    .catch(error => {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.log('🔌 Geo check timed out - offline or slow connection');
      } else {
        console.log('🔌 Geo check failed - continuing with browser language');
      }
      localStorage.setItem('lastGeoCheck', now.toString()); // Don't retry immediately
    });
}

// Redirect to appropriate language version
function redirectToLanguageVersion(lang) {
  const currentPath = window.location.pathname;
  const currentPage = currentPath.split('/').pop() || 'index.html';
  
  // If we're already on the correct language path, don't redirect
  if (lang === 'pl' && currentPath.startsWith('/pl/')) {
    return;
  }
  if (lang === 'en' && !currentPath.startsWith('/pl/')) {
    return;
  }
  
  // Redirect to appropriate language version
  if (lang === 'pl') {
    // Redirect to Polish version
    window.location.href = `/pl/${currentPage === 'index.html' ? '' : currentPage}`;
  } else {
    // Redirect to English version (root)
    if (currentPath.startsWith('/pl/')) {
      const page = currentPath.replace('/pl/', '') || '';
      window.location.href = `/${page}`;
    } else {
      // Already on English version, just update with language parameter
      const url = new URL(window.location);
      url.searchParams.set('lang', 'en');
      window.history.replaceState({}, '', url);
    }
  }
}

// Initialize smart language detection - DISABLED for SEO optimization
function initializeGeolocation() {
  const urlParams = new URLSearchParams(window.location.search);
  const hasValidLang = urlParams.get('lang') && LANGUAGE_CONFIG.supported.includes(urlParams.get('lang'));
  const currentPath = window.location.pathname;
  
  // Skip detection if we're already on a language-specific path or have valid lang param
  if (hasValidLang || currentPath.startsWith('/pl/')) {
    return;
  }
  
  // DISABLED automatic redirects to fix Google indexing "Page with redirect" issues
  // detectAndRedirect();
}

// Update all internal links with current language
function updateAllLinks(lang) {
  const links = document.querySelectorAll('a[href^="home.html"], a[href^="product.html"], a[href^="heritage.html"], a[href^="contact.html"], a[href^="index.html"], a[href^="blog.html"]');
  links.forEach(link => {
    try {
      const url = new URL(link.href, window.location.origin);
      url.searchParams.set('lang', lang);
      link.href = url.pathname + url.search;
    } catch (e) {
      // Skip invalid URLs
    }
  });
}

// Main language update function
function updateLanguage(lang) {
  // Update all translatable elements
  const translatableElements = document.querySelectorAll('[data-en][data-pl]');
  translatableElements.forEach(element => {
    const translation = element.getAttribute(`data-${lang}`);
    if (translation) {
      element.textContent = translation;
    }
  });

  // Update form placeholders
  document.querySelectorAll('input[data-placeholder-en], textarea[data-placeholder-en], select option[disabled]').forEach(element => {
    if(element.hasAttribute(`data-placeholder-${lang}`)){
      element.placeholder = element.getAttribute(`data-placeholder-${lang}`);
    } else {
       const text = element.getAttribute(`data-${lang}`);
       if(text) element.textContent = text;
    }
  });

  // Update meta tags
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    const description = metaDescription.getAttribute(`data-${lang}`);
    if (description) {
      metaDescription.setAttribute('content', description);
    }
  }

  const metaKeywords = document.querySelector('meta[name="keywords"]');
  if (metaKeywords) {
    const keywords = metaKeywords.getAttribute(`data-${lang}`);
    if (keywords) {
      metaKeywords.setAttribute('content', keywords);
    }
  }

  const titleElement = document.querySelector('title');
  if (titleElement) {
    const title = titleElement.getAttribute(`data-${lang}`);
    if (title) {
      titleElement.textContent = title;
    }
  }

  // Update language selector UI
  const selectedLanguageSpan = document.querySelector('.selected-language');
  const flagSpan = document.querySelector('.modern-language-button .fi');
  
  if (selectedLanguageSpan && flagSpan) {
    const selectedOption = document.querySelector(`.modern-language-option[data-lang="${lang}"]`);
    if (selectedOption) {
      selectedLanguageSpan.textContent = selectedOption.textContent.trim();
      flagSpan.className = `fi fi-${lang === 'pl' ? 'pl' : 'us'}`;
    }
  }

  // Update document language
  document.documentElement.setAttribute('lang', lang);
  
  // Save language preference with timestamp for manual selections
  Cookies.set(LANGUAGE_CONFIG.cookieName, lang, { expires: LANGUAGE_CONFIG.cookieExpiry });
  Cookies.set(LANGUAGE_CONFIG.cookieName + '_timestamp', Date.now().toString(), { expires: LANGUAGE_CONFIG.cookieExpiry });

  // Update all internal links
  updateAllLinks(lang);
  
  // Update all absolute links with current hostname
  const allLinks = document.querySelectorAll('a[href]');
  allLinks.forEach(link => {
    try {
      const url = new URL(link.href, window.location.origin);
      if (url.hostname === window.location.hostname && 
          (url.pathname.endsWith('.html') || url.pathname === '/')) {
        url.searchParams.set('lang', lang);
        link.href = url.pathname + url.search;
      }
    } catch (e) {
      // Skip invalid URLs
    }
  });
}

// Set active navigation link
function setActiveNavigation() {
  const currentPage = window.location.pathname.split('/').pop();
  // Remove active class from all nav links
  document.querySelectorAll('.modern-nav-link').forEach(link => {
    link.classList.remove('nav-link-active');
  });
  
  // Add active class to current page
  if (currentPage === 'index.html' || currentPage === '') {
    document.getElementById('nav-home')?.classList.add('nav-link-active');
  } else if (currentPage === 'product.html') {
    document.getElementById('nav-products')?.classList.add('nav-link-active');
  } else if (currentPage === 'heritage.html') {
    document.getElementById('nav-story')?.classList.add('nav-link-active');
  } else if (currentPage === 'blog.html') {
    document.getElementById('nav-blog')?.classList.add('nav-link-active');
  } else if (currentPage === 'contact.html') {
    document.getElementById('nav-contact')?.classList.add('nav-link-active');
  }
}

// Initialize language system
function initializeLanguageSystem() {
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get('lang');
  const savedLanguage = Cookies.get(LANGUAGE_CONFIG.cookieName);
  const currentLang = urlLang || savedLanguage || LANGUAGE_CONFIG.default;
  
  // Always update links with current language on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      updateAllLinks(currentLang);
      setActiveNavigation();
    });
  } else {
    updateAllLinks(currentLang);
    setActiveNavigation();
  }
  
  // Initialize language based on URL or cookie - NO AUTOMATIC URL CHANGES
  if (urlLang && LANGUAGE_CONFIG.supported.includes(urlLang)) {
    updateLanguage(urlLang);
  } else if (savedLanguage && LANGUAGE_CONFIG.supported.includes(savedLanguage)) {
    updateLanguage(savedLanguage);
    // DO NOT automatically add ?lang parameter to avoid duplicate content
    // Let the user manually switch languages if they want
  } else {
    // Default to English, no URL changes
    updateLanguage(LANGUAGE_CONFIG.default);
  }
}

// Main initialization function
function initializeLanguageManager() {
  // Initialize geolocation redirect
  initializeGeolocation();

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializeLanguageSystem();
      initializeLanguageDropdown();
      initializeMobileMenu();
    });
  } else {
    initializeLanguageSystem();
    initializeLanguageDropdown();
    initializeMobileMenu();
  }
}

// Initialize language dropdown functionality
function initializeLanguageDropdown() {
  const languageButton = document.querySelector('.modern-language-button');
  const languageMenu = document.querySelector('.modern-language-menu');
  const languageOptions = document.querySelectorAll('.modern-language-option');
  const mobileLanguageOptions = document.querySelectorAll('.mobile-language-option');

  // Desktop language dropdown toggle (desktop only)
  if (languageButton && languageMenu) {
    // Check if we're on mobile/tablet (screen width < 1024px)
    const isMobile = () => window.innerWidth < 1024;
    
    languageButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // On mobile, don't use the dropdown - language switching is in mobile menu
      if (isMobile()) {
        return;
      }
      
      // Desktop dropdown functionality
      const isVisible = languageMenu.style.visibility === 'visible';
      languageMenu.style.opacity = isVisible ? '0' : '1';
      languageMenu.style.visibility = isVisible ? 'hidden' : 'visible';
    });
    
    // Close dropdown when clicking outside (desktop only)
    document.addEventListener('click', () => {
      if (!isMobile()) {
        languageMenu.style.opacity = '0';
        languageMenu.style.visibility = 'hidden';
      }
    });
    
    // Close dropdown on window resize
    window.addEventListener('resize', () => {
      languageMenu.style.opacity = '0';
      languageMenu.style.visibility = 'hidden';
    });
  }

  // Desktop language selection handlers
  languageOptions.forEach(option => {
    option.addEventListener('click', (e) => {
      e.preventDefault();
      const lang = option.getAttribute('data-lang');
      
      if (LANGUAGE_CONFIG.supported.includes(lang)) {
        // Update current page
        updateLanguage(lang);
        
        // Update URL without reload
        const url = new URL(window.location);
        url.searchParams.set('lang', lang);
        window.history.pushState({}, '', url);
        
        // Close dropdown
        if (languageMenu) {
          languageMenu.style.opacity = '0';
          languageMenu.style.visibility = 'hidden';
        }
      }
    });
  });

  // Mobile language selection handlers
  mobileLanguageOptions.forEach(option => {
    option.addEventListener('click', (e) => {
      e.preventDefault();
      const lang = option.getAttribute('data-lang');
      
      if (LANGUAGE_CONFIG.supported.includes(lang)) {
        // Update current page
        updateLanguage(lang);
        
        // Update URL without reload
        const url = new URL(window.location);
        url.searchParams.set('lang', lang);
        window.history.pushState({}, '', url);
        
        // Close mobile menu
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu) {
          mobileMenu.classList.add('hidden');
        }
      }
    });
  });
}

// Mobile menu functionality
function initializeMobileMenu() {
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      mobileMenu.classList.toggle('hidden');
    });
  }
}

// Auto-initialize when script loads - ensure DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeLanguageManager);
} else {
  // DOM is already ready
  initializeLanguageManager();
}