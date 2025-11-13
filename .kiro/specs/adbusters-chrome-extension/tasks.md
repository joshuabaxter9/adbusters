# Implementation Plan

- [x] 1. Set up project structure and build configuration
  - Initialize npm project with TypeScript, Vite, Svelte, and Tailwind CSS dependencies
  - Create vite.config.ts with multi-entry configuration for service worker, content script, and UI components
  - Configure Tailwind with custom spooky theme colors (pumpkin orange, neon green, spectral blue)
  - Set up ESLint and Prettier configurations
  - Create manifest.json with Manifest V3 structure, permissions, and entry points
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 9.3_

- [ ] 2. Create base filter rules and build tool
  - Write Node.js script at tools/fetch-lists.ts to fetch EasyList subset
  - Implement parser to convert EasyList syntax to declarativeNetRequest JSON format
  - Generate src/rules/baseRules.json with common ad domain blocking rules (doubleclick, googlesyndication, etc.)

  - Generate src/rules/aggressiveRules.json with additional blocking rules for aggressive mode
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 3. Implement service worker core functionality

- [x] 3.1 Create service worker state management
  - Write src/background/service-worker.ts with ExtensionState interface
  - Implement functions to load and save state to chrome.storage.local

  - Create safeStorageGet and safeStorageSet error handling wrappers
  - Initialize default state on extension install
  - _Requirements: 1.3, 2.3, 4.3, 5.1, 6.1_

- [x] 3.2 Implement declarativeNetRequest rule management
  - Write function to register baseRules.json on extension startup
  - Implement toggleBlocking function to enable/disable rules dynamically
  - Implement updateRules function to add/remove aggressive rules for "Cross the Streams" mode
  - Add whitelist checking logic to exclude domains from blocking
  - _Requirements: 1.1, 1.2, 4.1, 4.2, 4.4, 5.2, 5.3, 10.3_

- [x] 3.3 Implement ghost counter and messaging
  - Create incrementGhostCount function that updates storage and badge
  - Implement chrome.action.setBadgeText to display ghost count on icon
  - Set up chrome.runtime.onMessage listener to handle messages from popup and content script
  - Implement getState message handler to return current extension state
  - _Requirements: 2.1, 2.3_

- [x] 4. Implement content script for ad hiding and ghost injection

- [x] 4.1 Create ad detection and hiding logic
  - Write src/content/content-script.ts with ad element selectors array
  - Implement scanForAds function using querySelectorAll with common ad selectors
  - Create applyBlockingCSS function to inject CSS that hides ad elements
  - Add error handling for invalid selectors
  - _Requirements: 3.1, 3.2, 3.4_

- [x] 4.2 Implement ghost graphic injection
  - Create SVG template for ghost graphic with spooky styling
  - Implement injectGhostGraphic function to replace hidden ad elements with ghost SVG
  - Ensure injected graphics maintain page layout (use same dimensions as original element)
  - Send message to service worker when ads are detected and hidden
  - _Requirements: 3.3, 3.4_

- [x] 4.3 Set up DOM observation for dynamic content
  - Implement MutationObserver to detect dynamically loaded ads
  - Call scanForAds when new nodes are added to the DOM
  - Debounce scanning to avoid performance issues
  - _Requirements: 3.1, 3.4_

- [x] 5. Build popup UI with Svelte

- [x] 5.1 Create popup component structure
  - Write src/ui/popup.svelte with component script and template
  - Create public/popup.html that loads the compiled Svelte component
  - Implement onMount to load extension state from service worker
  - Set up reactive variables for blockingEnabled, ghostCount, aggressiveMode
  - _Requirements: 1.4, 2.2, 4.3, 7.1, 7.2_

- [x] 5.2 Implement toggle controls and state updates
  - Create toggleBlocking function that sends message to service worker
  - Implement toggleAggressive function for "Cross the Streams" mode
  - Add visual feedback for toggle states (button color changes, glow effects)
  - Display warning message when aggressive mode is enabled
  - _Requirements: 1.1, 4.1, 4.3, 7.2_

- [x] 5.3 Create ghost counter and PKE meter displays
  - Implement ghost counter display with emoji and count value
  - Create PKEMeter Svelte component with animated progress bar
  - Calculate PKE level based on ghost count (e.g., level = min(ghostCount / 10, 100))
  - Apply Tailwind classes for spooky theme styling (glows, colors, animations)
  - _Requirements: 2.2, 7.1, 7.2, 7.4_

- [x] 5.4 Apply spooky theme styling
  - Use Tailwind custom theme colors throughout popup
  - Add glow effects to active elements using CSS box-shadow
  - Implement pulse animation for PKE meter
  - Style toggle button with Halloween theme
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 6. Build options page with Svelte
- [ ] 6.1 Create options page component structure
  - Write src/ui/options.svelte with settings sections
  - Create public/options.html that loads the compiled Svelte component
  - Implement onMount to load current settings from storage
  - Set up reactive variables for whitelist array
  - _Requirements: 5.4, 6.4_

- [ ] 6.2 Implement whitelist management
  - Create input field and button for adding domains
  - Implement addDomain function that validates and adds domain to whitelist array
  - Create list display with remove buttons for each whitelisted domain
  - Implement removeDomain function that updates storage and service worker
  - _Requirements: 5.1, 5.3, 5.4_

- [ ] 6.3 Add refresh ghost data button
  - Create button that triggers filter list refresh
  - Implement refreshData function that calls fetch-lists tool
  - Display success/error message after refresh
  - _Requirements: 10.4_

- [x] 7. Create extension icons and visual assets
  - Design or source 16x16, 48x48, and 128x128 PNG icons with ghost/trap theme
  - Add icons to public/ directory
  - Create ghost SVG graphic for ad replacement
  - _Requirements: 7.2, 7.3_

- [x] 8. Implement icon badge and glow effect
  - Update service worker to set badge text with ghost count
  - Set badge background color to neon green
  - Icon displays custom ghost graphic
  - Badge updates when ads are blocked
  - _Requirements: 7.3_

- [ ] 9. Wire up all components and test integration
  - Verify message passing between service worker, content script, and popup
  - Test blocking toggle updates rules correctly
  - Test ghost count increments and displays in popup
  - Test whitelist prevents blocking on specified domains
  - Test aggressive mode adds additional rules
  - Test ghost graphics appear on blocked ad elements
  - Verify ad detection is not too aggressive (doesn't block legitimate content)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3_

- [x] 10. Set up development workflow scripts
  - Add npm scripts for dev, build, and lint commands
  - Configure Vite to output to dist/ directory
  - Set up file watching for automatic rebuilds
  - Create README with setup and loading instructions
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ]\* 11. Add easter egg and polish
  - Implement "Don't cross the streams!" warning message when aggressive mode is enabled (already done!)
  - Add subtle animations to popup elements
  - Implement spectral mode color theme variant (optional)
  - Add loading animation (ecto-core) for initial state load
  - _Requirements: 7.2_
