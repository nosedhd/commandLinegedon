import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')!
const MAX_HISTORY = 80
const RATE_LIMIT = 12
const WINDOW_MS = 30_000
const attempts: number[] = []

app.innerHTML = `
  <main class="shell">
    <header class="topbar">
      <div class="brand"><span class="brand-mark">&gt;_</span><span>NET-ECHO</span></div>
      <div class="mode"><span class="pulse"></span> SIMULADOR DE PING</div>
    </header>

    <section class="intro" aria-labelledby="title">
      <p class="eyebrow">HERRAMIENTA LOCAL / TERMINAL</p>
      <h1 id="title">Simulador de <em>ping</em></h1>
      <p class="lede">Escribe un comando para generar una respuesta simulada. No se envían paquetes a Internet.</p>
    </section>

    <section class="workspace" aria-label="Terminal simulator">
      <div class="terminal-card">
        <div class="terminal-head">
          <div class="window-dots" aria-hidden="true"><i></i><i></i><i></i></div>
          <span>C:\NET-ECHO</span>
          <span class="terminal-state">LISTO</span>
        </div>
        <div id="output" class="terminal-output" role="log" aria-live="polite" aria-label="Salida de la terminal"></div>
        <form id="command-form" class="command-line">
          <label for="command-input"><span class="prompt">C:\NET-ECHO&gt;</span><span class="sr-only">Comando</span></label>
          <input id="command-input" name="command" autocomplete="off" spellcheck="false" placeholder="ping 192.0.2.1" maxlength="64" />
          <button type="submit" aria-label="Ejecutar comando">RUN <span aria-hidden="true">↵</span></button>
        </form>
      </div>

      <aside class="control-panel">
        <div class="panel-label">ATAJOS</div>
        <h2>Direcciones de prueba</h2>
        <p>Haz clic para cargar un comando en la consola.</p>
        <div class="quick-targets" aria-label="Targets de ejemplo">
          <button type="button" data-target="192.0.2.1">192.0.2.1</button>
          <button type="button" data-target="198.51.100.7">198.51.100.7</button>
          <button type="button" data-target="203.0.113.42">203.0.113.42</button>
        </div>
        <div class="security-note"><span>i</span><div><strong>SIMULACIÓN</strong><br><small>La aplicación no usa red ni ejecuta comandos del sistema.</small></div></div>
      </aside>
    </section>

    <footer class="footer-grid">
      <div><span class="footer-key">COMANDOS</span><strong>ping &lt;ip&gt; · help · clear</strong></div>
      <div><span class="footer-key">VALIDACIÓN</span><strong>Solo IPv4 · 12 intentos / 30 s</strong></div>
      <div><span class="footer-key">ESTADO</span><strong class="online">SIMULACIÓN LOCAL</strong></div>
    </footer>
  </main>
`

const output = document.querySelector<HTMLDivElement>('#output')!
const form = document.querySelector<HTMLFormElement>('#command-form')!
const input = document.querySelector<HTMLInputElement>('#command-input')!

function printLine(text: string, className = '') {
  const line = document.createElement('div')
  line.className = `line ${className}`
  line.textContent = text
  output.append(line)
  while (output.children.length > MAX_HISTORY) output.firstElementChild?.remove()
  output.scrollTop = output.scrollHeight
}

function validIPv4(value: string): boolean {
  const octets = value.split('.')
  return octets.length === 4 && octets.every((octet) => /^(0|[1-9]\d{0,2})$/.test(octet) && Number(octet) <= 255)
}

function canRun(): boolean {
  const now = Date.now()
  while (attempts[0] !== undefined && now - attempts[0] > WINDOW_MS) attempts.shift()
  if (attempts.length >= RATE_LIMIT) {
    printLine('rate limit reached · try again in a moment', 'error')
    return false
  }
  attempts.push(now)
  return true
}

function simulatePing(ip: string) {
  if (!canRun()) return
  printLine(`$ ping ${ip}`, 'command')
  printLine(`PING ${ip} (${ip}) 56(84) bytes of data.`)
  const latency = 8 + (ip.split('.').reduce((sum, octet) => sum + Number(octet), 0) % 31)
  window.setTimeout(() => {
    printLine(`64 bytes from ${ip}: icmp_seq=1 ttl=57 time=${latency}.${ip.length} ms`, 'success')
    printLine(`--- ${ip} ping statistics ---`)
    printLine('1 packets transmitted, 1 received, 0% packet loss, time 0ms', 'success')
    printLine(`rtt min/avg/max = ${latency}.${ip.length}/${latency}.${ip.length}/${latency}.${ip.length} ms`, 'success')
  }, 280)
}

function runCommand(rawCommand: string) {
  const command = rawCommand.trim().replace(/\s+/g, ' ')
  const [verb, value] = command.split(' ')
  if (verb === 'clear') {
    output.replaceChildren()
    return
  }
  if (verb === 'help' || !command) {
    printLine('available: ping <ipv4> · clear · help', 'muted')
    return
  }
  if (verb !== 'ping' || !value || !validIPv4(value)) {
    printLine('error: use ping followed by a valid IPv4 address', 'error')
    return
  }
  simulatePing(value)
}

printLine('NET//ECHO terminal v1.0.0', 'muted')
printLine('simulation ready · type help for commands', 'muted')

form.addEventListener('submit', (event) => {
  event.preventDefault()
  runCommand(input.value)
  input.value = ''
  input.focus()
})

document.querySelectorAll<HTMLButtonElement>('[data-target]').forEach((button) => {
  button.addEventListener('click', () => {
    input.value = `ping ${button.dataset.target}`
    input.focus()
  })
})
