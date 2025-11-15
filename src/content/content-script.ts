// AdBusters Content Script
// Detects and hides ad elements, injects ghost graphics

console.log('👻 AdBusters content script loaded on:', window.location.hostname)

// ============================================================================
// Ad Detection Selectors
// ============================================================================

const AD_SELECTORS = [
  // Specific ad classes and IDs (more precise)
  '.advertisement',
  '.ad-container',
  '.ad-wrapper',
  '.ad-banner',
  '.ad-slot',
  '.ad-unit',
  '#advertisement',
  '#ad-container',

  // Sponsored content
  '.sponsored-content',
  '.sponsored-post',
  '[data-sponsored="true"]',

  // Common ad iframes (very specific)
  'iframe[src*="doubleclick.net"]',
  'iframe[src*="googlesyndication.com"]',
  'iframe[src*="googleadservices.com"]',
  'iframe[src*="advertising.com"]',
  'iframe[src*="adnxs.com"]',

  // Google AdSense (very specific)
  'ins.adsbygoogle',
  '.adsbygoogle',
  '[data-ad-slot]',
  '[data-ad-client]',

  // Taboola, Outbrain (specific)
  '.taboola-container',
  '.outbrain-container',
  '[id^="taboola-"]',
  '[id^="outbrain-"]',

  // Other ad networks
  '[class^="ad_"]',
  '[id^="ad_"]',
  '[class^="ads_"]',
  '[id^="ads_"]',
]

// ============================================================================
// State
// ============================================================================

let adsDetected = 0
let soundPlayed = false

// ============================================================================
// CSS Injection
// ============================================================================

function applyBlockingCSS(): void {
  const style = document.createElement('style')
  style.id = 'adbusters-blocking-css'
  style.textContent = `
    /* AdBusters - Hide common ad elements */
    [id*="ad-"],
    [id*="ads-"],
    [class*="ad-"],
    [class*="ads-"],
    .advertisement,
    .ad-container,
    .ad-wrapper,
    ins.adsbygoogle,
    [data-ad-slot] {
      /* Don't completely hide - we'll replace with ghosts */
    }
    
    /* AdBusters portal container */
    .adbusters-portal-container {
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(26, 26, 26, 0.95);
      border-radius: 12px !important;
      position: relative;
      overflow: hidden !important;
      box-sizing: border-box;
      transform: translateZ(0);
      isolation: isolate;
      contain: paint;
    }
    
    .adbusters-portal-container::before,
    .adbusters-portal-container::after {
      content: none !important;
    }
    
    .adbusters-portal-container > * {
      max-width: 100%;
      max-height: 100%;
      border-radius: 12px;
    }
    
    /* Portal Animation Keyframes */
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    @keyframes spinReverse {
      from { transform: rotate(360deg); }
      to { transform: rotate(0deg); }
    }
    
    @keyframes spinSlow {
      from { transform: rotate(0deg) scale(1); }
      to { transform: rotate(360deg) scale(1.05); }
    }
    
    @keyframes portalPulse {
      0%, 100% { 
        transform: scale(1);
        opacity: 0.8;
      }
      50% { 
        transform: scale(1.1);
        opacity: 1;
      }
    }
    
    @keyframes suckIntoPortal {
      0% {
        opacity: 1;
        transform: scale(1) translateY(0) rotate(0deg);
        filter: blur(0px) brightness(1);
      }
      15% {
        opacity: 1;
        transform: scale(0.95) translateY(-8px) rotate(-5deg);
        filter: blur(0px) brightness(1.1);
      }
      30% {
        opacity: 1;
        transform: scale(0.85) translateY(-3px) rotate(-15deg);
        filter: blur(0.5px) brightness(1.2);
      }
      50% {
        opacity: 0.9;
        transform: scale(0.7) translateY(0) rotate(-30deg);
        filter: blur(1px) brightness(1.3);
      }
      70% {
        opacity: 0.7;
        transform: scale(0.45) translateY(0) rotate(-50deg);
        filter: blur(1.5px) brightness(1.4);
      }
      85% {
        opacity: 0.4;
        transform: scale(0.2) translateY(0) rotate(-70deg);
        filter: blur(2px) brightness(1.5);
      }
      95% {
        opacity: 0.1;
        transform: scale(0.05) translateY(0) rotate(-85deg);
        filter: blur(2.5px) brightness(1.6);
      }
      100% {
        opacity: 0;
        transform: scale(0) translateY(0) rotate(-90deg);
        filter: blur(3px) brightness(2);
      }
    }
    
    @keyframes twinkle {
      0%, 100% {
        opacity: 0.3;
        transform: scale(1);
      }
      50% {
        opacity: 1;
        transform: scale(1.2);
      }
    }
    
    @keyframes twinkleSlow {
      0%, 100% {
        opacity: 0.2;
        transform: scale(0.8);
      }
      50% {
        opacity: 0.9;
        transform: scale(1.3);
      }
    }
    
    @keyframes twinkleFast {
      0%, 100% {
        opacity: 0.4;
        transform: scale(1.1);
      }
      50% {
        opacity: 1;
        transform: scale(1.4);
      }
    }
    
    .star-dot {
      position: absolute;
      width: 2px;
      height: 2px;
      background: white;
      border-radius: 50%;
      box-shadow: 0 0 3px rgba(255, 255, 255, 0.8);
      pointer-events: none;
    }
    
    .star-dot.small {
      width: 1.5px;
      height: 1.5px;
      animation: twinkleSlow 3s ease-in-out infinite;
    }
    
    .star-dot.medium {
      width: 2px;
      height: 2px;
      animation: twinkle 2s ease-in-out infinite;
    }
    
    .star-dot.large {
      width: 2.5px;
      height: 2.5px;
      animation: twinkleFast 1.5s ease-in-out infinite;
      box-shadow: 0 0 4px rgba(255, 255, 255, 1);
    }
    
    /* Portal Layers - Simplified */
    .portal-layer-1 {
      position: absolute;
      animation: spin 4s linear infinite;
      filter: drop-shadow(0 0 15px rgba(186, 85, 211, 0.6));
    }
    
    .portal-layer-2 {
      position: absolute;
      animation: spinReverse 5s linear infinite;
      filter: drop-shadow(0 0 12px rgba(138, 43, 226, 0.5));
    }
    
    .portal-layer-3 {
      position: absolute;
      animation: spin 6s linear infinite;
      filter: drop-shadow(0 0 10px rgba(147, 112, 219, 0.4));
    }
    
    .portal-core {
      position: absolute;
      animation: portalPulse 2s ease-in-out infinite;
      filter: drop-shadow(0 0 30px rgba(255, 255, 255, 0.9));
    }
    
    .ghost-capture {
      position: absolute;
      filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.9));
      z-index: 10;
      cursor: pointer;
      transition: transform 0.2s ease;
    }
    
    .ghost-capture:hover {
      transform: scale(1.1);
      filter: drop-shadow(0 0 12px rgba(255, 255, 255, 1));
    }
    
    .ghost-capture.capturing {
      animation: suckIntoPortal 4s ease-in forwards;
      cursor: default;
    }
    

  `

  if (!document.getElementById('adbusters-blocking-css')) {
    document.head.appendChild(style)
    console.log('✓ AdBusters CSS injected')
  }
}

