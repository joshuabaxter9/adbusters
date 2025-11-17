// AdBusters Content Script
// Detects and hides ad elements, injects ghost graphics

console.log('👻 AdBusters content script loaded on:', window.location.hostname)

// Check if we're on YouTube - if so, exit immediately
const isYouTube = window.location.hostname.includes('youtube.com')

if (isYouTube) {
  console.log('⏭️ AdBusters disabled on YouTube - skipping all functionality')
  // Exit the script completely - no ad blocking on YouTube
  throw new Error('AdBusters intentionally disabled on YouTube')
}

// ============================================================================
// Ad Detection Selectors
// ============================================================================

const AD_SELECTORS = [
  // Specific ad classes and IDs
  '.advertisement',
  '.ad-container',
  '.ad-wrapper',
  '.ad-banner',
  '.ad-slot',
  '.ad-unit',
  '.ad-block',
  '.ad-box',
  '.ad-space',
  '.ad-frame',
  '#advertisement',
  '#ad-container',
  '#ad-banner',

  // Sponsored content
  '.sponsored',
  '.sponsored-content',
  '.sponsored-post',
  '.sponsor',
  '[data-sponsored="true"]',
  '[data-ad-type]',
  '[data-advertisement]',

  // Common ad iframes
  'iframe[src*="doubleclick.net"]',
  'iframe[src*="googlesyndication.com"]',
  'iframe[src*="googleadservices.com"]',
  'iframe[src*="advertising.com"]',
  'iframe[src*="adnxs.com"]',
  'iframe[src*="ads."]',
  'iframe[src*="/ads/"]',
  'iframe[src*="adserver"]',

  // Google AdSense
  'ins.adsbygoogle',
  '.adsbygoogle',
  '[data-ad-slot]',
  '[data-ad-client]',
  '[data-ad-format]',

  // Taboola, Outbrain
  '.taboola-container',
  '.outbrain-container',
  '[id^="taboola-"]',
  '[id^="outbrain-"]',
  '.OUTBRAIN',
  '.taboola',

  // Other ad networks
  '[class^="ad_"]',
  '[id^="ad_"]',
  '[class^="ads_"]',
  '[id^="ads_"]',
  '[class*="_ad_"]',
  '[class*="_ads_"]',
  '[id*="_ad_"]',
  '[id*="_ads_"]',

  // Video ads - General
  '.video-ad',
  '.video-ads',
  '[class*="video-ad"]',
  '[id*="video-ad"]',
  '.video-advertisement',
  '[class*="video-advertisement"]',

  // Video ad containers and overlays
  '.video-ad-container',
  '.video-ad-overlay',
  '.video-ad-wrapper',
  '[class*="video-ad-overlay"]',
  '[id*="video-ad-overlay"]',

  // Pre-roll, mid-roll, post-roll video ads
  '.preroll-ad',
  '.midroll-ad',
  '.postroll-ad',
  '[class*="preroll"]',
  '[class*="midroll"]',
  '[class*="postroll"]',

  // Video player ad elements
  '.vjs-ad',
  '.ima-ad-container',
  '.video-js-ad',
  '[class*="player-ad"]',
  '[id*="player-ad"]',

  // Common video ad networks
  'div[id*="vpaid"]',
  'div[id*="vast"]',
  '[class*="vpaid"]',
  '[class*="vast"]',

  // Embedded video ads
  'iframe[src*="video-ad"]',
  'iframe[src*="videoad"]',
  'iframe[src*="vast"]',
  'iframe[src*="vpaid"]',

  // Specific video ad platforms
  '.jwplayer-ad',
  '.jw-ad',
  '[class*="jwplayer-ad"]',
  '.brightcove-ad',
  '[class*="brightcove-ad"]',
  '.flowplayer-ad',
  '[class*="flowplayer-ad"]',

  // Banner ads
  '.banner-ad',
  '.top-banner',
  '.bottom-banner',
  '[class*="banner-ad"]',

  // Sidebar ads
  '.sidebar-ad',
  '.right-ad',
  '.left-ad',

  // Native ads
  '.native-ad',
  '[data-native-ad]',

  // Promotional content
  '.promo',
  '.promotion',
  '[class*="promo-"]',
]

// ============================================================================
// State
// ============================================================================

