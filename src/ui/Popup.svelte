<script lang="ts">
  import { onMount } from 'svelte'
  import { fade, fly, scale } from 'svelte/transition'
  import { quintOut } from 'svelte/easing'

  let blockingEnabled = false
  let ghostCount = 0
  let aggressiveMode = false
  let pkeLevel = 0
  let loading = true
  let error = ''
  let showSparkle = false
  let pkeCapacity = 1000 // Starts at 1000, doubles each purge
  let purgeCount = 0

  interface ExtensionState {
    blockingEnabled: boolean
    ghostCount: number
    aggressiveMode: boolean
    soundEnabled: boolean
    whitelist: string[]
    pkeCapacity?: number
    purgeCount?: number
  }

  onMount(async () => {
    await loadState()
  })

  async function loadState() {
    try {
      loading = true
      error = ''

      const response = await chrome.runtime.sendMessage({ type: 'GET_STATE' })

      if (response?.success && response.data) {
        const state: ExtensionState = response.data
        blockingEnabled = state.blockingEnabled
        ghostCount = state.ghostCount
        aggressiveMode = state.aggressiveMode
        pkeCapacity = state.pkeCapacity || 1000
        purgeCount = state.purgeCount || 0

        // Calculate PKE meter level (0-100, based on current capacity)
        pkeLevel = Math.min((ghostCount / pkeCapacity) * 100, 100)
      } else {
        error = 'Failed to load state'
      }
    } catch (err) {
      console.error('Error loading state:', err)
      error = 'Connection error'
    } finally {
      loading = false
    }
  }

  async function toggleBlocking() {
    try {
      error = ''
      const newState = !blockingEnabled

      const response = await chrome.runtime.sendMessage({
        type: 'TOGGLE_BLOCKING',
        enabled: newState,
      })

      if (response?.success) {
        blockingEnabled = newState
      } else {
        error = 'Failed to toggle blocking'
      }
    } catch (err) {
      console.error('Error toggling blocking:', err)
      error = 'Connection error'
    }
  }

  async function toggleAggressive() {
    try {
      error = ''
      console.log('Toggling aggressive mode to:', aggressiveMode)

      const response = await chrome.runtime.sendMessage({
        type: 'TOGGLE_AGGRESSIVE',
        enabled: aggressiveMode,
      })

      console.log('Aggressive mode response:', response)

      if (!response?.success) {
        error = 'Failed to toggle aggressive mode'
        // Revert checkbox
        aggressiveMode = !aggressiveMode
      }
    } catch (err) {
      console.error('Error toggling aggressive mode:', err)
      error = 'Connection error'
      // Revert checkbox
      aggressiveMode = !aggressiveMode
    }
  }

  // Calculate PKE level reactively (based on current capacity)
  $: pkeLevel = Math.min((ghostCount / pkeCapacity) * 100, 100)
  $: canPurge = pkeLevel >= 100

  async function purgeGhosts() {
    try {
      error = ''

      // Double the capacity
      const newCapacity = pkeCapacity * 2
      const newPurgeCount = purgeCount + 1

      const response = await chrome.runtime.sendMessage({
        type: 'PURGE_GHOSTS',
        capacity: newCapacity,
        purgeCount: newPurgeCount,
      })

      if (response?.success) {
        pkeCapacity = newCapacity
        purgeCount = newPurgeCount
        ghostCount = 0
        pkeLevel = 0
        console.log(`Ghosts purged! New capacity: ${newCapacity}`)
      } else {
        error = 'Failed to purge ghosts'
      }
    } catch (err) {
      console.error('Error purging ghosts:', err)
      error = 'Connection error'
    }
  }

  async function toggleWhitelist() {
    try {
      error = ''

      // Get current state
      const stateResponse = await chrome.runtime.sendMessage({ type: 'GET_STATE' })
      if (!stateResponse?.success) {
        error = 'Failed to get whitelist'
        return
      }

      let whitelist = stateResponse.data.whitelist || []

      if (isWhitelisted) {
        // Remove from whitelist
        whitelist = whitelist.filter((domain: string) => domain !== currentDomain)
      } else {
        // Add to whitelist
        whitelist.push(currentDomain)
      }

      const response = await chrome.runtime.sendMessage({
        type: 'UPDATE_WHITELIST',
        whitelist: whitelist,
      })

      if (response?.success) {
        isWhitelisted = !isWhitelisted
        // Reload the current tab to apply changes
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        if (tab?.id) {
          await chrome.tabs.reload(tab.id)
        }
      } else {
        error = 'Failed to update whitelist'
      }
    } catch (err) {
      console.error('Error toggling whitelist:', err)
      error = 'Connection error'
    }
  }
