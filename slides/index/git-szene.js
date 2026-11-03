/*
  <git-szene> — animierte Abbildung für Übungsblätter: zeigt Schritt für
  Schritt, was ein Git-Befehl in den beteiligten Repositories bewirkt.

  Die Szene steht als kleine Befehlsfolge im Markdown. Das Element rechnet
  daraus selbst die Zustände aus (ein Git im Kleinen) und zeichnet sie; man
  beschreibt also, was getan wird, nicht, wie das Bild danach aussieht.

    <git-szene orte="fork lokal" titel="Push und Pull">
    <script type="text/plain">
    fork init main 7b0e4d2 c13fa1a
    lokal clone fork
    = Ausgangslage: Fork und lokales Repository sind gleichauf.
    > $ git switch -c thema | Ein neuer Branch beginnt dort, wo `main` steht.
    lokal switch -c thema
    > $ git commit -m "…" | Der Commit entsteht **lokal**.
    lokal commit 3f9a2c1
    > $ git push | Erst der Push überträgt ihn in den Fork.
    lokal push
    </script>
    </git-szene>

  Zwischen <git-szene> und </script> darf keine Leerzeile stehen, sonst
  endet für Markdown der HTML-Block. In der Ansicht der Markdown-Datei auf
  GitHub erscheint die Szene nicht; dort entfallen Skripte und fremde Elemente.

  Soll die Szene durch eine Aufgabe führen, steht die Anleitung zu jedem
  Schritt als gewöhnliches Markdown im Element — nach einer Leerzeile hinter
  </script>, je Schritt ein Abschnitt mit Überschrift der dritten Ebene:

    <git-szene orte="fork lokal" titel="Push und Pull">
    <script type="text/plain">
    …
    > $ git switch -c thema
    lokal switch -c thema
    …
    </script>

    ### 1. Branch anlegen

    Ein neuer Branch beginnt dort, wo `main` steht.

    **Terminal** …

    ### 2. Commit anlegen

    …

    </git-szene>

  Die Abschnitte gehören der Reihe nach zu den Schritten (`>`); ihre Zahl
  muss übereinstimmen. Was vor der ersten Überschrift steht, gehört zur
  Ausgangslage. Die Erläuterung eines Schritts — was dabei geschieht — steht
  dann als erster Absatz seines Abschnitts, nicht hinter `|` in der Szene: So
  ist sie auch auf GitHub lesbar und steht nur an einer Stelle. Unter dem Bild
  steht je Schritt die Überschrift (ohne ihre Nummer, die trägt der Schritt)
  und sein Abschnitt: lesen, ausführen, weiterklicken. Alle Schritte stehen dort als
  Liste; der aktuelle ist hervorgehoben und aufgeklappt, die übrigen sind
  Zeilen, die zu ihrem Schritt führen. Auf GitHub bleibt die Anleitung
  als fortlaufender Text lesbar.

  orte    welche Streifen die Szene zeigt, in fester Reihenfolge von oben
          nach unten: `original`, `fork` (beide auf GitHub), `lokal` und
          `dateien` (Arbeitsverzeichnis und Vormerkung, beide auf dem Rechner)
  titel   Überschrift der Abbildung

  Zeilen der Szene:
    # …                 Kommentar
    = Text              Erläuterung der Ausgangslage
    > Marke | Text      beginnt einen Schritt; eine Marke mit `$ ` gilt als
                        Befehl im Terminal, jede andere als Handgriff
                        (»Browser: Fork«). Im Text: `code`, **fett**, *kursiv*.
                        Mit Anleitung entfällt `| Text`.
    alles Weitere       Anweisungen; vor dem ersten Schritt bauen sie die
                        Ausgangslage auf

  Anweisungen (<repo> ist original, fork oder lokal):
    <repo> init <branch> <id> …     Repository mit einer Kette von Commits
    fork von original               Fork anlegen
    lokal clone fork                klonen, HEAD steht auf main
    lokal switch [-c] <branch>      Branch wechseln, mit -c vorher anlegen
    lokal edit <datei> [neu]        Datei im Arbeitsverzeichnis ändern
    lokal add <datei>               Änderung vormerken
    <repo> commit <id> [<branch>]   Commit; ohne Branch auf dem von HEAD
    lokal push | lokal pull         Branch von HEAD mit dem Fork abgleichen
    fork sync                       main des Forks auf den Stand des Originals
    pr open <branch>                Pull Request vom Fork an das Original
    pr merge <id>                   Pull Request übernehmen (Merge-Commit)

  Gleiche Commits stehen in allen Streifen an derselben Stelle: Was ein
  Repository schon hat und was ihm fehlt, liest man senkrecht ab. Farben:
  Branch-Marken in THM Grau, HEAD und der Pull Request in THM Grün, der
  Zustand der Dateien rot und grün wie bei `git status`.
*/
const NS = 'http://www.w3.org/2000/svg'

