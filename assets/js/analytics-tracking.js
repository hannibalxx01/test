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