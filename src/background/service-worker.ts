// AdBusters Service Worker
// Manages extension state, blocking rules, and message handling

console.log('👻 AdBusters service worker loaded')

// ============================================================================
// Types and Interfaces
// ============================================================================

interface ExtensionState {
  blockingEnabled: boolean
  ghostCount: number
  aggressiveMode: boolean
  soundEnabled: boolean
  whitelist: string[]
  lastUpdated: number
}

type Message =
  | { type: 'GET_STATE' }
  | { type: 'TOGGLE_BLOCKING'; enabled: boolean }
  | { type: 'TOGGLE_AGGRESSIVE'; enabled: boolean }
  | { type: 'INCREMENT_GHOST_COUNT'; count: number }
  | { type: 'UPDATE_WHITELIST'; whitelist: string[] }
  | { type: 'TOGGLE_SOUND'; enabled: boolean }

interface MessageResponse {
  success: boolean
  data?: any
  error?: string
}

// ============================================================================
// Default State
// ============================================================================

const DEFAULT_STATE: ExtensionState = {
  blockingEnabled: true,
  ghostCount: 0,
  aggressiveMode: false,
  soundEnabled: true,
  whitelist: [],
  lastUpdated: Date.now(),
}

// ============================================================================
// Storage Helper Functions
// ============================================================================

async function safeStorageGet<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const result = await chrome.storage.local.get(key)
    return result[key] !== undefined ? result[key] : defaultValue
  } catch (error) {
    console.error(`Storage get failed for ${key}:`, error)
    return defaultValue
  }
}

async function safeStorageSet(key: string, value: any): Promise<boolean> {
  try {
    await chrome.storage.local.set({ [key]: value })
    return true
  } catch (error) {
    console.error(`Storage set failed for ${key}:`, error)
    return false
  }
}

async function getState(): Promise<ExtensionState> {
  const state = await safeStorageGet<ExtensionState>('state', DEFAULT_STATE)
  return state
}

async function saveState(state: ExtensionState): Promise<boolean> {
  state.lastUpdated = Date.now()
  return await safeStorageSet('state', state)
}

// ============================================================================
// Initialization
// ============================================================================

async function initializeExtension() {
  console.log('🎃 Initializing AdBusters...')

  // Load or create initial state
  const state = await getState()

  // Ensure state has all required fields
  const completeState: ExtensionState = {
    ...DEFAULT_STATE,
    ...state,
  }

  await saveState(completeState)

  console.log('✓ State initialized:', completeState)
  console.log(`✓ Blocking: ${completeState.blockingEnabled ? 'ON' : 'OFF'}`)
  console.log(`✓ Ghosts trapped: ${completeState.ghostCount}`)
}

// Initialize on install
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('🎃 AdBusters installed:', details.reason)
  await initializeExtension()
})

// Initialize on startup
chrome.runtime.onStartup.addListener(async () => {
  console.log('🎃 AdBusters starting up...')
  await initializeExtension()
})

// Initialize immediately
initializeExtension()

// ============================================================================
// Rule Management Functions
// ============================================================================

async function toggleBlocking(enabled: boolean): Promise<boolean> {
  try {
    const state = await getState()
    state.blockingEnabled = enabled
    await saveState(state)

    // Update rule sets
    if (enabled) {
      await chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: ['base_rules'],
        disableRulesetIds: [],
      })
      console.log('✓ Ad blocking enabled')
    } else {
      await chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: [],
        disableRulesetIds: ['base_rules', 'aggressive_rules'],
      })
      console.log('✓ Ad blocking disabled')
    }

    return true
  } catch (error) {
    console.error('Failed to toggle blocking:', error)
    return false
  }
}

