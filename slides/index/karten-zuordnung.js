/*
  <karten-zuordnung> — interaktive Aufgabe für Übungsblätter: Karten aus einem
  Stapel werden Fächern zugeordnet (etwa Tätigkeiten den Phasen des
  Projektmodells). Aus der Zuordnung entsteht eine Markdown-Datei, die die
  Studierenden herunterladen und im Übungsrepository einreichen.

  Die Aufgabe steht als kleine Beschreibung im Markdown:

    <karten-zuordnung titel="Phasenplan" kennung="ue02-phasenplan" datei="phasenplan.md" ueberschrift="Phasenplan — Terminplaner">
    <script type="text/plain">
    fach studie --phase-studie | Studie
    fach wartung --phase-wartung | Wartung
    je-fach Ergebnis der Phase | etwa ein Dokument
    frage Bei welchen Karten waren Sie unsicher — und warum?
    karte k01 | Einen gemeldeten Fehler beheben
    karte k02 | Lösungsvarianten nebeneinanderstellen
    </script>
    </karten-zuordnung>

  Zwischen <karten-zuordnung> und </script> darf keine Leerzeile stehen, sonst
  endet für Markdown der HTML-Block. In der Ansicht der Markdown-Datei auf
  GitHub erscheint die Aufgabe nicht.

  Anweisungen, eine je Zeile (`#` leitet einen Kommentar ein):

    fach <id> <farbe> | <Name>        ein Fach; <farbe> ist ein Token (`--phase-studie`)
    karte <id> | <Text>               eine Karte; sie liegt anfangs im Stapel,
                                      in der Reihenfolge der Beschreibung
    je-fach <Bezeichnung> | <Hinweis> ein Textfeld je Fach (höchstens eine Zeile `je-fach`)
    frage <Text>                      jede Karte bekommt ein Fragezeichen: Wer bei ihr
                                      unsicher ist, klickt es an. Die so markierten
                                      Karten stehen unter den Fächern, überschrieben
                                      mit <Text>, je mit einem Feld für eine kurze
                                      Anmerkung (höchstens eine Zeile `frage`)

  Attribute:

    titel         Überschrift der Aufgabe
    kennung       unter diesem Namen merkt sich der Browser den Stand; sie
                  steht auch in der letzten Zeile der Datei
    datei         Name der erzeugten Datei
    ueberschrift  Überschrift in der erzeugten Datei

  Bedienung: Karte ziehen und im Fach ablegen — oder Karte anklicken (auch
  mit der Tastatur) und danach das Fach. So geht es auch am Telefon. Eine
  Lösung kennt das Element nicht: Es hält fest, was zugeordnet wurde, und
  bewertet nicht.

  Die Datei endet mit einem Kommentar, der die Zuordnung in einer Zeile
  wiederholt, dahinter die als unsicher markierten Karten
  (`<!-- zuordnung ue02-phasenplan: k01=wartung k02=studie | unsicher: k02 -->`).
  Daran lassen sich die eingereichten Dateien auszählen.
*/

const STAPEL = ''

class KartenZuordnung extends HTMLElement {
  connectedCallback() {
    if (this.gestartet) return
    this.gestartet = true
    try {
      this.lies(this.querySelector('script[type="text/plain"]')?.textContent ?? '')
      this.ladeStand()
      this.baue()
      this.zeichne()
    }
    catch (fehler) {
      this.innerHTML = ''
      const p = document.createElement('p')
      p.className = 'kz-fehler'
      p.textContent = `Die Aufgabe lässt sich nicht aufbauen: ${fehler.message}`
      this.append(p)
    }
  }