// ============================================================================
// Ad Detection and Hiding
// ============================================================================

function safeQuerySelector(selector: string): HTMLElement[] {
  try {
    return Array.from(document.querySelectorAll(selector))
  } catch (error) {
    console.warn(`Invalid selector: ${selector}`, error)
    return []
  }
}

function isLikelyAd(element: HTMLElement): boolean {
  // Don't block if element contains important content indicators
  const text = element.textContent?.toLowerCase() || ''
  const className = element.className?.toLowerCase() || ''
  const id = element.id?.toLowerCase() || ''

  // Skip if it's likely legitimate content
  const legitimatePatterns = [
    'article',
    'content',
    'main',
    'story',
    'post',
    'comment',
    'navigation',
    'nav',
    'menu',
    'header',
    'footer',
    'sidebar',
  ]

  for (const pattern of legitimatePatterns) {
    if (className.includes(pattern) || id.includes(pattern)) {
      // Unless it's explicitly marked as an ad
      if (
        !className.includes('advertisement') &&
        !className.includes('ad-container') &&
        !id.includes('advertisement')
      ) {
        return false
      }
    }
  }

  // Check if element has substantial text content (likely not an ad)
  if (text.length > 200 && !element.querySelector('iframe')) {
    return false
  }

  return true
}

function createGhostSVG(): string {
  return `
    <svg viewBox="0 0 100 100" style="width: 80px; height: 80px; opacity: 0.6;">
      <path 
        d="M50 20 C30 20 20 30 20 50 L20 80 L30 70 L40 80 L50 70 L60 80 L70 70 L80 80 L80 50 C80 30 70 20 50 20 Z" 
        fill="#f0f0f0" 
        stroke="#00D9FF" 
        stroke-width="2"
      />
      <circle cx="40" cy="45" r="5" fill="#1a1a1a"/>
      <circle cx="60" cy="45" r="5" fill="#1a1a1a"/>
    </svg>
  `
}

