# 📊 Google Analytics Button Click Tracking

This document explains the comprehensive button click tracking implementation for the Laperla website.

## 🎯 What's Being Tracked

### Button Types
- **Navigation Links**: All header navigation links and footer links
- **CTA Buttons**: Call-to-action buttons (WhatsApp, product views, contact forms)
- **Social Media Links**: Instagram, Facebook, Twitter, LinkedIn links
- **Language Selector**: Language switching interactions
- **Mobile Menu**: Mobile menu open/close interactions
- **Form Submissions**: Contact form and other form submissions
- **External Links**: Links to external websites
- **Modal Interactions**: Modal open/close actions
- **Video Interactions**: Video play/pause events

### Additional Tracking
- **Scroll Depth**: Tracks when users scroll 25%, 50%, 75%, and 90% of page
- **Time on Page**: Tracks engagement milestones (30s, 1min, 2min, 5min)
- **Page Views**: Enhanced page view tracking with language and user agent data

## 📋 Event Structure

Each button click sends an event to Google Analytics with the following data:

```javascript
{
  event_category: 'button_click',      // Category of the event
  event_label: 'Button Text',          // Text content of the button
  button_type: 'link',                 // Type: button, link, form_submit
  button_text: 'Click Here',           // Actual button text
  page: 'index.html',                  // Current page
  language: 'en',                      // Current language setting
  // Additional context-specific fields...
}
```

### Event Categories

| Category | Description | Example Events |
|----------|-------------|----------------|
| `navigation` | Navigation menu clicks | Home, Products, Contact links |
| `cta` | Call-to-action buttons | WhatsApp, Order Now, Get Quote |
| `social` | Social media links | Instagram, Facebook links |
| `language` | Language switching | EN to PL language change |
| `ui_interaction` | UI element interactions | Mobile menu, dropdowns |
| `form` | Form submissions | Contact form submit |
| `external_link` | External website links | Links to other domains |
| `video` | Video interactions | Play, pause, load events |
| `engagement` | User engagement | Scroll depth, time milestones |

## 🔧 Implementation Details

### Files Modified
- `index.html` - Added tracking script reference
- `contact.html` - Added tracking script reference  
- `product.html` - Added tracking script reference
- `heritage.html` - Added tracking script reference
- `assets/js/analytics-tracking.js` - Main tracking implementation

### Key Features

1. **Automatic Detection**: Automatically detects and tracks all clickable elements
2. **Context Awareness**: Tracks page context, language, and user behavior
3. **External Link Detection**: Identifies and specially tracks external links
4. **Form Tracking**: Tracks form submissions with form identification
5. **Error Handling**: Graceful fallback when Google Analytics is unavailable
6. **Performance Optimized**: Minimal impact on page load and user experience

### Google Analytics 4 Events

The tracking uses GA4's event-based model with custom parameters:

- **Event Name**: `click` (for button clicks)
- **Custom Parameters**: 
  - `button_type`
  - `button_text` 
  - `page`
  - `language`
  - `destination` (for links)
  - `is_external` (boolean)
  - `social_platform` (for social links)

## 🧪 Testing

### Test Page
A dedicated test page (`tracking-test.html`) has been created to verify tracking functionality:

```
https://your-domain.com/tracking-test.html
```

### Browser Console Testing
1. Open browser developer tools (F12)
2. Navigate to Console tab
3. Click any button on the website
4. Look for tracking messages like: `Button click tracked: {...}`

### Google Analytics Testing
1. Open Google Analytics Real-Time reports
2. Click buttons on your website
3. View events appearing in real-time under Events section

## 📊 Analytics Reports

### Recommended GA4 Custom Reports

1. **Button Performance Report**
   - Dimension: `event_label` (button text)
   - Metric: `event_count`
   - Filter: `event_name = click`

2. **Page-wise Button Clicks**
   - Dimension: `page`, `event_label`
   - Metric: `event_count`
   - Filter: `event_name = click`

3. **CTA Effectiveness**
   - Dimension: `button_type`
   - Metric: `event_count`
   - Filter: `event_category = cta`

4. **Language Preference**
   - Dimension: `selected_language`
   - Metric: `event_count`
   - Filter: `event_category = language`

## 🔍 Debugging

### Common Issues

1. **Events Not Appearing**
   - Check browser console for errors
   - Verify Google Analytics tracking ID: `G-3QNYCWKF1J`
   - Ensure script loads after gtag initialization

2. **Missing Button Text**
   - Check if buttons have proper text content or aria-labels
   - Verify button elements are properly structured

3. **External Links Not Tracked**
   - Confirm links have `http://` or `https://` prefixes
   - Check cross-domain restrictions

### Debug Mode
Add this to browser console to enable verbose logging:

```javascript
window.analytics_debug = true;
```

## 📈 Benefits

1. **Complete Visibility**: Track every user interaction across the website
2. **Conversion Optimization**: Identify which CTAs perform best
3. **User Experience Insights**: Understand navigation patterns
4. **A/B Testing Support**: Measure impact of button changes
5. **Mobile vs Desktop**: Compare interaction patterns across devices
6. **Language Preferences**: Track which language users prefer
7. **Content Engagement**: See which content keeps users engaged

## 🚀 Next Steps

1. Monitor tracking data for 1-2 weeks
2. Create custom GA4 dashboards for key metrics
3. Set up conversion goals for important actions
4. Implement A/B testing using tracked data
5. Optimize button placement based on click patterns

---

*Last Updated: October 2025*
*Tracking ID: G-3QNYCWKF1J*