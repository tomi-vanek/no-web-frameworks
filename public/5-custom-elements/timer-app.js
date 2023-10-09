class TimerApp extends HTMLElement {
  html = `
<div>
  <h2>TimerApp - title in component</h2>
  <div>
    <slot></slot>
  </div>
</div>

<style>
  h2 {
    color: red
  }
</style>
`
  constructor () {
    super()
    console.log(this.constructor.name, 'constructor')

    const templateElem = document.createElement('template')
    templateElem.innerHTML = this.html
    const htmlFragment = templateElem.content.cloneNode(true)

    // Instantiate and attach the shadow root
    // this.appendChild(htmlFragment)
    this.root = this.attachShadow({ mode: 'open' })
    this.root.appendChild(htmlFragment)
  }
}

console.log('define', 'TimerApp')
window.customElements.define('timer-app', TimerApp)
