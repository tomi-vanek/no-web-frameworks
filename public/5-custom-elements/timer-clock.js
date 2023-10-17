class TimerClock extends HTMLElement {
  timer = null
  clockElem = null
  toggleElem = null
  root = null

  get html () {
    return `
<span clock>...starting</span>
<br />
<button toggle>Toggle clock</button>

<style>
  span[clock] {
    background-color: gainsboro;
  }
      
  :host([active]) span[clock],
  todo-clock[active] span[toggle] {
    background-color: yellow;
  }
</style>
`
  }

  get time () {
    return this.getAttribute('time')
  }

  set time (value) {
    return this.setAttribute('time', value)
  }

  get active () {
    return this.hasAttribute('active')
  }

  set active (value) {
    if (value) {
      this.setAttribute('active', '')
    } else {
      this.removeAttribute('active')
    }
  }

  constructor () {
    super()
    console.log(this.constructor.name, 'constructor')

    const templateElem = document.createElement('template')
    templateElem.innerHTML = this.html
    const htmlFragment = templateElem.content.cloneNode(true)

    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(htmlFragment)
  }

  connectedCallback () {
    console.log(this.constructor.name, 'connected to DOM')

    this.clockElem = this.shadowRoot.querySelector('[clock]')
    this.toggleElem = this.shadowRoot.querySelector('button[toggle]')

    this.toggleElem.addEventListener('click', this.toggleActive.bind(this))
    this.addEventListener('clock-tick', this.clockTickHandler)

    const oneSecond = 1000 // ms
    this.timer = setInterval(this.tick.bind(this), oneSecond)
  }

  disconnectedCallback () {
    console.log(this.constructor.name, 'disconnected from DOM')

    clearInterval(this.timer)
  }

  static get observedAttributes () {
    return [
      'active',
      'time'
    ]
  }

  attributeChangedCallback (name, _oldval, _newval) {
    console.log(this.constructor.name, `attribute ${name} changed`)

    this.render()
  }

  toggleActive (event) {
    event.stopPropagation()
    this.active = !this.active
  }

  tick () {
    if (this.active) {
      const currentTime = new Date().toISOString().split(/[TZ.]/g)[1]

      const event = new CustomEvent(
        'clock-tick',
        {
          bubbles: true, // propagated in hierarchy
          composed: true, // "penetrate" through shadow root up
          detail: currentTime // event data
        }
      )

      this.dispatchEvent(event)
    }
  }

  clockTickHandler (event) {
    this.time = event.detail
  }

  render () {
    if (this.clockElem) {
      const face = this.active ? '😃 Current' : '😴 Stopped'
      const clockText = `${face} time - UTC: ${this.time}`
      this.clockElem.innerText = clockText

      const buttonText = this.active ? '🧍‍♂️ Stop' : '🏃‍♂️ Run'
      this.toggleElem.innerText = buttonText
    }
  }
}

console.log('define', 'TimerClock')
window.customElements.define('timer-clock', TimerClock)
