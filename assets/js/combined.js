/* === JS-COOKIE LIBRARY === */
/*! js-cookie v3.0.5 | MIT */
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e="undefined"!=typeof globalThis?globalThis:e||self,function(){var n=e.Cookies,o=e.Cookies=t();o.noConflict=function(){return e.Cookies=n,o}}())}(this,(function(){"use strict";function e(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var o in n)e[o]=n[o]}return e}var t=function t(n,o){function r(t,r,i){if("undefined"!=typeof document){"number"==typeof(i=e({},o,i)).expires&&(i.expires=new Date(Date.now()+864e5*i.expires)),i.expires&&(i.expires=i.expires.toUTCString()),t=encodeURIComponent(t).replace(/%(2[346B]|5E|60|7C)/g,decodeURIComponent).replace(/[()]/g,escape);var c="";for(var u in i)i[u]&&(c+="; "+u,!0!==i[u]&&(c+="="+i[u].split(";")[0]));return document.cookie=t+"="+n.write(r,t)+c}}return Object.create({set:r,get:function(e){if("undefined"!=typeof document&&(!arguments.length||e)){for(var t=document.cookie?document.cookie.split("; "):[],o={},r=0;r<t.length;r++){var i=t[r].split("="),c=i.slice(1).join("=");try{var u=decodeURIComponent(i[0]);if(o[u]=n.read(c,u),e===u)break}catch(e){}}return e?o[e]:o}},remove:function(t,n){r(t,"",e({},n,{expires:-1}))},withAttributes:function(n){return t(this.converter,e({},this.attributes,n))},withConverter:function(n){return t(e({},this.converter,n),this.attributes)}},{attributes:{value:Object.freeze(o)},converter:{value:Object.freeze(n)}})}({read:function(e){return'"'===e[0]&&(e=e.slice(1,-1)),e.replace(/(%[\dA-F]{2})+/gi,decodeURIComponent)},write:function(e){return encodeURIComponent(e).replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,decodeURIComponent)}},{path:"/"});return t}));


/* === LANGUAGE MANAGER === */
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
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    window.location.href = `${currentPage}?lang=${savedLanguage}`;
    return;
  }

  // Primary: Browser language detection
  const browserLang = navigator.language.toLowerCase();
  const browserLangCode = browserLang.startsWith('pl') ? 'pl' : 'en';
  
  console.log('🌐 Browser language detected:', browserLang, '→', browserLangCode);

  // Proceed with browser language immediately
  console.log(`🔄 Using browser language: ${browserLangCode.toUpperCase()}`);
  
  // Save choice with timestamp
  Cookies.set(LANGUAGE_CONFIG.cookieName, browserLangCode, { expires: LANGUAGE_CONFIG.cookieExpiry });
  Cookies.set(LANGUAGE_CONFIG.cookieName + '_timestamp', Date.now().toString(), { expires: LANGUAGE_CONFIG.cookieExpiry });
  
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  window.location.href = `${currentPage}?lang=${browserLangCode}`;

  // Optional: Try geolocation in background for future visits (non-blocking)
  setTimeout(() => tryGeolocationForFutureVisits(browserLangCode), 1000);
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

