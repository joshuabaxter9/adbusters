<script lang="ts">
  import { onMount } from 'svelte'

  let blockingEnabled = false
  let ghostCount = 0
  let aggressiveMode = false
  let pkeLevel = 0
  let loading = true
  let error = ''

  interface ExtensionState {
    blockingEnabled: boolean
    ghostCount: number
    aggressiveMode: boolean
    soundEnabled: boolean
    whitelist: string[]
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

        // Calculate PKE meter level (0-100)
        pkeLevel = Math.min((ghostCount / 10) * 100, 100)
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

  // Calculate PKE level reactively
  $: pkeLevel = Math.min((ghostCount / 10) * 100, 100)
</script>

<div class="popup-container bg-dark-bg text-ghost-white p-6 w-80 min-h-[300px]">
  <h1 class="text-3xl font-bold text-center mb-4 text-neon-green">AdBusters 👻</h1>

  {#if loading}
    <div class="text-center py-8">
      <div class="text-spectral-blue text-lg">Loading...</div>
    </div>
  {:else}
    <button
      class="w-full py-4 px-6 rounded-lg text-xl font-bold mb-4 transition-all transform hover:scale-105"
      class:bg-neon-green={blockingEnabled}
      class:text-dark-bg={blockingEnabled}
      class:shadow-glow-green={blockingEnabled}
      class:bg-gray-600={!blockingEnabled}
      class:text-gray-300={!blockingEnabled}
      on:click={toggleBlocking}
    >
      {blockingEnabled ? '👻 Trap Ads' : '▶️ Start Trapping'}
    </button>

    <div class="ghost-counter text-center text-2xl mb-4">
      Ghosts Trapped: <span class="text-pumpkin-orange font-bold">{ghostCount}</span>
    </div>

    <!-- PKE Meter -->
    <div class="pke-meter-container mb-4">
      <div class="text-xs text-spectral-blue mb-1 font-mono">PKE METER</div>
      <div class="pke-meter">
        <div
          class="pke-meter-fill"
          style="width: {pkeLevel}%"
          class:animate-pulse={pkeLevel > 80}
        ></div>
      </div>
      <div class="text-xs text-gray-400 mt-1 text-right font-mono">{Math.round(pkeLevel)}%</div>
    </div>

    <label
      class="flex items-center gap-2 cursor-pointer mb-4 p-3 rounded bg-gray-800 hover:bg-gray-700 transition-colors"
    >
      <input
        type="checkbox"
        bind:checked={aggressiveMode}
        on:change={toggleAggressive}
        class="w-5 h-5"
      />
      <span class="text-spectral-blue font-bold">⚡ Cross the Streams</span>
    </label>

    {#if aggressiveMode}
      <div
        class="warning-message text-xs text-pumpkin-orange bg-gray-800 p-2 rounded mb-2 border border-pumpkin-orange"
      >
        ⚠️ Don't cross the streams! Aggressive blocking active.
      </div>
    {/if}

    {#if error}
      <div class="error-message text-xs text-red-400 bg-gray-800 p-2 rounded">
        {error}
      </div>
    {/if}
  {/if}
</div>

<style>
  .pke-meter {
    width: 100%;
    height: 20px;
    background: #1a1a1a;
    border: 2px solid #39ff14;
    border-radius: 10px;
    overflow: hidden;
  }

  .pke-meter-fill {
    height: 100%;
    background: linear-gradient(90deg, #39ff14, #00d9ff);
    transition: width 0.3s ease-out;
    box-shadow: 0 0 10px #39ff14;
  }
</style>