function injectGhostGraphic(element: HTMLElement): boolean {
  try {
    // 50% chance to show interactive ghost, 50% just hide
    const showInteractiveGhost = Math.random() < 0.5

    if (showInteractiveGhost) {
      // Store original dimensions and position
      const rect = element.getBoundingClientRect()
      const computedStyle = window.getComputedStyle(element)
      const width = rect.width || element.offsetWidth
      const height = rect.height || element.offsetHeight

      // Only show portal if element is large enough (increased from 50x50 to 150x150)
      if (width > 150 && height > 150) {
        // Preserve the element's display and layout properties
        const originalDisplay = computedStyle.display
        const originalPosition = computedStyle.position

        // Create portal container that fits exactly in the ad space
        const portalContainer = document.createElement('div')
        portalContainer.className = 'adbusters-portal-container'

        // Match exact dimensions and preserve layout
        portalContainer.style.width = `${width}px`
        portalContainer.style.height = `${height}px`
        portalContainer.style.minHeight = `${height}px`
        portalContainer.style.maxHeight = `${height}px`
        portalContainer.style.display = originalDisplay === 'none' ? 'block' : originalDisplay
        portalContainer.style.position =
          originalPosition === 'static' ? 'relative' : originalPosition
        portalContainer.style.overflow = 'hidden'
        portalContainer.style.setProperty('border-radius', '12px', 'important')
        portalContainer.style.setProperty('overflow', 'hidden', 'important')
        portalContainer.style.setProperty('clip-path', 'inset(0 round 12px)', 'important')
        portalContainer.style.setProperty('transform', 'translateZ(0)', 'important') // Force GPU rendering
        portalContainer.style.setProperty('isolation', 'isolate', 'important') // Create stacking context

        // Scale portal size based on container size (increased from 0.6 to 0.9)
        const portalSize = Math.min(width, height) * 0.9
        const ghostSize = portalSize * 0.5

        // Generate twinkling stars
        let starsHTML = ''
        const starCount = 25
        const sizes = ['small', 'medium', 'large']

        for (let i = 0; i < starCount; i++) {
          const x = Math.random() * 100
          const y = Math.random() * 100
          const size = sizes[Math.floor(Math.random() * sizes.length)]
          const delay = Math.random() * 3

          starsHTML += `
            <div class="star-dot ${size}" style="
              left: ${x}%;
              top: ${y}%;
              animation-delay: ${delay}s;
            "></div>
          `
        }

        portalContainer.innerHTML = `
          <div style="
            text-align: center; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            height: 100%; 
            width: 100%;
            position: relative;
            border-radius: 12px;
            overflow: hidden;
          ">
            <!-- Twinkling stars background -->
            ${starsHTML}
            
            <!-- Portal vortex layers (using your custom portal image) -->
            <img class="portal-layer-3" src="${chrome.runtime.getURL('portal.png')}" style="
              width: ${portalSize * 1.2}px;
              height: ${portalSize * 1.2}px;
              opacity: 0.4;
              filter: brightness(0.7);
            " />
            
            <img class="portal-layer-2" src="${chrome.runtime.getURL('portal.png')}" style="
              width: ${portalSize}px;
              height: ${portalSize}px;
              opacity: 0.6;
              filter: brightness(0.8);
            " />
            
            <img class="portal-layer-1" src="${chrome.runtime.getURL('portal.png')}" style="
              width: ${portalSize * 0.8}px;
              height: ${portalSize * 0.8}px;
              opacity: 0.85;
              filter: brightness(0.9);
            " />
            
            <!-- Ghost being captured -->
            <div class="ghost-capture" style="
              font-size: ${ghostSize}px; 
              line-height: 1;
            ">👻</div>
          </div>
        `

        // Create a wrapper with absolute positioning to ensure rounded corners
        const wrapper = document.createElement('div')
        wrapper.style.cssText = `
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          width: 100% !important;
          height: 100% !important;
          border-radius: 12px !important;
          overflow: hidden !important;
          z-index: 1 !important;
        `
        wrapper.appendChild(portalContainer)

        // Replace element content with wrapper
        element.innerHTML = ''
        element.style.position = 'relative'
        element.style.overflow = 'hidden'
        element.style.borderRadius = '12px'
        element.appendChild(wrapper)
        element.setAttribute('data-adbusters-portal', 'true')
        element.setAttribute('data-adbusters-interactive', 'true')

        // Find the ghost element and add click handler
        const ghostElement = portalContainer.querySelector('.ghost-capture')
        if (ghostElement) {
          ghostElement.addEventListener('click', () => {
            // Prevent multiple clicks
            if (ghostElement.classList.contains('capturing')) {
              return
            }

            // Start the capture animation
            ghostElement.classList.add('capturing')
            console.log('👻 Ghost clicked! Starting capture animation...')

            // Increment counter when ghost is clicked
            reportAdsDetected(1)

            // After animation completes, hide the entire element
            setTimeout(() => {
              element.style.transition = 'opacity 0.5s ease-out'
              element.style.opacity = '0'
              setTimeout(() => {
                element.style.display = 'none'
                element.style.height = '0'
                element.style.width = '0'
                element.style.margin = '0'
                element.style.padding = '0'
              }, 500)
            }, 4000)
          })
        }

        // Return false to indicate this ad should NOT be counted yet
        return false
      } else {
        // Small elements just hide and count immediately
        element.style.display = 'none'
        return true
      }
    } else {
      // 80% of the time: just hide the ad completely and count immediately
      // Remove from layout entirely so page flows naturally
      element.style.display = 'none'
      element.style.visibility = 'hidden'
      element.style.opacity = '0'
      element.style.height = '0'
      element.style.width = '0'
      element.style.margin = '0'
      element.style.padding = '0'
      element.setAttribute('data-adbusters-hidden', 'true')
      return true
    }
  } catch (error) {
    console.warn('Failed to process ad element:', error)
    // Fallback: just hide the element and count it
    element.style.display = 'none'
    return true
  }
}

