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

// Geolocation and language detection
function detectAndRedirect() {
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get('lang');

  // Skip if valid lang parameter is present
  if (urlLang && LANGUAGE_CONFIG.supported.includes(urlLang)) {
    Cookies.set(LANGUAGE_CONFIG.cookieName, urlLang, { expires: LANGUAGE_CONFIG.cookieExpiry });
    return;
  }

  // Skip if already redirected with valid lang parameter to prevent loops
  if (urlLang) {
    return;
  }

  // Check saved language cookie
  const savedLanguage = Cookies.get(LANGUAGE_CONFIG.cookieName);
  if (savedLanguage && LANGUAGE_CONFIG.supported.includes(savedLanguage)) {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    window.location.href = `${currentPage}?lang=${savedLanguage}`;
    return;
  }

  // Fetch geolocation from ip-api.com
  fetch('https://api.ip-api.com/json/?fields=countryCode,country')
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(data => {
      console.log('🌍 Geolocation detected:', data.country, `(${data.countryCode})`);
      const lang = data.countryCode === 'PL' ? 'pl' : 'en';
      console.log(`🔄 Redirecting to ${lang.toUpperCase()} version`);
      Cookies.set(LANGUAGE_CONFIG.cookieName, lang, { expires: LANGUAGE_CONFIG.cookieExpiry });
      const currentPage = window.location.pathname.split('/').pop() || 'index.html';
      window.location.href = `${currentPage}?lang=${lang}`;
    })
    .catch(error => {
      console.error('⚠️ Geolocation error, using browser language fallback:', error);
      const fallbackLang = navigator.language.startsWith('pl') ? 'pl' : 'en';
      console.log(`🔄 Fallback to ${fallbackLang.toUpperCase()} based on browser language`);
      Cookies.set(LANGUAGE_CONFIG.cookieName, fallbackLang, { expires: LANGUAGE_CONFIG.cookieExpiry });
      const currentPage = window.location.pathname.split('/').pop() || 'index.html';
      window.location.href = `${currentPage}?lang=${fallbackLang}`;
    });
}

// Initialize geolocation redirect if no language parameter
function initializeGeolocation() {
  const hasLangParam = window.location.search.includes('lang=');
  
  if (!hasLangParam) {
    detectAndRedirect();
  }
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
  
  // Save language preference
  Cookies.set(LANGUAGE_CONFIG.cookieName, lang, { expires: LANGUAGE_CONFIG.cookieExpiry });

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

// Initialize language dropdown functionality
function initializeLanguageDropdown() {
  const languageButton = document.querySelector('.modern-language-button');
  const languageMenu = document.querySelector('.modern-language-menu');
  const languageOptions = document.querySelectorAll('.modern-language-option');
  const mobileLanguageOptions = document.querySelectorAll('.mobile-language-option');

  // Desktop language dropdown toggle
  if (languageButton && languageMenu) {
    languageButton.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = languageMenu.style.visibility === 'visible';
      languageMenu.style.opacity = isVisible ? '0' : '1';
      languageMenu.style.visibility = isVisible ? 'hidden' : 'visible';
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
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
    mobileMenuButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }
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
  
  // Initialize language based on URL or cookie
  if (urlLang && LANGUAGE_CONFIG.supported.includes(urlLang)) {
    updateLanguage(urlLang);
  } else if (savedLanguage && LANGUAGE_CONFIG.supported.includes(savedLanguage)) {
    updateLanguage(savedLanguage);
    // Update URL to include language parameter
    const url = new URL(window.location);
    url.searchParams.set('lang', savedLanguage);
    window.history.replaceState({}, '', url);
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

// Auto-initialize when script loads
initializeLanguageManager();