  /** Liest die Beschreibung in `faecher`, `karten`, `jeFach` und `frage`. */
  lies(text) {
    this.faecher = []
    this.karten = []
    this.jeFach = null
    this.frage = null
    for (const roh of text.split('\n')) {
      const zeile = roh.trim()
      if (!zeile || zeile.startsWith('#')) continue
      const art = zeile.split(/\s+/)[0]
      const inhalt = zeile.slice(art.length).trim()
      const [vorn, hinten = ''] = inhalt.split(/\s*\|\s*(.*)/s)
      if (art === 'fach') {
        const [id, farbe] = vorn.split(/\s+/)
        if (!id || !farbe?.startsWith('--') || !hinten) throw new Error(`»${zeile}« — erwartet: fach <id> <farbe> | <Name>`)
        this.faecher.push({ id, farbe, name: hinten })
      }
      else if (art === 'karte') {
        if (!vorn || /\s/.test(vorn) || !hinten) throw new Error(`»${zeile}« — erwartet: karte <id> | <Text>`)
        this.karten.push({ id: vorn, text: hinten })
      }
      else if (art === 'je-fach') this.jeFach = { name: vorn, hinweis: hinten }
      else if (art === 'frage') this.frage = inhalt
      else throw new Error(`unbekannte Anweisung »${art}«`)
    }
    if (!this.faecher.length || !this.karten.length) throw new Error('es fehlen Fächer oder Karten')
    for (const liste of [this.faecher, this.karten]) {
      const ids = liste.map(e => e.id)
      const doppelt = ids.find((id, i) => ids.indexOf(id) !== i)
      if (doppelt) throw new Error(`die Kennung »${doppelt}« ist doppelt vergeben`)
    }
  }

  get schluessel() { return `karten-zuordnung:${this.getAttribute('kennung') ?? this.getAttribute('titel') ?? 'aufgabe'}` }

  /** Der Stand: wo jede Karte liegt (in der Reihenfolge des Ablegens) und was in den Feldern steht. */
  ladeStand() {
    let alt = {}
    // Ohne Speicher (privates Fenster, gesperrte Daten) beginnt die Aufgabe leer
    try { alt = JSON.parse(localStorage.getItem(this.schluessel) ?? '{}') ?? {} }
    catch { alt = {} }
    const fachIds = new Set(this.faecher.map(f => f.id))
    const kartenIds = new Set(this.karten.map(k => k.id))
    // Nur übernehmen, was es in der Beschreibung noch gibt
    // Fremdes oder Beschädigtes fällt weg, je Karte gilt der erste Eintrag
    const gesehen = new Set()
    this.lage = (Array.isArray(alt.lage) ? alt.lage : []).filter((e) => {
      if (!Array.isArray(e) || !kartenIds.has(e[0]) || !fachIds.has(e[1]) || gesehen.has(e[0])) return false
      gesehen.add(e[0])
      return true
    })
    this.felder = typeof alt.felder === 'object' && alt.felder ? alt.felder : {}
    // Je Karte: ob sie als unsicher markiert ist und was dazu notiert wurde.
    // Die Anmerkung bleibt stehen, wenn die Marke wieder gelöscht wird.
    this.zweifel = {}
    for (const [karte, z] of Object.entries(typeof alt.zweifel === 'object' && alt.zweifel ? alt.zweifel : {})) {
      if (kartenIds.has(karte)) this.zweifel[karte] = { an: Boolean(z?.an), text: String(z?.text ?? '') }
    }
    this.gewaehlt = null
  }

  merke() {
    try { localStorage.setItem(this.schluessel, JSON.stringify({ lage: this.lage, felder: this.felder, zweifel: this.zweifel })) }
    catch { /* dann eben ohne Gedächtnis */ }
  }

  fachVon(karte) { return this.lage.find(([k]) => k === karte)?.[1] ?? STAPEL }

  lege(karte, fach) {
    this.lage = this.lage.filter(([k]) => k !== karte)
    if (fach !== STAPEL) this.lage.push([karte, fach])
    this.gewaehlt = null
    this.merke()
    this.zeichne()
  }

