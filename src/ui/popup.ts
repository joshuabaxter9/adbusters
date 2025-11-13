import Popup from './Popup.svelte'
import './styles.css'

const app = new Popup({
  target: document.getElementById('app')!,
})

export default app
