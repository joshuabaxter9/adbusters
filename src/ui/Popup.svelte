<script lang="ts">
  import { onMount } from 'svelte'

  let blockingEnabled = false
  let ghostCount = 0
  let aggressiveMode = false

  onMount(async () => {
    // TODO: Load state from service worker
  })

  async function toggleBlocking() {
    // TODO: Send message to service worker
  }

  async function toggleAggressive() {
    // TODO: Send message to service worker
  }
</script>

<div class="popup-container bg-dark-bg text-ghost-white p-6 w-80">
  <h1 class="text-3xl font-bold text-center mb-4 text-neon-green">
    AdBusters 👻
  </h1>
  
  <button 
    class="w-full py-4 px-6 rounded-lg text-xl font-bold mb-4 transition-all"
    class:bg-neon-green={blockingEnabled}
    class:bg-gray-600={!blockingEnabled}
    on:click={toggleBlocking}
  >
    {blockingEnabled ? 'Trap Ads 👻' : 'Start Trapping'}
  </button>

  <div class="ghost-counter text-center text-2xl mb-4">
    Ghosts Trapped: <span class="text-pumpkin-orange font-bold">{ghostCount}</span>
  </div>

  <div class="pke-meter mb-4">
    <!-- TODO: Add PKE meter component -->
  </div>

  <label class="flex items-center gap-2 cursor-pointer">
    <input 
      type="checkbox" 
      bind:checked={aggressiveMode} 
      on:change={toggleAggressive}
      class="w-5 h-5"
    />
    <span class="text-spectral-blue">Cross the Streams ⚡</span>
  </label>
</div>