  /** Baut das Gerüst einmal auf; `zeichne()` verteilt danach nur die Karten. */
  baue() {
    const el = (name, klasse, text) => {
      const e = document.createElement(name)
      if (klasse) e.className = klasse
      if (text !== undefined) e.textContent = text
      return e
    }
    this.innerHTML = ''
    const rahmen = el('section', 'kz')
    if (this.getAttribute('titel')) rahmen.append(el('div', 'kz-titel', this.getAttribute('titel')))

    const flaeche = el('div', 'kz-flaeche')
    // Der Stapel ist selbst ein Ziel: Eine Karte lässt sich zurücklegen
    this.stapel = this.ziel(el('div', 'kz-stapel'), STAPEL)
    // Der Kopf ist eine Schaltfläche wie der eines Fachs: So geht es auch mit der Tastatur zurück
    const stapelKopf = el('button', 'kz-stapel-kopf', 'Stapel')
    stapelKopf.type = 'button'
    this.stapel.append(stapelKopf, el('div', 'kz-karten'))
    this.stapel.append(el('p', 'kz-leer', 'Alle Karten sind zugeordnet.'))
    flaeche.append(this.stapel)

    const faecher = el('div', 'kz-faecher')
    this.fachEl = new Map()
    for (const fach of this.faecher) {
      const f = this.ziel(el('div', 'kz-fach'), fach.id)
      f.style.setProperty('--kz-farbe', `var(${fach.farbe})`)
      const kopf = el('button', 'kz-fach-kopf', fach.name)
      kopf.type = 'button'
      kopf.addEventListener('click', () => { if (this.gewaehlt) this.lege(this.gewaehlt, fach.id) })
      f.append(kopf, el('div', 'kz-karten'))
      if (this.jeFach) {
        const zeile = el('label', 'kz-feld')
        const eingabe = el('input')
        eingabe.type = 'text'
        eingabe.placeholder = this.jeFach.hinweis
        eingabe.value = this.felder[fach.id] ?? ''
        eingabe.addEventListener('input', () => { this.felder[fach.id] = eingabe.value; this.merke(); this.zeichneAusgabe() })
        zeile.append(el('span', '', this.jeFach.name), eingabe)
        f.append(zeile)
      }
      this.fachEl.set(fach.id, f)
      faecher.append(f)
    }
    flaeche.append(faecher)
    rahmen.append(flaeche)

    const fuss = el('div', 'kz-fuss')
    if (this.frage) {
      const kasten = el('div', 'kz-frage')
      this.zweifelListe = el('ul', 'kz-zweifel-liste')
      kasten.append(el('p', 'kz-frage-kopf', this.frage), this.zweifelListe,
        el('p', 'kz-frage-leer', 'Noch keine Karte markiert. Klicken Sie auf das Fragezeichen an einer Karte, bei der Sie unsicher sind.'))
      fuss.append(kasten)
    }
    const benutzer = el('label', 'kz-feld kz-benutzername')
    const eingabe = el('input')
    eingabe.type = 'text'
    eingabe.placeholder = 'etwa mmustermann'
    eingabe.autocomplete = 'off'
    eingabe.spellcheck = false
    eingabe.value = this.felder.benutzername ?? ''
    // Der GitHub-Benutzername steht im Übungsrepository in Kleinbuchstaben
    eingabe.addEventListener('input', () => { this.felder.benutzername = eingabe.value.trim().toLowerCase(); this.merke(); this.zeichneAusgabe() })
    benutzer.append(el('span', '', 'Ihr GitHub-Benutzername'), eingabe)
    fuss.append(benutzer)

    const leiste = el('div', 'kz-leiste')
    this.laden = el('button', 'kz-knopf kz-haupt', `${this.datei} herunterladen`)
    this.kopieren = el('button', 'kz-knopf', 'Kopieren')
    const leeren = el('button', 'kz-knopf kz-leise', 'Von vorn beginnen')
    for (const knopf of [this.laden, this.kopieren, leeren]) knopf.type = 'button'
    this.laden.addEventListener('click', () => this.ladeHerunter())
    this.kopieren.addEventListener('click', () => this.kopiere())
    leeren.addEventListener('click', () => {
      const angefangen = this.lage.length || Object.values(this.zweifel).some(z => z.an || z.text)
      if (!angefangen || confirm('Alle Karten zurück in den Stapel legen?')) { this.lage = []; this.zweifel = {}; this.gewaehlt = null; this.merke(); this.zeichne() }
    })
    this.hinweis = el('p', 'kz-hinweis')
    this.hinweis.setAttribute('aria-live', 'polite')
    leiste.append(this.laden, this.kopieren, leeren)
    fuss.append(leiste, this.hinweis)

    const vorschau = el('details', 'kz-vorschau')
    vorschau.append(el('summary', '', `So sieht ${this.datei} aus`))
    this.ausgabe = el('pre')
    vorschau.append(this.ausgabe)
    fuss.append(vorschau)
    rahmen.append(fuss)
    this.append(rahmen)

    // Eine Karte je Kennung, einmal gebaut und danach nur umgehängt
    this.kartenEl = new Map(this.karten.map((karte) => {
      const k = el('div', 'kz-karte')
      k.draggable = true
      const text = el('button', 'kz-karte-text', karte.text)
      text.type = 'button'
      text.addEventListener('click', (ereignis) => {
        ereignis.stopPropagation()
        this.gewaehlt = this.gewaehlt === karte.id ? null : karte.id
        this.zeichne()
      })
      k.append(text)
      if (this.frage) {
        const marke = el('button', 'kz-zweifel', '?')
        marke.type = 'button'
        marke.title = 'Hier bin ich unsicher'
        marke.setAttribute('aria-label', `Unsicher: ${karte.text}`)
        marke.addEventListener('click', (ereignis) => {
          ereignis.stopPropagation()
          const z = this.zweifel[karte.id] ??= { an: false, text: '' }
          z.an = !z.an
          this.merke()
          this.zeichne()
        })
        k.append(marke)
      }
      k.addEventListener('dragstart', (ereignis) => {
        ereignis.dataTransfer.setData('text/plain', karte.id)
        ereignis.dataTransfer.effectAllowed = 'move'
        this.gezogen = karte.id
        k.classList.add('gezogen')
      })
      k.addEventListener('dragend', () => { this.gezogen = null; k.classList.remove('gezogen') })
      return [karte.id, k]
    }))
  }