function svg(name, attribute = {}, ...kinder) {
  const e = document.createElementNS(NS, name)
  for (const [k, w] of Object.entries(attribute)) e.setAttribute(k, w)
  e.append(...kinder)
  return e
}

function html(name, attribute = {}, ...kinder) {
  const e = document.createElement(name)
  for (const [k, w] of Object.entries(attribute)) e.setAttribute(k, w)
  e.append(...kinder)
  return e
}

const sicher = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
/** Erläuterungstext: `code`, **fett** und *kursiv*, sonst nichts. */
const auszeichnen = s => sicher(s)
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/\*([^*]+)\*/g, '<em>$1</em>')

// Lucide-Symbole der Schaltflächen
const SYMBOL = {
  anfang: '<polygon points="19 20 9 12 19 4 19 20"/><line x1="5" x2="5" y1="19" y2="5"/>',
  zurueck: '<path d="m15 18-6-6 6-6"/>',
  weiter: '<path d="m9 18 6-6-6-6"/>',
  abspielen: '<polygon points="6 3 20 12 6 21 6 3"/>',
  anhalten: '<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>',
  gross: '<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',
}
const symbol = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${SYMBOL[name]}</svg>`

// ---- Szene lesen ----
function lies(text) {
  const schritte = [{ marke: 'Ausgangslage', text: '', ops: [] }]
  for (const roh of text.split('\n')) {
    const zeile = roh.trim()
    if (!zeile || zeile.startsWith('#')) continue
    if (zeile.startsWith('=')) schritte[0].text = zeile.slice(1).trim()
    else if (zeile.startsWith('>')) {
      const [marke, ...rest] = zeile.slice(1).split('|')
      schritte.push({ marke: marke.trim(), text: rest.join('|').trim(), ops: [] })
    }
    else schritte.at(-1).ops.push(zeile.split(/\s+/))
  }
  return schritte
}

// ---- Git im Kleinen: aus den Anweisungen die Zustände ausrechnen ----
function rechne(schritte) {
  // Commits gelten für die ganze Szene; ihr Rasterplatz ist in allen Repositories derselbe
  const commits = new Map()
  const z = { repos: {}, dateien: {}, pr: null }
  let e

  const lege = (id, eltern, reihe) => commits.set(id, {
    id, eltern, reihe,
    spalte: eltern.length ? Math.max(...eltern.map(v => commits.get(v).spalte)) + 1 : 0,
  })
  const erreichbar = (id, menge = new Set()) => {
    if (menge.has(id)) return menge
    menge.add(id)
    for (const v of commits.get(id).eltern) erreichbar(v, menge)
    return menge
  }
  /** Überträgt, was `nach` von der Spitze `id` aus noch fehlt. */
  const hole = (von, nach, id) => {
    for (const c of [...erreichbar(id)].sort((a, b) => commits.get(a).spalte - commits.get(b).spalte)) {
      if (z.repos[nach].commits.includes(c)) continue
      z.repos[nach].commits.push(c)
      e.fluege.set(`${nach}:${c}`, von)
    }
  }
  const abgleich = (von, nach, branch) => {
    hole(von, nach, z.repos[von].branches[branch])
    z.repos[nach].branches[branch] = z.repos[von].branches[branch]
  }

  function fuehreAus([wer, was, ...arg]) {
    const repo = z.repos[wer]
    if (wer === 'pr' && was === 'open') {
      z.pr = { branch: arg[0], zustand: 'offen' }
      e.pfeile.add('auf:original')
    }
    else if (wer === 'pr' && was === 'merge') {
      const spitze = z.repos.fork.branches[z.pr.branch]
      hole('fork', 'original', spitze)
      lege(arg[0], [z.repos.original.branches.main, spitze], 0)
      z.repos.original.commits.push(arg[0])
      z.repos.original.branches.main = arg[0]
      e.frisch.add(`original:${arg[0]}`)
      e.pfeile.add('auf:original')
      z.pr.zustand = 'übernommen'
    }
    else if (was === 'init') {
      const [branch, ...ids] = arg
      ids.forEach((id, i) => lege(id, i ? [ids[i - 1]] : [], 0))
      z.repos[wer] = { commits: ids, branches: { [branch]: ids.at(-1) }, head: wer === 'lokal' ? branch : null }
    }
    else if (was === 'von' || was === 'clone') {
      const quelle = z.repos[arg[0]]
      // HEAD steht auf main — oder, heißt der Hauptstand der Quelle anders, auf deren erstem Branch
      const haupt = 'main' in quelle.branches ? 'main' : Object.keys(quelle.branches)[0]
      z.repos[wer] = { commits: [], branches: { ...quelle.branches }, head: wer === 'lokal' ? haupt : null }
      for (const id of Object.values(quelle.branches)) hole(arg[0], wer, id)
      e.pfeile.add(`ab:${arg[0]}`)
    }
    else if (was === 'switch') {
      const name = arg.at(-1)
      if (arg[0] === '-c') repo.branches[name] = repo.branches[repo.head]
      repo.head = name
    }
    else if (was === 'edit') z.dateien[arg[0]] = { ort: 'arbeit', status: arg[1] ?? 'geändert' }
    else if (was === 'add') {
      z.dateien[arg[0]].ort = 'vorgemerkt'
      e.pfeile.add('add')
    }
    else if (was === 'commit') {
      const [id, branch = repo.head] = arg
      lege(id, [repo.branches[branch]], branch === 'main' ? 0 : 1)
      repo.commits.push(id)
      repo.branches[branch] = id
      e.frisch.add(`${wer}:${id}`)
      if (wer === 'lokal') {
        const vorgemerkt = Object.keys(z.dateien).filter(d => z.dateien[d].ort === 'vorgemerkt')
        for (const d of vorgemerkt) delete z.dateien[d]
        if (vorgemerkt.length) {
          e.ausDateien = { id, dateien: vorgemerkt }
          e.pfeile.add('commit')
        }
      }
    }
    else if (was === 'push') { abgleich('lokal', 'fork', repo.head); e.pfeile.add('auf:fork') }
    else if (was === 'pull') { abgleich('fork', 'lokal', repo.head); e.pfeile.add('ab:fork') }
    else if (was === 'sync') { abgleich('original', 'fork', 'main'); e.pfeile.add('ab:original') }
    else console.warn('git-szene: unbekannte Anweisung', [wer, was, ...arg].join(' '))
  }

  const leer = () => ({ pfeile: new Set(), fluege: new Map(), frisch: new Set(), ausDateien: null })
  const zustaende = schritte.map((s, i) => {
    e = leer()
    s.ops.forEach(fuehreAus)
    // Die Ausgangslage ist einfach da: Ihr Aufbau zählt nicht als Ereignis
    return { ...s, zustand: structuredClone(z), ereignis: i ? e : leer() }
  })
  return { commits, zustaende }
}

// ---- Maße der Bühne (SVG-Einheiten) ----
const B = 760          // Breite
const LINKS = 20       // Streifen von … bis
const RECHTS = 740
const X0 = 226         // Mitte des ersten Commits
const KNOTEN = { w: 60, h: 24 }
const REIHE = [46, 80] // Mitte der beiden Reihen im Streifen: main, übrige Branches
const MARKE = [19, 107] // Mitte der Marken darüber und darunter
const ZEICHEN = 6.9    // Breite eines Zeichens der Festbreitenschrift bei 11.5px

const NAMEN = {
  original: ['Originalrepository', 'Sie dürfen nur lesen'],
  fork: ['Ihr Fork', 'Ihre Kopie zum Schreiben'],
  lokal: ['Lokales Repository', 'arbeitet auch ohne Netz'],
}
// Arbeitsverzeichnis und Vormerkung teilen sich den untersten Streifen
const FACH = {
  arbeit: { x: LINKS, w: 343, name: 'Arbeitsverzeichnis', leer: 'keine offenen Änderungen' },
  vorgemerkt: { x: 397, w: 343, name: 'Vorgemerkt für den nächsten Commit', leer: 'nichts vorgemerkt' },
}

function lage(orte) {
  const baender = [['GitHub', ['original', 'fork']], ['Ihr Rechner', ['lokal', 'dateien']]]
    .map(([name, liste]) => ({ name, orte: liste.filter(o => orte.includes(o)) }))
    .filter(b => b.orte.length)
  const streifen = {}
  let y = 0
  for (const b of baender) {
    b.y = y
    y += 24
    b.orte.forEach((o, i) => {
      if (i) y += 30
      streifen[o] = { y, h: o === 'dateien' ? 62 : 126 }
      y += streifen[o].h
    })
    y += 10
    b.h = y - b.y
    y += 18
  }
  return { baender, streifen, hoehe: y - 18 }
}

let zaehler = 0

class GitSzene extends HTMLElement {
  #figur
  #buehne
  #ebenen = {}
  #teile = new Map()
  #fest = { streifen: {}, pfeile: {}, leer: {} }
  #lage
  #commits
  #zustaende
  #dx
  #jetzt = 0
  #gestartet = false
  #takt = null
  #knoepfe = {}
  // Anleitung je Schritt (Überschrift und Inhalt), wenn die Szene durch eine Aufgabe führt
  #anleitung = null

  connectedCallback() {
    if (this.#gestartet) return
    this.#gestartet = true
    // Ein Fehler in der Szene (Tippfehler, Pull ohne Branch im Fork …) soll
    // sichtbar sein und nicht als leere Fläche auf der Seite stehen
    // Die Anleitung im Element ist auch ohne Abbildung brauchbar: Sie bleibt unter dem Hinweis stehen
    const anleitung = [...this.children].filter(k => k.tagName !== 'SCRIPT')
    try { this.#starte() }
    catch (fehler) {
      console.error('git-szene:', fehler)
      const hinweis = html('p', { class: 'gs-fehler' })
      hinweis.textContent = `Die Abbildung${this.getAttribute('titel') ? ` »${this.getAttribute('titel')}«` : ''} lässt sich nicht aufbauen: ${fehler.message}`
      this.replaceChildren(hinweis, ...anleitung)
    }
  }

  #starte() {
    const { commits, zustaende } = rechne(lies(this.querySelector('script')?.textContent ?? ''))
    this.#commits = commits
    this.#zustaende = zustaende
    this.#anleitung = this.#liesAnleitung()
    const orte = (this.getAttribute('orte') ?? 'fork lokal').split(/\s+/)
    this.#lage = lage(orte)
    const tiefe = Math.max(1, ...[...commits.values()].map(c => c.spalte))
    this.#dx = Math.min(86, (RECHTS - 4 - KNOTEN.w / 2 - X0) / tiefe)

    this.#baue()
    this.replaceChildren(this.#figur)
    this.#zeige(0, false)

    // Im Druck steht der Endzustand; die Schritte stehen dort alle untereinander
    let vorher = 0
    addEventListener('beforeprint', () => { vorher = this.#jetzt; this.#halte(); this.#zeige(this.#zustaende.length - 1, false) })
    addEventListener('afterprint', () => this.#zeige(vorher, false))
  }

  /** Teilt das Markdown im Element an den Überschriften in Abschnitte, einen je Schritt. */
  #liesAnleitung() {
    const kinder = [...this.children].filter(k => k.tagName !== 'SCRIPT')
    if (!kinder.length) return null
    const abschnitte = [{ kopf: null, inhalt: [] }]
    for (const k of kinder) {
      if (k.tagName === 'H3') abschnitte.push({ kopf: k, inhalt: [] })
      else abschnitte.at(-1).inhalt.push(k)
    }
    const schritte = this.#zustaende.length - 1
    if (abschnitte.length - 1 !== schritte)
      throw new Error(`Die Szene hat ${schritte} Schritte, die Anleitung ${abschnitte.length - 1} Abschnitte.`)
    // Die Nummer trägt der Schritt selbst
    for (const { kopf } of abschnitte) {
      if (kopf?.firstChild?.nodeType === Node.TEXT_NODE) kopf.firstChild.textContent = kopf.firstChild.textContent.replace(/^\s*\d+\.\s*/, '')
    }
    return abschnitte
  }

  // ---- Aufbau: alles, was sich nie bewegt ----
  #baue() {
    const { baender, streifen, hoehe } = this.#lage
    const uid = `gs${++zaehler}`
    const titel = this.getAttribute('titel')

    const buehne = this.#buehne = svg('svg', {
      class: 'gs-buehne', viewBox: `0 0 ${B} ${hoehe}`, role: 'img',
      'aria-label': `${titel ?? 'Git-Szene'} — der Ablauf steht als Text unter der Abbildung`,
    })
    const spitze = art => svg('marker', {
      id: `${uid}-${art}`, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 12, markerHeight: 12, markerUnits: 'userSpaceOnUse', orient: 'auto-start-reverse',
    }, svg('path', { d: 'M0 0 L10 5 L0 10 z', class: `gs-spitze ${art}` }))
    buehne.append(svg('defs', {}, spitze('ruhe'), spitze('aktiv')))

    const text = (klasse, x, y, inhalt) => {
      const t = svg('text', { class: klasse, x, y })
      t.textContent = inhalt
      return t
    }

    for (const b of baender) {
      buehne.append(
        svg('rect', { class: 'gs-band', x: 8, y: b.y, width: B - 16, height: b.h, rx: 4 }),
        text('gs-bandname', RECHTS, b.y + 17, b.name),
      )
    }

    for (const [ort, s] of Object.entries(streifen)) {
      if (ort === 'dateien') {
        for (const [name, f] of Object.entries(FACH)) {
          const leer = this.#fest.leer[name] = text('gs-leer', f.x + 14, s.y + 44, f.leer)
          buehne.append(
            svg('rect', { class: 'gs-flaeche', x: f.x, y: s.y, width: f.w, height: s.h, rx: 4 }),
            text('gs-fachname', f.x + 14, s.y + 19, f.name),
            leer,
          )
        }
        continue
      }
      const g = this.#fest.streifen[ort] = svg('g', { class: 'gs-streifen' },
        svg('rect', { class: 'gs-flaeche', x: LINKS, y: s.y, width: RECHTS - LINKS, height: s.h, rx: 4 }),
        text('gs-name', LINKS + 16, s.y + 58, NAMEN[ort][0]),
        text('gs-zusatz', LINKS + 16, s.y + 77, NAMEN[ort][1]),
        text('gs-fehlt', X0 - KNOTEN.w / 2, s.y + 68, 'noch nicht vorhanden'),
        // Die Historie beginnt früher, als die Szene zeigt
        svg('line', { class: 'gs-vorher', x1: X0 - 62, y1: s.y + REIHE[0], x2: X0 - KNOTEN.w / 2, y2: s.y + REIHE[0] }),
      )
      buehne.append(g)
    }

    // Pfeile in den Lücken zwischen den Streifen: hinunter holen, hinauf abgeben
    const pfeil = (key, x1, y1, x2, y2, name, tx, ty, anker = 'start') => {
      const g = this.#fest.pfeile[key] = svg('g', { class: 'gs-pfeil' },
        svg('line', { x1, y1, x2, y2, 'marker-end': `url(#${uid}-ruhe)` }),
        text('gs-pfeilname', tx, ty, name),
      )
      g.querySelector('text').setAttribute('text-anchor', anker)
      g.dataset.uid = uid
      buehne.append(g)
    }
    const paare = [['original', 'fork', 'Fork', 'Pull Request'], ['fork', 'lokal', 'Clone, Pull', 'Push']]
    for (const [oben, unten, ab, auf] of paare) {
      if (!streifen[oben] || !streifen[unten]) continue
      const y1 = streifen[oben].y + streifen[oben].h + 4
      const y2 = streifen[unten].y - 4
      const mitte = (y1 + y2) / 2 + 4.5
      pfeil(`ab:${oben}`, 46, y1, 46, y2, ab, 55, mitte)
      pfeil(`auf:${oben}`, 150, y2, 150, y1, auf, 159, mitte)
    }
    if (streifen.dateien) {
      const s = streifen.dateien
      const x = FACH.arbeit.x + FACH.arbeit.w
      pfeil('add', x + 4, s.y + 40, FACH.vorgemerkt.x - 4, s.y + 40, 'Add', (x + FACH.vorgemerkt.x) / 2, s.y + 30, 'middle')
      // Der Commit-Pfeil führt ins lokale Repository — nur, wenn die Szene es zeigt
      if (streifen.lokal) {
        const cx = FACH.vorgemerkt.x + FACH.vorgemerkt.w / 2
        pfeil('commit', cx, s.y - 4, cx, streifen.lokal.y + streifen.lokal.h + 4, 'Commit', cx + 9, s.y - 10.5)
      }
    }

    for (const name of ['kanten', 'commits', 'marken', 'dateien'])
      buehne.append(this.#ebenen[name] = svg('g', { class: `gs-${name}` }))

    // ---- Steuerung und Schritte ----
    const knopf = (name, beschriftung, klick, nurSymbol = false) => {
      const k = this.#knoepfe[name] = html('button', { type: 'button', class: `gs-knopf${nurSymbol ? ' quadrat' : ''}` })
      k.innerHTML = symbol(name) + (nurSymbol ? '' : `<span>${beschriftung}</span>`)
      if (nurSymbol) { k.title = beschriftung; k.setAttribute('aria-label', beschriftung) }
      k.addEventListener('click', klick)
      return k
    }
    const punkte = html('div', { class: 'gs-punkte' })
    this.#zustaende.forEach((s, i) => {
      const p = html('button', { type: 'button', class: 'gs-punkt', title: s.marke.replace(/^\$ /, ''), 'aria-label': `Schritt ${i}: ${s.marke}` })
      p.addEventListener('click', () => { this.#halte(); this.#zeige(i) })
      punkte.append(p)
    })
    const leiste = html('div', { class: 'gs-leiste' },
      knopf('anfang', 'Zum Anfang', () => { this.#halte(); this.#zeige(0, false) }, true),
      knopf('zurueck', 'Zurück', () => { this.#halte(); this.#zeige(this.#jetzt - 1) }),
      knopf('weiter', 'Weiter', () => { this.#halte(); this.#zeige(this.#jetzt + 1) }),
      knopf('abspielen', 'Abspielen', () => this.#takt ? this.#halte() : this.#spiele()),
      punkte,
      knopf('gross', 'Im Vollbild zeigen', () => document.fullscreenElement ? document.exitFullscreen() : this.#figur.requestFullscreen?.(), true),
    )

    const liste = html('ol', { class: 'gs-schritte', 'aria-live': 'polite' })
    this.#zustaende.forEach((s, i) => {
      const befehl = s.marke.startsWith('$ ')
      const marke = html(befehl ? 'code' : 'span', { class: befehl ? 'gs-befehl' : 'gs-griff' })
      marke.textContent = befehl ? s.marke.slice(2) : s.marke
      const erlaeuterung = html('p', { class: 'gs-text' })
      erlaeuterung.innerHTML = auszeichnen(s.text)
      const nr = html('span', { class: 'gs-nr' })
      nr.textContent = i
      // Mit Anleitung steht die Überschrift des Abschnitts anstelle der Marke
      const { kopf, inhalt = [] } = this.#anleitung?.[i] ?? {}
      const li = html('li', {}, nr, html('div', { class: 'gs-inhalt' }, kopf ?? marke, ...(s.text ? [erlaeuterung] : []), ...inhalt))
      // In der Liste der Schritte führt ein Klick auf eine Zeile zu ihrem Schritt
      // Klappt darüber ein langer Schritt zu, rutscht die Zeile nach oben: Sie bleibt im Blick
      if (this.#anleitung) li.addEventListener('click', () => {
        if (i === this.#jetzt) return
        this.#halte()
        this.#zeige(i)
        li.scrollIntoView({ block: 'nearest' })
      })
      liste.append(li)
    })

    this.#figur = html('figure', { class: `gs${this.#anleitung ? ' mit-anleitung' : ''}`, tabindex: 0 })
    if (titel) {
      const kopf = html('figcaption', { class: 'gs-titel' })
      kopf.textContent = titel
      this.#figur.append(kopf)
    }
    this.#figur.append(buehne, leiste, liste)
    this.#figur.addEventListener('keydown', (ev) => {
      if (!['ArrowRight', 'ArrowLeft', 'Home'].includes(ev.key)) return
      // Mit Zusatztaste gehört die Taste dem Browser: Text der Anleitung markieren, Seite zurück
      if (ev.shiftKey || ev.ctrlKey || ev.altKey || ev.metaKey) return
      // Auf den Reitern einer Anleitung (Terminal, Visual Studio Code) wechseln die Pfeile den Reiter
      if (ev.target.matches('input')) return
      this.#halte()
      if (ev.key === 'Home') this.#zeige(0, false)
      else this.#zeige(this.#jetzt + (ev.key === 'ArrowRight' ? 1 : -1))
      ev.preventDefault()
    })
  }

  // ---- Ablauf ----
  #spiele() {
    // Am Ende angekommen, beginnt der Ablauf von vorn
    if (this.#jetzt >= this.#zustaende.length - 1) this.#zeige(0)
    const k = this.#knoepfe.abspielen
    k.classList.add('aktiv')
    k.innerHTML = `${symbol('anhalten')}<span>Anhalten</span>`
    this.#takt = setInterval(() => {
      this.#zeige(this.#jetzt + 1)
      if (this.#jetzt >= this.#zustaende.length - 1) this.#halte()
    }, 3600)
  }

  #halte() {
    if (!this.#takt) return
    clearInterval(this.#takt)
    this.#takt = null
    const k = this.#knoepfe.abspielen
    k.classList.remove('aktiv')
    k.innerHTML = `${symbol('abspielen')}<span>Abspielen</span>`
  }

  #x(id) { return X0 + this.#commits.get(id).spalte * this.#dx }
  #y(ort, id) { return this.#lage.streifen[ort].y + REIHE[this.#commits.get(id).reihe] }

  /** Zeigt Schritt `i`; nur der Schritt nach vorn spielt seine Übertragungen ab. */
  #zeige(i, bewegt = true) {
    const letzter = this.#zustaende.length - 1
    i = Math.max(0, Math.min(letzter, i))
    const vor = bewegt && i === this.#jetzt + 1
    const { zustand, ereignis } = this.#zustaende[i]
    const { streifen } = this.#lage
    const teile = []

    for (const [ort, g] of Object.entries(this.#fest.streifen)) g.classList.toggle('fehlt', !zustand.repos[ort])
    for (const [key, g] of Object.entries(this.#fest.pfeile)) {
      const aktiv = ereignis.pfeile.has(key) || (key === 'auf:original' && zustand.pr?.zustand === 'offen')
      g.classList.toggle('aktiv', aktiv)
      g.querySelector('line').setAttribute('marker-end', `url(#${g.dataset.uid}-${aktiv ? 'aktiv' : 'ruhe'})`)
    }

    for (const [ort, repo] of Object.entries(zustand.repos)) {
      if (!streifen[ort]) continue
      let flug = 0
      for (const id of repo.commits) {
        const x = this.#x(id)
        const y = this.#y(ort, id)
        const key = `${ort}:${id}`
        const quelle = ereignis.fluege.get(key)
        // Übertragene Commits kommen aus dem Streifen, der sie schon hat,
        // ein Commit aus der Vormerkung aus deren Fach
        let von
        if (quelle && streifen[quelle]) von = { x, y: this.#y(quelle, id) }
        else if (ereignis.ausDateien?.id === id && streifen.dateien) von = this.#platz('vorgemerkt', 0)
        teile.push({
          key: `c:${key}`, ebene: 'commits', x, y, sig: id, von,
          klasse: `gs-commit${ereignis.frisch.has(key) || quelle ? ' frisch' : ''}`,
          verzug: quelle ? 140 * flug++ : 0,
          baue: () => [svg('g', { class: 'gs-innen' },
            svg('rect', { x: -KNOTEN.w / 2, y: -KNOTEN.h / 2, width: KNOTEN.w, height: KNOTEN.h, rx: 4 }),
            this.#text(id, 0, 4),
          )],
        })
        for (const v of this.#commits.get(id).eltern) {
          if (!repo.commits.includes(v)) continue
          teile.push({
            key: `k:${key}:${v}`, ebene: 'kanten', x: 0, y: 0, sig: '', klasse: 'gs-kante', verzug: 450,
            baue: () => [svg('line', { x1: this.#x(v), y1: this.#y(ort, v), x2: x, y2: y })],
          })
        }
      }
      teile.push(...this.#marken(ort, repo))
    }

    // Dateien im Arbeitsverzeichnis und in der Vormerkung
    if (streifen.dateien) {
      const zahl = { arbeit: 0, vorgemerkt: 0 }
      for (const [name, d] of Object.entries(zustand.dateien)) {
        const p = this.#platz(d.ort, zahl[d.ort]++)
        teile.push({
          key: `d:${name}`, ebene: 'dateien', ...p, sig: `${d.ort}:${d.status}`, klasse: `gs-datei ${d.ort}`,
          baue: () => [
            svg('rect', { x: -78, y: -12, width: 156, height: 24, rx: 4 }),
            this.#text(name, -68, 4, 'start'),
            this.#text(d.status, 68, 4, 'end', 'gs-status'),
          ],
        })
      }
      for (const [name, t] of Object.entries(this.#fest.leer)) t.classList.toggle('weg', zahl[name] > 0)
    }

    // Der Pull Request liegt zwischen Fork und Originalrepository
    if (zustand.pr && streifen.original && streifen.fork) {
      const { branch, zustand: stand } = zustand.pr
      const y = (streifen.original.y + streifen.original.h + streifen.fork.y) / 2
      teile.push({
        key: 'pr', ebene: 'marken', x: RECHTS - 170, y, sig: stand, klasse: `gs-pr ${stand === 'offen' ? 'offen' : 'fertig'}`,
        baue: () => [
          svg('rect', { x: -170, y: -11, width: 340, height: 22, rx: 4 }),
          this.#text(`Pull Request · ${branch} → main · ${stand}`, 0, 4.5, 'middle', 'gs-prtext'),
        ],
      })
    }

    // Was beim Commit aus der Vormerkung verschwindet, wandert in den Commit
    const ziel = vor && ereignis.ausDateien && streifen.lokal
      ? { x: this.#x(ereignis.ausDateien.id), y: this.#y('lokal', ereignis.ausDateien.id) }
      : null
    this.#setze(teile, bewegt, vor, ziel)

    this.#jetzt = i
    this.#figur.querySelectorAll('.gs-schritte > li').forEach((li, n) => {
      li.classList.toggle('aktiv', n === i)
      li.classList.toggle('erledigt', n < i)
      // Im Vollbild rollt die Liste in ihrem Feld: der aktuelle Schritt bleibt im Blick
      if (n === i && document.fullscreenElement === this.#figur) li.scrollIntoView({ block: 'nearest' })
    })
    this.#figur.querySelectorAll('.gs-punkt').forEach((p, n) => p.classList.toggle('aktiv', n === i))
    this.#knoepfe.anfang.disabled = i === 0
    this.#knoepfe.zurueck.disabled = i === 0
    this.#knoepfe.weiter.disabled = i === letzter
  }

  #text(inhalt, x, y, anker = 'middle', klasse = '') {
    const t = svg('text', { x, y, 'text-anchor': anker })
    if (klasse) t.setAttribute('class', klasse)
    t.textContent = inhalt
    return t
  }

  #platz(fach, n) {
    return { x: FACH[fach].x + 14 + 78 + n * 164, y: this.#lage.streifen.dateien.y + 40 }
  }

  /** Branch-Marken und HEAD: über dem Commit auf der Reihe von main, sonst darunter. */
  #marken(ort, repo) {
    const jeCommit = new Map()
    for (const [name, id] of Object.entries(repo.branches)) jeCommit.set(id, [...(jeCommit.get(id) ?? []), name])
    const teile = []
    for (const [id, namen] of jeCommit) {
      const reihe = [...namen.sort((a, b) => (b === 'main') - (a === 'main'))]
        .flatMap(name => [
          ...(repo.head === name ? [{ key: `h:${ort}`, name: 'HEAD', w: 42, head: true, fuge: 0 }] : []),
          { key: `z:${ort}:${name}`, name, w: name.length * ZEICHEN + 16, fuge: 5 },
        ])
      const gesamt = reihe.reduce((s, m) => s + m.w + m.fuge, -reihe.at(-1).fuge)
      let x = Math.max(X0 - KNOTEN.w / 2, Math.min(RECHTS - 8 - gesamt, this.#x(id) - gesamt / 2))
      const y = this.#lage.streifen[ort].y + MARKE[this.#commits.get(id).reihe]
      for (const m of reihe) {
        teile.push({
          key: m.key, ebene: 'marken', x: x + m.w / 2, y, sig: m.name, klasse: `gs-marke${m.head ? ' head' : ''}`,
          baue: () => [svg('rect', { x: -m.w / 2, y: -10, width: m.w, height: 20, rx: m.head ? 0 : 3 }), this.#text(m.name, 0, 4)],
        })
        x += m.w + m.fuge
      }
    }
    return teile
  }

  /** Gleicht die Bühne mit der Liste ab: Neues kommt, Bleibendes wandert, der Rest geht. */
  #setze(teile, bewegt, vor, ziel) {
    this.#buehne.classList.toggle('ruhig', !bewegt)
    const gesehen = new Set()
    for (const t of teile) {
      gesehen.add(t.key)
      let g = this.#teile.get(t.key)
      const neu = !g
      if (neu) {
        g = svg('g')
        this.#ebenen[t.ebene].append(g)
        this.#teile.set(t.key, g)
      }
      if (g.dataset.sig !== t.sig) {
        g.replaceChildren(...t.baue())
        g.dataset.sig = t.sig
      }
      const von = vor ? t.von : null
      g.setAttribute('class', `gs-teil ${t.klasse}${neu && vor && !von ? ' plopp' : ''}`)
      g.style.transitionDelay = '0ms'
      if (neu && bewegt) {
        // Startlage ohne Übergang setzen, dann erst das Ziel
        g.style.transition = 'none'
        g.style.transform = `translate(${(von ?? t).x}px, ${(von ?? t).y}px)`
        g.style.opacity = von ? 1 : 0
        g.getBoundingClientRect()
        g.style.transition = ''
        if (vor) g.style.transitionDelay = `${t.verzug ?? 0}ms`
      }
      g.style.transform = `translate(${t.x}px, ${t.y}px)`
      g.style.opacity = 1
    }
    for (const [key, g] of this.#teile) {
      if (gesehen.has(key)) continue
      this.#teile.delete(key)
      if (!bewegt) { g.remove(); continue }
      g.style.transitionDelay = '0ms'
      if (ziel && key.startsWith('d:')) g.style.transform = `translate(${ziel.x}px, ${ziel.y}px)`
      g.style.opacity = 0
      setTimeout(() => g.remove(), 800)
    }
    if (!bewegt) {
      this.#buehne.getBoundingClientRect()
      this.#buehne.classList.remove('ruhig')
    }
  }
}

customElements.define('git-szene', GitSzene)