let adsDetected = 0
let soundPlayed = false
let blockingEnabled = true // Track current blocking state

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
    
    /* Portal Elements Container */
    .portal-elements {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
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

  // Check for video ad indicators
  if (element.tagName === 'VIDEO' || element.querySelector('video')) {
    // Check if it's a video ad
    const videoAdPatterns = [
      'ad',
      'advertisement',
      'preroll',
      'midroll',
      'postroll',
      'sponsor',
      'promo',
    ]

    for (const pattern of videoAdPatterns) {
      if (className.includes(pattern) || id.includes(pattern)) {
        console.log('🎬 Video ad detected:', element.tagName, className || id)
        return true
      }
    }

    // Check video src for ad indicators
    const videoElement =
      element.tagName === 'VIDEO' ? (element as HTMLVideoElement) : element.querySelector('video')
    if (videoElement?.src) {
      const src = videoElement.src.toLowerCase()
      if (
        src.includes('ad') ||
        src.includes('doubleclick') ||
        src.includes('googlesyndication') ||
        src.includes('advertising')
      ) {
        console.log('🎬 Video ad detected by src:', src)
        return true
      }
    }
  }

  // Check for iframe video ads
  if (element.tagName === 'IFRAME') {
    const iframe = element as HTMLIFrameElement
    const src = iframe.src?.toLowerCase() || ''

    const videoAdDomains = [
      'doubleclick.net',
      'googlesyndication.com',
      'advertising.com',
      'adnxs.com',
      'video-ad',
      'videoad',
      'vast',
      'vpaid',
    ]

    for (const domain of videoAdDomains) {
      if (src.includes(domain)) {
        console.log('🎬 Video ad iframe detected:', src)
        return true
      }
    }
  }

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

function injectGhostGraphic(element: HTMLElement, isVideoAd: boolean = false): boolean {
  try {
    // For video ads, always just hide them without ghost portal
    if (isVideoAd) {
      element.style.display = 'none'
      element.style.visibility = 'hidden'
      element.style.opacity = '0'
      element.style.height = '0'
      element.style.width = '0'
      element.style.margin = '0'
      element.style.padding = '0'
      element.setAttribute('data-adbusters-hidden', 'true')
      element.setAttribute('data-adbusters-video-ad', 'true')
      return true
    }

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

        // Initially show only the monster (no portal)
        const monsterNum = Math.floor(Math.random() * 6) + 1
        portalContainer.innerHTML = `
          <div class="portal-content" style="
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
            <!-- Twinkling stars background (always visible) -->
            ${starsHTML}
            
            <!-- Portal vortex layers (hidden initially) -->
            <div class="portal-elements" style="
              position: absolute;
              inset: 0;
              display: none;
              align-items: center;
              justify-content: center;
              opacity: 0;
              transition: opacity 0.5s ease-in;
            ">
              <img class="portal-layer-3" src="${chrome.runtime.getURL('portal.png')}" style="
                position: absolute;
                width: ${portalSize * 1.2}px;
                height: ${portalSize * 1.2}px;
                opacity: 0.4;
                filter: brightness(0.7);
              " />
              
              <img class="portal-layer-2" src="${chrome.runtime.getURL('portal.png')}" style="
                position: absolute;
                width: ${portalSize}px;
                height: ${portalSize}px;
                opacity: 0.6;
                filter: brightness(0.8);
              " />
              
              <img class="portal-layer-1" src="${chrome.runtime.getURL('portal.png')}" style="
                position: absolute;
                width: ${portalSize * 0.8}px;
                height: ${portalSize * 0.8}px;
                opacity: 0.85;
                filter: brightness(0.9);
              " />
            </div>
            
            <!-- Monster (visible initially) -->
            <img class="ghost-capture" src="${chrome.runtime.getURL(`monster${monsterNum}.png`)}" style="
              position: absolute;
              width: ${ghostSize}px; 
              height: ${ghostSize}px;
              object-fit: contain;
            " />
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

        // Find the monster element and add click handler
        const ghostElement = portalContainer.querySelector('.ghost-capture') as HTMLElement
        const portalElements = portalContainer.querySelector('.portal-elements') as HTMLElement

        if (ghostElement) {
          ghostElement.addEventListener('click', () => {
            // Prevent multiple clicks
            if (ghostElement.classList.contains('capturing')) {
              return
            }

            // Show the portal when clicked with fade-in
            if (portalElements) {
              portalElements.style.display = 'flex'
              // Trigger fade-in after a brief delay to ensure display change is applied
              setTimeout(() => {
                portalElements.style.opacity = '1'
              }, 10)
            }

            // Start the capture animation
            ghostElement.classList.add('capturing')
            console.log('👻 Monster clicked! Portal opening and starting capture...')

            // Increment counter when monster is clicked
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
  // Don't scan if blocking is disabled
  if (!blockingEnabled) {
    return 0
  }

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

      // Check if this is a video ad element
      const isVideoAdElement =
        element.tagName === 'VIDEO' ||
        element.querySelector('video') !== null ||
        (element.tagName === 'IFRAME' &&
          (element as HTMLIFrameElement).src?.toLowerCase().includes('video'))

      // Inject ghost graphic - pass true if it's a video ad
      const shouldCount = injectGhostGraphic(element, isVideoAdElement)

      if (shouldCount) {
        foundAds++
        if (isVideoAdElement) {
          console.log('🎬 Video ad detected and hidden (no portal):', selector)
        } else {
          console.log('👻 Ad detected and hidden:', selector)
        }
      } else {
        console.log('👻 Interactive ghost created (click to capture):', selector)
      }
    })
  })

  // Also scan for video ads specifically
  foundAds += scanForVideoAds()

  return foundAds
}

// ============================================================================
// Video Ad Detection
// ============================================================================

function scanForVideoAds(): number {
  // Don't scan if blocking is disabled
  if (!blockingEnabled) {
    return 0
  }

  let foundVideoAds = 0

  // Find all video elements
  const videos = document.querySelectorAll('video')
  videos.forEach((video) => {
    const parent = video.parentElement
    if (!parent) return

    // Skip if already processed
    if (parent.hasAttribute('data-adbusters-processed')) {
      return
    }

    // Check if video is an ad
    const src = video.src?.toLowerCase() || ''
    const className = parent.className?.toLowerCase() || ''
    const id = parent.id?.toLowerCase() || ''

    const isVideoAd =
      src.includes('ad') ||
      src.includes('doubleclick') ||
      src.includes('googlesyndication') ||
      className.includes('ad') ||
      className.includes('preroll') ||
      className.includes('midroll') ||
      id.includes('ad') ||
      id.includes('preroll') ||
      id.includes('midroll')

    if (isVideoAd) {
      parent.setAttribute('data-adbusters-processed', 'true')
      const shouldCount = injectGhostGraphic(parent, true) // Pass true for video ads
      if (shouldCount) {
        foundVideoAds++
        console.log('🎬 Video ad detected and hidden (no portal)')
      }
    }
  })

  // Find all iframes that might contain video ads
  const iframes = document.querySelectorAll('iframe')
  iframes.forEach((iframe) => {
    const parent = iframe.parentElement
    if (!parent) return

    // Skip if already processed
    if (parent.hasAttribute('data-adbusters-processed')) {
      return
    }

    const src = iframe.src?.toLowerCase() || ''
    const videoAdPatterns = [
      'video-ad',
      'videoad',
      'vast',
      'vpaid',
      'ima3',
      'imasdk',
      'doubleclick.net/gampad',
    ]

    const isVideoAdIframe = videoAdPatterns.some((pattern) => src.includes(pattern))

    if (isVideoAdIframe) {
      parent.setAttribute('data-adbusters-processed', 'true')
      const shouldCount = injectGhostGraphic(parent, true) // Pass true for video ads
      if (shouldCount) {
        foundVideoAds++
        console.log('🎬 Video ad iframe detected and hidden (no portal):', src)
      }
    }
  })

  return foundVideoAds
}

// ============================================================================
// Initialization
// ============================================================================

function initialize(): void {
  console.log('🎃 Initializing AdBusters content script...')

  // Always inject CSS (for portal animations)
  applyBlockingCSS()

  // Check if blocking is enabled before scanning
  chrome.runtime.sendMessage({ type: 'GET_STATE' }, (response) => {
    if (response?.success && response.data) {
      blockingEnabled = response.data.blockingEnabled

      if (!blockingEnabled) {
        console.log('✓ Ad blocking is disabled - skipping scan')
        return
      }

      // Only scan if blocking is enabled
      const initialAds = scanForAds()

      if (initialAds > 0) {
        adsDetected += initialAds
        console.log(`✓ Found ${initialAds} ads on initial scan`)

        // Report to service worker
        reportAdsDetected(initialAds)
      }
    }
  })
}

// ============================================================================
// Listen for State Changes
// ============================================================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'BLOCKING_STATE_CHANGED') {
    blockingEnabled = message.enabled
    console.log(`🔄 Blocking state changed: ${blockingEnabled ? 'ON' : 'OFF'}`)

    if (blockingEnabled) {
      // Re-scan for ads when blocking is enabled
      const newAds = scanForAds()
      if (newAds > 0) {
        adsDetected += newAds
        console.log(`✓ Found ${newAds} ads after enabling blocking`)
        reportAdsDetected(newAds)
      }
    } else {
      // When blocking is disabled, restore all hidden ads
      restoreAds()
    }

    sendResponse({ success: true })
  }
  return true
})

function restoreAds(): void {
  console.log('🔄 Restoring hidden ads...')

  // Find all elements that were processed by AdBusters
  const processedElements = document.querySelectorAll('[data-adbusters-processed]')

  processedElements.forEach((element) => {
    const htmlElement = element as HTMLElement

    // Remove the processed marker so they can be re-processed if blocking is re-enabled
    htmlElement.removeAttribute('data-adbusters-processed')

    // Restore hidden elements
    if (htmlElement.hasAttribute('data-adbusters-hidden')) {
      htmlElement.style.display = ''
      htmlElement.style.visibility = ''
      htmlElement.style.opacity = ''
      htmlElement.style.height = ''
      htmlElement.style.width = ''
      htmlElement.style.margin = ''
      htmlElement.style.padding = ''
      htmlElement.removeAttribute('data-adbusters-hidden')
    }

    // Restore portal containers
    if (htmlElement.hasAttribute('data-adbusters-portal')) {
      // For portal containers, we need to reload the page to fully restore
      // For now, just make them visible again
      htmlElement.style.display = ''
      htmlElement.style.opacity = '1'
      htmlElement.removeAttribute('data-adbusters-portal')
      htmlElement.removeAttribute('data-adbusters-interactive')
    }
  })

  console.log('✓ Ads restored')
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