  /** Macht ein Element zum Ziel: ablegen per Ziehen oder per Klick mit gewählter Karte. */
  ziel(element, fach) {
    element.addEventListener('dragover', (ereignis) => {
      if (!this.gezogen) return
      ereignis.preventDefault()
      element.classList.add('ziel')
    })
    element.addEventListener('dragleave', (ereignis) => { if (!element.contains(ereignis.relatedTarget)) element.classList.remove('ziel') })
    element.addEventListener('drop', (ereignis) => {
      ereignis.preventDefault()
      element.classList.remove('ziel')
      if (this.gezogen) this.lege(this.gezogen, fach)
    })
    element.addEventListener('click', (ereignis) => {
      // Klicks in ein Textfeld oder auf seine Beschriftung legen keine Karte ab
      if (this.gewaehlt && !ereignis.target.closest('input, textarea, label')) this.lege(this.gewaehlt, fach)
    })
    return element
  }

  zeichne() {
    // Im Stapel die Reihenfolge der Beschreibung, im Fach die des Ablegens
    const imStapel = this.karten.filter(k => this.fachVon(k.id) === STAPEL)
    this.stapel.querySelector('.kz-karten').replaceChildren(...imStapel.map(k => this.kartenEl.get(k.id)))
    this.stapel.classList.toggle('leer', !imStapel.length)
    this.stapel.querySelector('.kz-stapel-kopf').textContent = imStapel.length ? `Stapel · noch ${imStapel.length}` : 'Stapel'
    for (const fach of this.faecher) {
      const karten = this.lage.filter(([, f]) => f === fach.id).map(([k]) => this.kartenEl.get(k))
      this.fachEl.get(fach.id).querySelector('.kz-karten').replaceChildren(...karten)
    }
    for (const [id, k] of this.kartenEl) {
      k.classList.toggle('gewaehlt', id === this.gewaehlt)
      k.classList.toggle('unsicher', this.unsicher(id))
      k.querySelector('.kz-karte-text').setAttribute('aria-pressed', String(id === this.gewaehlt))
      k.querySelector('.kz-zweifel')?.setAttribute('aria-pressed', String(this.unsicher(id)))
    }
    this.classList.toggle('waehlt', Boolean(this.gewaehlt))
    this.zeichneZweifel()
    this.zeichneAusgabe()
  }

  unsicher(karte) { return Boolean(this.zweifel[karte]?.an) }

  fachName(karte) { return this.faecher.find(f => f.id === this.fachVon(karte))?.name ?? 'noch im Stapel' }

  /** Die als unsicher markierten Karten, in der Reihenfolge der Beschreibung, je mit einem Feld für die Anmerkung. */
  zeichneZweifel() {
    if (!this.zweifelListe) return
    const markiert = this.karten.filter(k => this.unsicher(k.id))
    this.zweifelListe.replaceChildren(...markiert.map((karte) => {
      const li = document.createElement('li')
      const kopf = document.createElement('p')
      kopf.className = 'kz-zweifel-karte'
      kopf.textContent = karte.text
      const ort = document.createElement('span')
      ort.textContent = ` · ${this.fachName(karte.id)}`
      kopf.append(ort)
      const eingabe = document.createElement('input')
      eingabe.type = 'text'
      eingabe.placeholder = 'Was haben Sie abgewogen?'
      eingabe.setAttribute('aria-label', `Anmerkung zu: ${karte.text}`)
      eingabe.value = this.zweifel[karte.id].text
      eingabe.addEventListener('input', () => { this.zweifel[karte.id].text = eingabe.value; this.merke(); this.zeichneAusgabe() })
      const weg = document.createElement('button')
      weg.type = 'button'
      weg.className = 'kz-zweifel-weg'
      weg.textContent = '×'
      weg.title = 'Marke entfernen'
      weg.setAttribute('aria-label', `Marke entfernen: ${karte.text}`)
      weg.addEventListener('click', () => { this.zweifel[karte.id].an = false; this.merke(); this.zeichne() })
      const zeile = document.createElement('div')
      zeile.className = 'kz-zweifel-zeile'
      zeile.append(eingabe, weg)
      li.append(kopf, zeile)
      return li
    }))
    this.zweifelListe.parentElement.classList.toggle('leer', !markiert.length)
  }