async function updateAggressiveMode(enabled: boolean): Promise<boolean> {
  try {
    const state = await getState()
    state.aggressiveMode = enabled
    await saveState(state)

    // Only update aggressive rules if blocking is enabled
    if (state.blockingEnabled) {
      if (enabled) {
        await chrome.declarativeNetRequest.updateEnabledRulesets({
          enableRulesetIds: ['aggressive_rules'],
          disableRulesetIds: [],
        })
        console.log("⚡ Aggressive mode enabled - Don't cross the streams!")
      } else {
        await chrome.declarativeNetRequest.updateEnabledRulesets({
          enableRulesetIds: [],
          disableRulesetIds: ['aggressive_rules'],
        })
        console.log('✓ Aggressive mode disabled')
      }
    }

    return true
  } catch (error) {
    console.error('Failed to update aggressive mode:', error)
    return false
  }
}

async function checkWhitelist(domain: string): Promise<boolean> {
  const state = await getState()
  return state.whitelist.some((whitelisted) => domain.includes(whitelisted))
}

async function updateWhitelist(whitelist: string[]): Promise<boolean> {
  try {
    const state = await getState()
    state.whitelist = whitelist
    await saveState(state)
    console.log('✓ Whitelist updated:', whitelist)
    return true
  } catch (error) {
    console.error('Failed to update whitelist:', error)
    return false
  }
}

// ============================================================================
// Ghost Counter Functions
// ============================================================================

async function incrementGhostCount(count: number = 1): Promise<number> {
  try {
    const state = await getState()
    state.ghostCount += count
    await saveState(state)

    // Update badge
    await updateBadge(state.ghostCount)

    console.log(`👻 Ghost count: ${state.ghostCount}`)
    return state.ghostCount
  } catch (error) {
    console.error('Failed to increment ghost count:', error)
    return 0
  }
}

async function updateBadge(count: number): Promise<void> {
  try {
    if (count > 0) {
      await chrome.action.setBadgeText({ text: count.toString() })
      await chrome.action.setBadgeBackgroundColor({ color: '#39FF14' }) // neon green
    } else {
      await chrome.action.setBadgeText({ text: '' })
    }
  } catch (error) {
    console.error('Failed to update badge:', error)
  }
}

async function toggleSound(enabled: boolean): Promise<boolean> {
  try {
    const state = await getState()
    state.soundEnabled = enabled
    await saveState(state)
    console.log(`🔊 Sound: ${enabled ? 'ON' : 'OFF'}`)
    return true
  } catch (error) {
    console.error('Failed to toggle sound:', error)
    return false
  }
}

// ============================================================================
// Message Handling
// ============================================================================

chrome.runtime.onMessage.addListener(
  (message: Message, sender, sendResponse: (response: MessageResponse) => void) => {
    console.log('📨 Message received:', message.type)

    // Handle messages asynchronously
    ;(async () => {
      try {
        switch (message.type) {
          case 'GET_STATE': {
            const state = await getState()
            sendResponse({ success: true, data: state })
            break
          }

          case 'TOGGLE_BLOCKING': {
            const success = await toggleBlocking(message.enabled)
            sendResponse({ success, data: { enabled: message.enabled } })
            break
          }

          case 'TOGGLE_AGGRESSIVE': {
            const success = await updateAggressiveMode(message.enabled)
            sendResponse({ success, data: { enabled: message.enabled } })
            break
          }

          case 'INCREMENT_GHOST_COUNT': {
            const newCount = await incrementGhostCount(message.count)
            sendResponse({ success: true, data: { ghostCount: newCount } })
            break
          }

          case 'UPDATE_WHITELIST': {
            const success = await updateWhitelist(message.whitelist)
            sendResponse({ success, data: { whitelist: message.whitelist } })
            break
          }

          case 'TOGGLE_SOUND': {
            const success = await toggleSound(message.enabled)
            sendResponse({ success, data: { enabled: message.enabled } })
            break
          }

          default:
            sendResponse({
              success: false,
              error: `Unknown message type: ${(message as any).type}`,
            })
        }
      } catch (error) {
        console.error('Error handling message:', error)
        sendResponse({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    })()

    // Return true to indicate we'll send response asynchronously
    return true
  }
)

console.log('✓ Message handler registered')
