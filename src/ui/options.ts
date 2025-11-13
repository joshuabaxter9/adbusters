import Options from './Options.svelte'
import './styles.css'

const app = new Options({
  target: document.getElementById('app')!,
})

export default app