  get datei() { return this.getAttribute('datei') ?? 'zuordnung.md' }

  /** Was noch fehlt, ehe die Datei vollständig ist — leer, wenn nichts fehlt. */
  get offen() {
    const imStapel = this.karten.length - this.lage.length
    if (imStapel) return imStapel === 1 ? 'Noch 1 Karte liegt im Stapel.' : `Noch ${imStapel} Karten liegen im Stapel.`
    if (!this.felder.benutzername) return 'Tragen Sie noch Ihren GitHub-Benutzernamen ein.'
    return ''
  }

  markdown() {
    const text = id => this.karten.find(k => k.id === id).text
    const zeilen = [`# ${this.getAttribute('ueberschrift') ?? this.getAttribute('titel') ?? 'Zuordnung'}`, '', `GitHub-Benutzername: ${this.felder.benutzername || '…'}`, '']
    for (const fach of this.faecher) {
      zeilen.push(`## ${fach.name}`, '')
      if (this.jeFach) zeilen.push(`**${this.jeFach.name}:** ${(this.felder[fach.id] ?? '').trim() || '…'}`, '')
      const karten = this.lage.filter(([, f]) => f === fach.id)
      zeilen.push(...(karten.length ? karten.map(([k]) => `- ${text(k)}`) : ['- …']), '')
    }
    const markiert = this.karten.filter(k => this.unsicher(k.id))
    if (this.frage) {
      zeilen.push(`## ${this.frage}`, '')
      zeilen.push(...(markiert.length
        ? markiert.map(k => `- **${k.text}** (${this.fachName(k.id)}): ${this.zweifel[k.id].text.trim() || '…'}`)
        : ['Keine Karte markiert.']), '')
    }
    // Maschinenlesbar, in der Reihenfolge der Beschreibung
    const zuordnung = this.karten.map(k => `${k.id}=${this.fachVon(k.id) || '?'}`).join(' ')
    const zusatz = this.frage ? ` | unsicher: ${markiert.map(k => k.id).join(' ') || '–'}` : ''
    zeilen.push(`<!-- zuordnung ${this.getAttribute('kennung') ?? ''}: ${zuordnung}${zusatz} -->`, '')
    return zeilen.join('\n')
  }

  zeichneAusgabe() {
    const offen = this.offen
    this.ausgabe.textContent = this.markdown()
    this.laden.disabled = this.kopieren.disabled = Boolean(offen)
    this.hinweis.textContent = this.gewaehlt
      ? 'Karte gewählt — klicken Sie jetzt auf das Fach, in das sie gehört.'
      : offen || `Fertig: Laden Sie ${this.datei} herunter und legen Sie die Datei in Ihr Verzeichnis im Übungsrepository.`
  }

  ladeHerunter() {
    const adresse = URL.createObjectURL(new Blob([this.markdown()], { type: 'text/markdown;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = adresse
    link.download = this.datei
    document.body.append(link)
    link.click()
    link.remove()
    // Erst freigeben, wenn der Browser den Download sicher begonnen hat (WebKit holt ihn verzögert)
    setTimeout(() => URL.revokeObjectURL(adresse), 10000)
  }

  async kopiere() {
    try {
      await navigator.clipboard.writeText(this.markdown())
      this.hinweis.textContent = 'In die Zwischenablage kopiert.'
    }
    catch {
      this.hinweis.textContent = 'Kopieren ist hier nicht möglich — nehmen Sie den Text aus der Vorschau.'
    }
  }
}

customElements.define('karten-zuordnung', KartenZuordnung)