</script>

<div class="popup-container">
  <!-- Header with logo -->
  <div class="header">
    <div class="logo">
      <span class="logo-icon">👻</span>
      <span class="logo-text">AdBusters</span>
    </div>
    <div class="tagline">Who ya gonna call?</div>
  </div>

  {#if loading}
    <div class="loading-screen" in:fade={{ duration: 200 }}>
      <div class="loading-ghost">👻</div>
      <div class="loading-text">Initializing...</div>
      <div class="loading-subtext">Calibrating PKE Meter</div>
    </div>
  {:else}
    <div class="content" in:fly={{ y: 20, duration: 400, easing: quintOut }}>
      <!-- Stats Card -->
      <div class="stats-card">
        <div class="stat-item">
          <div class="stat-label">Ghosts Trapped</div>
          {#key ghostCount}
            <div class="stat-value" in:scale={{ duration: 300, start: 1.5 }}>
              {ghostCount}
            </div>
          {/key}
        </div>
      </div>

      <!-- Main Toggle Button -->
      <button class="toggle-button" class:active={blockingEnabled} on:click={toggleBlocking}>
        <div class="button-content">
          {#if blockingEnabled}
            <span class="button-icon">👻</span>
            <span class="button-text">Trapping Active</span>
            <div class="button-shimmer"></div>
          {:else}
            <span class="button-icon">▶️</span>
            <span class="button-text">Start Trapping</span>
          {/if}
        </div>
      </button>

      <!-- PKE Meter Section -->
      <div class="pke-section">
        <div class="pke-header">
          <span class="pke-label">PKE METER</span>
          <span class="pke-value" class:critical={pkeLevel > 80}>
            {Math.round(pkeLevel)}%
          </span>
        </div>
        <div class="pke-capacity-info">
          {ghostCount} / {pkeCapacity} ghosts
          {#if purgeCount > 0}
            <span class="purge-badge">×{Math.pow(2, purgeCount)}</span>
          {/if}
        </div>
        <div class="pke-meter">
          <div
            class="pke-meter-fill"
            style="width: {pkeLevel}%"
            class:critical={pkeLevel > 80}
            class:full={pkeLevel >= 100}
          >
            {#if pkeLevel > 0}
              <div class="pke-particles"></div>
            {/if}
          </div>
        </div>
        {#if pkeLevel >= 100}
          <button class="purge-button" on:click={purgeGhosts} in:scale={{ duration: 300 }}>
            🌟 Release Ghosts & Upgrade
          </button>
        {:else if pkeLevel > 80}
          <div class="pke-warning">⚠️ HIGH SPECTRAL ACTIVITY</div>
        {/if}
      </div>

      <!-- Aggressive Mode Toggle -->
      <label class="aggressive-toggle">
        <input type="checkbox" bind:checked={aggressiveMode} on:change={toggleAggressive} />
        <span class="toggle-label">
          <span class="toggle-icon">⚡</span>
          <span class="toggle-text">Cross the Streams</span>
        </span>
      </label>

      {#if aggressiveMode}
        <div class="warning-banner" in:fly={{ y: -10, duration: 300 }}>
          <span class="warning-icon">⚡</span>
          <div class="warning-content">
            <div class="warning-title">DON'T CROSS THE STREAMS!</div>
            <div class="warning-subtitle">Aggressive blocking active</div>
          </div>
        </div>
      {/if}

      {#if error}
        <div class="error-banner" in:fade>
          {error}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  /* Container */
  .popup-container {
    width: 360px;
    min-height: 400px;
    background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
    color: #f0f0f0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  /* Header */
  .header {
    background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
    padding: 20px;
    border-bottom: 2px solid #39ff14;
    box-shadow: 0 4px 20px rgba(57, 255, 20, 0.2);
  }

  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 8px;
  }

  .logo-icon {
    font-size: 36px;
    filter: drop-shadow(0 0 10px #39ff14);
    animation: float 3s ease-in-out infinite;
  }

  .logo-text {
    font-size: 28px;
    font-weight: 900;
    background: linear-gradient(135deg, #39ff14 0%, #00d9ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: 1px;
  }

  .tagline {
    text-align: center;
    font-size: 11px;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  /* Content */
  .content {
    padding: 24px;
  }

  /* Stats Card */
  .stats-card {
    background: rgba(57, 255, 20, 0.05);
    border: 2px solid #39ff14;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 4px 20px rgba(57, 255, 20, 0.1);
  }

  .stat-item {
    text-align: center;
  }

  .stat-label {
    font-size: 11px;
    color: #39ff14;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 8px;
    font-weight: 600;
  }

  .stat-value {
    font-size: 48px;
    font-weight: 900;
    color: #ff6b35;
    text-shadow: 0 0 20px rgba(255, 107, 53, 0.5);
  }

  /* Toggle Button */
  .toggle-button {
    width: 100%;
    padding: 18px;
    border-radius: 12px;
    border: 2px solid #444;
    background: #2a2a2a;
    color: #888;
    font-size: 18px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: 20px;
    position: relative;
    overflow: hidden;
  }

  .toggle-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }

  .toggle-button:active {
    transform: translateY(0);
  }

  .toggle-button.active {
    background: #39ff14;
    border-color: #39ff14;
    color: #0d0d0d;
    box-shadow: 0 6px 30px rgba(57, 255, 20, 0.4);
    animation: pulse 2s ease-in-out infinite;
  }

  .button-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    position: relative;
    z-index: 1;
  }

  .button-icon {
    font-size: 24px;
  }

  .button-shimmer {
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(0, 217, 255, 0.3), transparent);
    animation: shimmer 2s linear infinite;
  }

  /* PKE Section */
  .pke-section {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
    border: 1px solid #333;
  }

  .pke-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .pke-label {
    font-size: 10px;
    color: #00d9ff;
    font-weight: 700;
    letter-spacing: 2px;
    font-family: 'Courier New', monospace;
  }

  .pke-value {
    font-size: 14px;
    color: #00d9ff;
    font-weight: 700;
    font-family: 'Courier New', monospace;
  }

  .pke-value.critical {
    color: #ff6b35;
    animation: pulse 0.5s ease-in-out infinite;
  }

  .pke-capacity-info {
    font-size: 11px;
    color: #888;
    margin-bottom: 8px;
    font-family: 'Courier New', monospace;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .purge-badge {
    background: linear-gradient(135deg, #ff6b35, #ff0000);
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 10px;
    font-weight: 700;
    box-shadow: 0 2px 8px rgba(255, 107, 53, 0.4);
  }

  .pke-meter {
    width: 100%;
    height: 8px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 4px;
    overflow: hidden;
    position: relative;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.8);
  }

  .pke-meter-fill {
    height: 100%;
    background: linear-gradient(90deg, #39ff14, #00d9ff);
    transition: width 0.5s ease-out;
    box-shadow: 0 0 10px rgba(57, 255, 20, 0.6);
    position: relative;
    border-radius: 4px;
  }

  .pke-meter-fill.critical {
    background: linear-gradient(90deg, #ff6b35, #ff0000);
    box-shadow: 0 0 15px rgba(255, 107, 53, 0.8);
    animation: pulse-glow 0.5s ease-in-out infinite;
  }

  .pke-meter-fill.full {
    background: linear-gradient(90deg, #ffd700, #ffff00);
    box-shadow: 0 0 20px rgba(255, 215, 0, 1);
    animation:
      shimmer 1s linear infinite,
      pulse-glow 0.3s ease-in-out infinite;
  }

  .pke-particles {
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    animation: particles 1.5s linear infinite;
  }

  .pke-warning {
    margin-top: 8px;
    font-size: 10px;
    color: #ff6b35;
    font-weight: 700;
    text-align: center;
    animation: pulse 0.5s ease-in-out infinite;
  }

  .purge-button {
    width: 100%;
    margin-top: 12px;
    padding: 12px;
    background: linear-gradient(135deg, #ffd700, #ffff00);
    border: 2px solid #ffd700;
    border-radius: 8px;
    color: #0d0d0d;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 20px rgba(255, 215, 0, 0.5);
    animation: pulse 1s ease-in-out infinite;
  }

  .purge-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 30px rgba(255, 215, 0, 0.7);
  }

  .purge-button:active {
    transform: translateY(0);
  }

  /* Aggressive Toggle */
  .aggressive-toggle {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px;
    background: rgba(0, 217, 255, 0.05);
    border: 2px solid #00d9ff;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: 12px;
  }

  .aggressive-toggle:hover {
    background: rgba(0, 217, 255, 0.1);
    transform: translateX(4px);
  }

  .aggressive-toggle input {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }

  .toggle-label {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
  }

  .toggle-icon {
    font-size: 20px;
  }

  .toggle-text {
    font-size: 14px;
    font-weight: 700;
    color: #00d9ff;
  }

  /* Warning Banner */
  .warning-banner {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px;
    background: rgba(255, 107, 53, 0.1);
    border: 2px solid #ff6b35;
    border-radius: 10px;
    margin-bottom: 12px;
    animation: pulse 2s ease-in-out infinite;
  }

  .warning-icon {
    font-size: 24px;
  }

  .warning-title {
    font-size: 12px;
    font-weight: 700;
    color: #ff6b35;
  }

  .warning-subtitle {
    font-size: 10px;
    color: #ff6b35;
    opacity: 0.8;
  }

  /* Loading Screen */
  .loading-screen {
    padding: 60px 20px;
    text-align: center;
  }

  .loading-ghost {
    font-size: 72px;
    filter: drop-shadow(0 0 30px #39ff14);
    animation: bounce 1s ease-in-out infinite;
  }

  .loading-text {
    font-size: 18px;
    color: #00d9ff;
    margin-top: 20px;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .loading-subtext {
    font-size: 12px;
    color: #666;
    margin-top: 8px;
  }

  /* Error Banner */
  .error-banner {
    padding: 12px;
    background: rgba(255, 0, 0, 0.1);
    border: 1px solid #ff0000;
    border-radius: 8px;
    color: #ff6666;
    font-size: 12px;
  }

  /* Animations */
  @keyframes float {
    0%,
    100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-8px);
    }
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  @keyframes shimmer {
    0% {
      background-position: 0% 0%;
    }
    100% {
      background-position: 200% 0%;
    }
  }

  @keyframes particles {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  @keyframes pulse-glow {
    0%,
    100% {
      box-shadow:
        0 0 20px #ff6b35,
        inset 0 0 15px rgba(255, 107, 53, 0.5);
    }
    50% {
      box-shadow:
        0 0 30px #ff6b35,
        inset 0 0 20px rgba(255, 107, 53, 0.8);
    }
  }

  @keyframes bounce {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20px);
    }
  }
</style>
