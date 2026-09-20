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

for (const eventName of ['copy', 'cut', 'contextmenu'] as const) {
  output.addEventListener(eventName, (event) => event.preventDefault())
}

function printLine(text: string, className = '') {
  const line = document.createElement('div')
  line.className = `line ${className}`
  line.textContent = text
  output.append(line)
  while (output.children.length > MAX_HISTORY) output.firstElementChild?.remove()
  output.scrollTop = output.scrollHeight
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

export function fibonacciSequence(maxTerms = Number.MAX_SAFE_INTEGER): number[] {
  const sequence: number[] = []
  let previous = 0
  let current = 1

  while (sequence.length < maxTerms && current <= Number.MAX_SAFE_INTEGER - previous) {
    sequence.push(previous)
    const next = previous + current
    previous = current
    current = next
  }

  return sequence
}

export function primeSequence(maxTerms = Number.MAX_SAFE_INTEGER): number[] {
  const sequence: number[] = []
  let candidate = 2

  while (sequence.length < maxTerms && candidate <= Number.MAX_SAFE_INTEGER) {
    let isPrime = true

    for (const prime of sequence) {
      if (prime > Math.sqrt(candidate)) break
      if (candidate % prime === 0) {
        isPrime = false
        break
      }
    }

    if (isPrime) sequence.push(candidate)
    candidate += 1
  }

  return sequence
}

export function harmonicSeries(maxTerms = Number.MAX_SAFE_INTEGER): number[] {
  const sequence: number[] = []
  let sum = 0
  let denominator = 1

  while (sequence.length < maxTerms && Number.isFinite(sum)) {
    sum += 1 / denominator
    sequence.push(sum)
    denominator += 1
  }

  return sequence
}

export function powersOfTwo(maxTerms = Number.MAX_SAFE_INTEGER): number[] {
  const sequence: number[] = []
  let value = 1

  while (sequence.length < maxTerms && value <= Number.MAX_SAFE_INTEGER) {
    sequence.push(value)
    value *= 2
  }

  return sequence
}

function randomPacketSize(): number {
  return Math.floor(Math.random() * 65) + 64
}

function fibonacciTerm(index: number): number {
  let previous = 0
  let current = 1

  for (let term = 0; term < index; term += 1) {
    const next = previous + current
    previous = current
    current = next
  }

  return previous
}

function primeTerm(index: number): number {
  let candidate = 2
  let found = 0

  while (true) {
    let isPrime = true

    for (let divisor = 2; divisor <= Math.sqrt(candidate); divisor += 1) {
      if (candidate % divisor === 0) {
        isPrime = false
        break
      }
    }

    if (isPrime) {
      if (found === index) return candidate
      found += 1
    }

    candidate += 1
  }
}

function challengeTerm(hostNumber: number, index: number): number {
  switch (hostNumber) {
    case 1:
      return fibonacciTerm(index)
    case 2:
      return primeTerm(index)
    case 3:
      return 10000 / (index + 1)
    case 4:
      return index + 1
    default:
      return 0
  }
}

function challengeDelayMs(hostNumber: number, index: number, sequenceValue: number): number {
  switch (hostNumber) {
    case 1:
      return Math.max(100, sequenceValue * 100)
    case 2:
      return sequenceValue * 100
    case 3:
      return Math.max(1, Math.floor(sequenceValue))
    case 4:
      return (index + 1) * 200
    default:
      return 100
  }
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

async function simulatePing(ip: string) {
  if (!canRun()) return

  if (ip === '192.0.2.1') {
    printLine(`$ ping ${ip}`, 'command')
    printLine(`PING ${ip} (192.0.2.1) 56(84) bytes of data.`)
    const latencyMs = 18
    await wait(800)
    printLine(`83 bytes from ${ip}: icmp_seq=1 ttl=57 time=${latencyMs}.4 ms`, 'success')
    await wait(200)
    printLine(`69 bytes from ${ip}: icmp_seq=2 ttl=57 time=${latencyMs}.1 ms`, 'success')
    await wait(300)
    printLine(`73 bytes from ${ip}: icmp_seq=3 ttl=57 time=${latencyMs}.8 ms`, 'success')
    await wait(100)
    printLine(`67 bytes from ${ip}: icmp_seq=4 ttl=57 time=${latencyMs}.6 ms`, 'success')
    await wait(400)
    printLine(`123 bytes from ${ip}: icmp_seq=5 ttl=57 time=${latencyMs}.3 ms`, 'success')
    printLine(`--- ${ip} ping statistics ---`)
    printLine('5 packets transmitted, 5 received, 0% packet loss, time 1800ms', 'success')
    printLine(`rtt min/avg/max = ${latencyMs}.1/${latencyMs}.4/${latencyMs}.8 ms`, 'success')
    return
  }

  if (ip === '198.51.100.7') {
    printLine(`$ ping ${ip}`, 'command')
    printLine(`PING ${ip} (198.51.100.7) 56(84) bytes of data.`)
    const latencyMs = 32
    await wait(800)
    printLine(`108 bytes from ${ip}: icmp_seq=1 ttl=56 time=${latencyMs}.7 ms`, 'success')
    await wait(200)
    printLine(`102 bytes from ${ip}: icmp_seq=2 ttl=56 time=${latencyMs}.1 ms`, 'success')
    await wait(300)
    printLine(`115 bytes from ${ip}: icmp_seq=3 ttl=56 time=${latencyMs}.5 ms`, 'success')
    await wait(800)
    printLine(`95 bytes from ${ip}: icmp_seq=4 ttl=56 time=${latencyMs}.9 ms`, 'success')
    await wait(800)
    printLine(`108 bytes from ${ip}: icmp_seq=5 ttl=56 time=${latencyMs}.4 ms`, 'success')
    await wait(400)
    printLine(`117 bytes from ${ip}: icmp_seq=6 ttl=56 time=${latencyMs}.2 ms`, 'success')
    await wait(100)
    printLine(`116 bytes from ${ip}: icmp_seq=7 ttl=56 time=${latencyMs}.8 ms`, 'success')
    await wait(100)
    printLine(`104 bytes from ${ip}: icmp_seq=8 ttl=56 time=${latencyMs}.6 ms`, 'success')
    await wait(200)
    printLine(`105 bytes from ${ip}: icmp_seq=9 ttl=56 time=${latencyMs}.3 ms`, 'success')
    await wait(80)
    printLine(`102 bytes from ${ip}: icmp_seq=10 ttl=56 time=${latencyMs}.7 ms`, 'success')
    await wait(200)
    printLine(`114 bytes from ${ip}: icmp_seq=11 ttl=56 time=${latencyMs}.5 ms`, 'success')
    await wait(100)
    printLine(`115 bytes from ${ip}: icmp_seq=12 ttl=56 time=${latencyMs}.1 ms`, 'success')
    printLine(`--- ${ip} ping statistics ---`)
    printLine('12 packets transmitted, 12 received, 0% packet loss, time 4080ms', 'success')
    printLine(`rtt min/avg/max = ${latencyMs}.1/${latencyMs}.5/${latencyMs}.9 ms`, 'success')
    return
  }

  if (ip === '203.0.113.42') {
    printLine(`$ ping ${ip}`, 'command')
    printLine(`PING ${ip} (203.0.113.42) 56(84) bytes of data.`)
    const latencyMs = 47
    await wait(800)
    printLine(`125 bytes from ${ip}: icmp_seq=1 ttl=55 time=${latencyMs}.3 ms`, 'success')
    printLine(`--- ${ip} ping statistics ---`)
    printLine('1 packets transmitted, 1 received, 0% packet loss, time 800ms', 'success')
    printLine(`rtt min/avg/max = ${latencyMs}.3/${latencyMs}.3/${latencyMs}.3 ms`, 'success')
  }

  const challengeMatch = ip.match(/^189\.168\.95\.([1-4])$/)
  if (challengeMatch) {
    const hostNumber = Number(challengeMatch[1])
    const challengeDeadline = Date.now() + 60_000

    printLine(`$ ping ${ip}`, 'command')
    printLine(`PING ${ip} (189.168.95.${hostNumber}) 56(84) bytes of data.`)

    let index = 0
    while (Date.now() < challengeDeadline) {
      const sequenceValue = challengeTerm(hostNumber, index)
      const latencyMs = challengeDelayMs(hostNumber, index, sequenceValue)
      const sequenceOffset = Math.abs(Math.trunc(Number(sequenceValue))) % 16
      const packetSize = randomPacketSize() + sequenceOffset
      const remainingMs = challengeDeadline - Date.now()
      await wait(Math.min(latencyMs, remainingMs))
      if (Date.now() >= challengeDeadline) break
      printLine(`${packetSize} bytes from ${ip}: icmp_seq=${index + 1} ttl=${60 - hostNumber} time=${latencyMs.toFixed(1)} ms`, 'success')
      index += 1
    }

    output.replaceChildren()
  }

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