// Initialize smart language detection
function initializeGeolocation() {
  const urlParams = new URLSearchParams(window.location.search);
  const hasValidLang = urlParams.get('lang') && LANGUAGE_CONFIG.supported.includes(urlParams.get('lang'));
  
  // Always run detection unless there's a valid language parameter
  if (!hasValidLang) {
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

/* === ANALYTICS TRACKING === */
/**
 * Google Analytics Enhanced Button Click Tracking
 * Tracks all button and link clicks with detailed event data
 */

// Initialize tracking when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    
    // Check if Google Analytics is available
    if (typeof gtag === 'undefined') {
        console.warn('Google Analytics (gtag) not found. Button tracking disabled.');
        return;
    }

    console.log('Analytics button tracking initialized');

    // Track all button clicks
    function trackButtonClick(element, eventData) {
        // Get button text or aria-label as fallback
        const buttonText = element.textContent?.trim() || 
                          element.getAttribute('aria-label') || 
                          element.getAttribute('title') || 
                          'Unknown';

        // Determine button type based on element and context
        let buttonType = 'button';
        if (element.tagName === 'A') {
            buttonType = 'link';
        } else if (element.type === 'submit') {
            buttonType = 'form_submit';
        }

        // Get current page info
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const currentLanguage = document.documentElement.getAttribute('lang') || 'en';

        // Merge default data with custom data
        const trackingData = {
            event_category: 'button_click',
            event_label: buttonText,
            button_type: buttonType,
            button_text: buttonText,
            page: currentPage,
            language: currentLanguage,
            ...eventData
        };

        // Send to Google Analytics
        gtag('event', 'click', trackingData);
        
        // Log for debugging
        console.log('Button click tracked:', trackingData);
    }

    // Track navigation links
    function setupNavigationTracking() {
        const navLinks = document.querySelectorAll('.modern-nav-link, .nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const destination = this.getAttribute('href');
                const isExternal = destination && (destination.startsWith('http') || destination.startsWith('//'));
                
                trackButtonClick(this, {
                    event_category: 'navigation',
                    destination: destination,
                    is_external: isExternal
                });
            });
        });
    }

    // Track CTA buttons
    function setupCTATracking() {
        // WhatsApp buttons
        const whatsappLinks = document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp"]');
        whatsappLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                trackButtonClick(this, {
                    event_category: 'cta',
                    cta_type: 'whatsapp',
                    contact_method: 'whatsapp'
                });
            });
        });

        // Product CTA buttons
        const ctaButtons = document.querySelectorAll('a[href*="product.html"], a[href*="contact.html"]');
        ctaButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                let ctaType = 'general';
                
                if (href.includes('product.html')) {
                    ctaType = 'view_product';
                } else if (href.includes('contact.html')) {
                    ctaType = 'contact';
                }

                trackButtonClick(this, {
                    event_category: 'cta',
                    cta_type: ctaType
                });
            });
        });

        // Social media links
        const socialLinks = document.querySelectorAll('a[href*="instagram"], a[href*="facebook"], a[href*="twitter"], a[href*="linkedin"]');
        socialLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                let platform = 'unknown';
                
                if (href.includes('instagram')) platform = 'instagram';
                else if (href.includes('facebook')) platform = 'facebook';
                else if (href.includes('twitter')) platform = 'twitter';
                else if (href.includes('linkedin')) platform = 'linkedin';

                trackButtonClick(this, {
                    event_category: 'social',
                    social_platform: platform,
                    is_external: true
                });
            });
        });
    }

    // Track language selector
    function setupLanguageTracking() {
        const languageOptions = document.querySelectorAll('.modern-language-option, .language-option');
        languageOptions.forEach(option => {
            option.addEventListener('click', function(e) {
                const selectedLang = this.getAttribute('data-lang');
                
                trackButtonClick(this, {
                    event_category: 'language',
                    selected_language: selectedLang,
                    previous_language: document.documentElement.getAttribute('lang')
                });
            });
        });

        // Track language dropdown button
        const languageButton = document.querySelector('.modern-language-button');
        if (languageButton) {
            languageButton.addEventListener('click', function(e) {
                trackButtonClick(this, {
                    event_category: 'ui_interaction',
                    interaction_type: 'language_dropdown_open'
                });
            });
        }
    }

    // Track mobile menu
    function setupMobileMenuTracking() {
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        if (mobileMenuButton) {
            mobileMenuButton.addEventListener('click', function(e) {
                const mobileMenu = document.querySelector('.mobile-menu');
                const isOpening = mobileMenu?.classList.contains('hidden');
                
                trackButtonClick(this, {
                    event_category: 'ui_interaction',
                    interaction_type: 'mobile_menu',
                    menu_action: isOpening ? 'open' : 'close'
                });
            });
        }
    }

    // Track form submissions
    function setupFormTracking() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                const formAction = this.getAttribute('action') || 'unknown';
                const formId = this.getAttribute('id') || 'unnamed_form';
                
                // Track the form submission
                gtag('event', 'form_submit', {
                    event_category: 'form',
                    form_id: formId,
                    form_action: formAction,
                    page: window.location.pathname.split('/').pop() || 'index.html',
                    language: document.documentElement.getAttribute('lang') || 'en'
                });

                console.log('Form submission tracked:', {
                    form_id: formId,
                    form_action: formAction
                });
            });
        });

        // Track form submit buttons specifically
        const submitButtons = document.querySelectorAll('button[type="submit"], input[type="submit"]');
        submitButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                trackButtonClick(this, {
                    event_category: 'form',
                    button_type: 'form_submit'
                });
            });
        });
    }

    // Track modal interactions
    function setupModalTracking() {
        const modalCloseButtons = document.querySelectorAll('#close-modal, .modal-close, [data-dismiss="modal"]');
        modalCloseButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                trackButtonClick(this, {
                    event_category: 'ui_interaction',
                    interaction_type: 'modal_close'
                });
            });
        });
    }

    // Track external links
    function setupExternalLinkTracking() {
        const allLinks = document.querySelectorAll('a[href]');
        allLinks.forEach(link => {
            const href = link.getAttribute('href');
            
            // Check if it's an external link
            if (href && (href.startsWith('http') || href.startsWith('//'))) {
                const currentDomain = window.location.hostname;
                const linkDomain = new URL(href, window.location.origin).hostname;
                
                if (linkDomain !== currentDomain) {
                    link.addEventListener('click', function(e) {
                        trackButtonClick(this, {
                            event_category: 'external_link',
                            destination_domain: linkDomain,
                            is_external: true
                        });
                    });
                }
            }
        });
    }

    // Track video interactions
    function setupVideoTracking() {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            video.addEventListener('play', function() {
                gtag('event', 'video_play', {
                    event_category: 'video',
                    video_title: this.getAttribute('title') || 'Unnamed video',
                    page: window.location.pathname.split('/').pop() || 'index.html'
                });
            });

            video.addEventListener('pause', function() {
                gtag('event', 'video_pause', {
                    event_category: 'video',
                    video_title: this.getAttribute('title') || 'Unnamed video',
                    page: window.location.pathname.split('/').pop() || 'index.html'
                });
            });
        });

        // Track YouTube iframe interactions (limited due to cross-origin restrictions)
        const youtubeIframes = document.querySelectorAll('iframe[src*="youtube"]');
        youtubeIframes.forEach(iframe => {
            iframe.addEventListener('load', function() {
                gtag('event', 'youtube_load', {
                    event_category: 'video',
                    video_source: 'youtube',
                    page: window.location.pathname.split('/').pop() || 'index.html'
                });
            });
        });
    }

    // Setup all tracking
    setupNavigationTracking();
    setupCTATracking();
    setupLanguageTracking();
    setupMobileMenuTracking();
    setupFormTracking();
    setupModalTracking();
    setupExternalLinkTracking();
    setupVideoTracking();

    // Track page view with enhanced data
    gtag('event', 'page_view', {
        event_category: 'engagement',
        page_title: document.title,
        page_location: window.location.href,
        language: document.documentElement.getAttribute('lang') || 'en',
        user_agent: navigator.userAgent
    });

    console.log('All button tracking initialized successfully');
});

