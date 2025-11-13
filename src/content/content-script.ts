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
    
    /* AdBusters ghost container */
    .adbusters-ghost-container {
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(26, 26, 26, 0.05);
      border: 2px dashed #39FF14;
      border-radius: 8px;
      min-height: 100px;
      position: relative;
      overflow: hidden;
    }
    
    .adbusters-ghost-container::before {
      content: '👻';
      font-size: 48px;
      opacity: 0.3;
      animation: adbusters-float 3s ease-in-out infinite;
    }
    
    @keyframes adbusters-float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
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

function injectGhostGraphic(element: HTMLElement): void {
  try {
    // Store original dimensions
    const rect = element.getBoundingClientRect()
    const width = rect.width || element.offsetWidth
    const height = rect.height || element.offsetHeight

    // Only inject ghost if element has meaningful size
    if (width > 50 && height > 50) {
      // Create ghost container
      const ghostContainer = document.createElement('div')
      ghostContainer.className = 'adbusters-ghost-container'
      ghostContainer.style.width = `${width}px`
      ghostContainer.style.height = `${height}px`
      ghostContainer.innerHTML = `
        <div style="text-align: center;">
          ${createGhostSVG()}
          <div style="color: #39FF14; font-size: 12px; margin-top: 8px; font-family: monospace;">
            👻 Ghost Trapped
          </div>
        </div>
      `

      // Replace element content with ghost
      element.innerHTML = ''
      element.appendChild(ghostContainer)
      element.setAttribute('data-adbusters-ghosted', 'true')
    } else {
      // For small elements, just hide them
      element.style.display = 'none'
    }
  } catch (error) {
    console.warn('Failed to inject ghost graphic:', error)
    // Fallback: just hide the element
    element.style.visibility = 'hidden'
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

      // Inject ghost graphic
      injectGhostGraphic(element)
      foundAds++

      console.log('👻 Ad detected and ghosted:', selector)
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
    console.warn('Failed to send message to service worker:', error)
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
