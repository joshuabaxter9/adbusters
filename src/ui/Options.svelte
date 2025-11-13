<script lang="ts">
  import { onMount } from 'svelte'

  let soundEnabled = true
  let whitelist: string[] = []
  let newDomain = ''

  onMount(async () => {
    // TODO: Load settings from storage
  })

  async function toggleSound() {
    // TODO: Update storage
  }

  async function addDomain() {
    // TODO: Add domain to whitelist
  }

  async function removeDomain(domain: string) {
    // TODO: Remove domain from whitelist
  }

  async function refreshData() {
    // TODO: Refresh filter lists
  }
</script>

<div class="options-container bg-dark-bg text-ghost-white p-8 min-h-screen">
  <h1 class="text-4xl font-bold mb-8 text-neon-green">AdBusters Settings</h1>

  <section class="mb-8">
    <h2 class="text-2xl font-bold mb-4 text-pumpkin-orange">Sound Effects</h2>
    <label class="flex items-center gap-2 cursor-pointer">
      <input 
        type="checkbox" 
        bind:checked={soundEnabled} 
        on:change={toggleSound}
        class="w-5 h-5"
      />
      <span>Enable trap sounds</span>
    </label>
  </section>

  <section class="mb-8">
    <h2 class="text-2xl font-bold mb-4 text-pumpkin-orange">Whitelisted Domains</h2>
    <div class="flex gap-2 mb-4">
      <input 
        bind:value={newDomain}
        placeholder="example.com"
        class="flex-1 px-4 py-2 rounded bg-gray-800 text-white"
      />
      <button 
        on:click={addDomain}
        class="px-6 py-2 bg-neon-green text-dark-bg rounded font-bold"
      >
        Add
      </button>
    </div>
    <ul class="space-y-2">
      {#each whitelist as domain}
        <li class="flex justify-between items-center bg-gray-800 px-4 py-2 rounded">
          <span>{domain}</span>
          <button 
            on:click={() => removeDomain(domain)}
            class="text-red-500 hover:text-red-400"
          >
            Remove
          </button>
        </li>
      {/each}
    </ul>
  </section>

  <button 
    on:click={refreshData}
    class="px-6 py-3 bg-spectral-blue text-dark-bg rounded font-bold"
  >
    Refresh Ghost Data
  </button>
</div>