// Track scroll depth
let maxScrollDepth = 0;
window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.round((scrollTop / scrollHeight) * 100);
    
    if (scrollPercent > maxScrollDepth) {
        maxScrollDepth = scrollPercent;
        
        // Track major scroll milestones
        if (scrollPercent >= 25 && scrollPercent < 50 && maxScrollDepth >= 25) {
            gtag('event', 'scroll_depth', {
                event_category: 'engagement',
                scroll_depth: '25%'
            });
        } else if (scrollPercent >= 50 && scrollPercent < 75 && maxScrollDepth >= 50) {
            gtag('event', 'scroll_depth', {
                event_category: 'engagement',
                scroll_depth: '50%'
            });
        } else if (scrollPercent >= 75 && scrollPercent < 90 && maxScrollDepth >= 75) {
            gtag('event', 'scroll_depth', {
                event_category: 'engagement',
                scroll_depth: '75%'
            });
        } else if (scrollPercent >= 90 && maxScrollDepth >= 90) {
            gtag('event', 'scroll_depth', {
                event_category: 'engagement',
                scroll_depth: '90%'
            });
        }
    }
});

// Track time on page
let timeOnPage = 0;
const timeTracker = setInterval(function() {
    timeOnPage += 10;
    
    // Track major time milestones (30s, 60s, 120s, 300s)
    if (timeOnPage === 30) {
        gtag('event', 'time_on_page', {
            event_category: 'engagement',
            time_milestone: '30_seconds'
        });
    } else if (timeOnPage === 60) {
        gtag('event', 'time_on_page', {
            event_category: 'engagement',
            time_milestone: '1_minute'
        });
    } else if (timeOnPage === 120) {
        gtag('event', 'time_on_page', {
            event_category: 'engagement',
            time_milestone: '2_minutes'
        });
    } else if (timeOnPage === 300) {
        gtag('event', 'time_on_page', {
            event_category: 'engagement',
            time_milestone: '5_minutes'
        });
    }
}, 10000); // Check every 10 seconds

// Clear timer when page is unloaded
window.addEventListener('beforeunload', function() {
    clearInterval(timeTracker);
    
    // Send final time on page
    gtag('event', 'page_exit', {
        event_category: 'engagement',
        time_on_page: timeOnPage,
        max_scroll_depth: maxScrollDepth
    });
});