function scanForAds(): number {
  let foundAds = 0

  AD_SELECTORS.forEach((selector) => {
    const elements = safeQuerySelector(selector)

    elements.forEach((element) => {
      // Skip if already processed
      if (element.hasAttribute('data-adbusters-processed')) {
        return
      }

      // Mark as processed first to avoid reprocessing
      element.setAttribute('data-adbusters-processed', 'true')

      // Check if it's actually an ad
      if (!isLikelyAd(element)) {
        console.log('⚠️ Skipping (likely legitimate content):', selector)
        return
      }

      // Inject ghost graphic - returns true if should be counted immediately
      const shouldCount = injectGhostGraphic(element)

      if (shouldCount) {
        foundAds++
        console.log('👻 Ad detected and hidden:', selector)
      } else {
        console.log('👻 Interactive ghost created (click to capture):', selector)
      }
    })
  })

  return foundAds
}

// ============================================================================
// Initialization
// ============================================================================

function initialize(): void {
  console.log('🎃 Initializing AdBusters content script...')

  // Inject CSS
  applyBlockingCSS()

  // Initial scan
  const initialAds = scanForAds()

  if (initialAds > 0) {
    adsDetected += initialAds
    console.log(`✓ Found ${initialAds} ads on initial scan`)

    // Report to service worker
    reportAdsDetected(initialAds)
  }
}

// ============================================================================
// Communication with Service Worker
// ============================================================================

function reportAdsDetected(count: number): void {
  try {
    chrome.runtime.sendMessage(
      {
        type: 'INCREMENT_GHOST_COUNT',
        count: count,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.warn('Failed to report ads:', chrome.runtime.lastError)
          return
        }

        if (response?.success) {
          console.log(`✓ Reported ${count} ads to service worker`)
        }
      }
    )
  } catch (error) {
    // Silently ignore extension context invalidated errors (happens on extension reload)
    if (error instanceof Error && !error.message.includes('Extension context invalidated')) {
      console.warn('Failed to send message to service worker:', error)
    }
  }
}

// ============================================================================
// Run on Page Load
// ============================================================================

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize)
} else {
  initialize()
}

// Also scan after a short delay to catch lazy-loaded ads
setTimeout(() => {
  const lateAds = scanForAds()
  if (lateAds > 0) {
    adsDetected += lateAds
    console.log(`✓ Found ${lateAds} additional ads after delay`)
    reportAdsDetected(lateAds)
  }
}, 2000)

// ============================================================================
// DOM Observation for Dynamic Content
// ============================================================================

let scanTimeout: number | null = null

function debouncedScan(): void {
  if (scanTimeout) {
    clearTimeout(scanTimeout)
  }

  scanTimeout = window.setTimeout(() => {
    const newAds = scanForAds()
    if (newAds > 0) {
      adsDetected += newAds
      console.log(`✓ Found ${newAds} dynamically loaded ads`)
      reportAdsDetected(newAds)
    }
    scanTimeout = null
  }, 500)
}

// Set up MutationObserver to watch for new ad elements
const observer = new MutationObserver((mutations) => {
  let shouldScan = false

  for (const mutation of mutations) {
    // Check if new nodes were added
    if (mutation.addedNodes.length > 0) {
      shouldScan = true
      break
    }
  }

  if (shouldScan) {
    debouncedScan()
  }
})

// Start observing the document
observer.observe(document.body, {
  childList: true,
  subtree: true,
})

console.log('✓ DOM observer active - watching for dynamic ads')
