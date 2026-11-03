/*
  Baut alle Foliensätze für GitHub Pages nach `dist/`:

    dist/index.html            Übersicht der Vorlesungen und Übungen, aus `index/`
    dist/<foliensatz>/         statischer Slidev-Build je Vorlesung oder Übung
    dist/<übung>/index.html    das Übungsblatt, aus `uebungsblatt.md`; hat die
                               Übung auch Folien, liegt es als uebungsblatt.html daneben
    dist/<foliensatz>/notizen.html  die Foliennotizen des Foliensatzes als Seite
                               zum Nachlesen, je Notiz mit Sprung auf ihre Folie
    dist/<foliensatz>/<foliensatz>.pdf  der Foliensatz als PDF, eine Seite je Klickschritt

  Der Basispfad kommt aus PAGES_BASE (im Workflow von `configure-pages`,
  etwa `/thm_wk-1208_softwaretechnik`); ohne die Variable liegt alles an der
  Wurzel. Jeder Ordner unter `lectures/` und `exercises/` mit einer `slides.md`
  oder einer `uebungsblatt.md` wird gebaut — eine neue Vorlesung oder Übung
  erscheint also von selbst. Eine Übung braucht keinen Foliensatz: Dann ist
  das Übungsblatt die Übung, und seine Angaben (`title`, `beschreibung`,
  `woche` …) stehen im Frontmatter der `uebungsblatt.md`.

    npm run build:pages
    PAGES_BASE=/thm_wk-1208_softwaretechnik npm run build:pages
    npm run build:index        nur die Übersicht, Foliensätze bleiben stehen
    npm run build:pages -- --ohne-pdf   ohne PDF-Export (der braucht Chromium und Zeit)

  Die Übersichtsseite liegt als Vorlage unter `index/`:

    index/index.html           Vorlage mit Platzhaltern
    index/blatt.html           Vorlage für Übungsblätter ({{titel}}, {{rubrik}}, {{folien}}, <!--inhalt-->)
    index/index.css            Gestaltung, mit den Tokens des Themes
    index/git-szene.js, .css   <git-szene>: animierte Abbildungen im Übungsblatt
    index/karten-zuordnung.js, .css   <karten-zuordnung>: Karten Fächern zuordnen, Ergebnis als Markdown-Datei
    index/reiterkasten.js      Reiterkästen einer Gruppe (Terminal / Visual Studio Code) schalten gemeinsam um
    index/seite.yaml           Angaben zur Seite (Rubrik, Einleitung …)
    index/…                    alles Weitere (Bilder, Skripte) wird kopiert

  Platzhalter der Vorlage:

    {{feld}}                   Wert, HTML-sicher
    {{#feld}} … {{/feld}}      Liste: einmal je Eintrag, dessen Felder gelten
                               innen; sonst: nur, wenn das Feld gesetzt ist

  An der Seite stehen die Felder aus `seite.yaml` sowie die Listen
  `vorlesungen`, `uebungen` und `wochen` (je Woche `woche`, `vorlesungen`,
  `uebungen`, `blaetter`); je Foliensatz das ganze Frontmatter seiner
  `slides.md` (`title`, `info`, `veranstaltung`, eigene Felder wie
  `beschreibung` …) sowie `ordner`, `link`, `nummer` und `titel` — die beiden
  letzten aus »V01 — Titel« bzw. »Ü01 — Titel« zerlegt — und `blatt`, den Link
  auf das Übungsblatt, wenn der Ordner eine `uebungsblatt.md` enthält, `notizen`,
  den Link auf die Seite der Foliennotizen, wenn der Foliensatz welche hat, `pdf`,
  den Link auf den Foliensatz als PDF, wenn der Build eines erzeugt hat, und
  `woche`, die Zeile der Zeitleiste: das Feld `woche` im Frontmatter, sonst
  die Zahl aus der Nummer. Reicht eine Vorlesung über mehrere Termine, nennt
  `bis` im Frontmatter den letzten; `spanne` ist dann die Zahl der Zeilen,
  `dauer` der Text dazu (»Termine 3 und 4«). Je Woche stehen außerdem
  `zeile`, `vlSpanne`, `vlZelle` (die Zelle der Vorlesung ist frei) und
  `weiter` (die Vorlesungen, die aus einer früheren Woche hineinreichen).
  `uebungsrubrik` ist
  nur gesetzt, wenn es Übungen gibt. Die Spalte »Übungsblatt« (`blaetter`,
  `mitBlaettern`, `spalten`) gibt es nur, solange eine Übung Folien und Blatt hat.
*/
import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import MarkdownIt from 'markdown-it'
import { PDFDocument } from 'pdf-lib'
import { createCssVariablesTheme, createHighlighter } from 'shiki'
import { load } from '@slidev/parser/fs'
import { parse } from 'yaml'

const wurzel = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ziel = join(wurzel, 'dist')
const vorlage = join(wurzel, 'index')
// Die CD-Lockup der Folien, weiß und farbig, für den Kopf der Übungsblätter
const LOCKUPS = ['thm-lockup-white.png', 'thm-lockup.png']
const nurIndex = process.argv.includes('--nur-index')
const ohnePdf = process.argv.includes('--ohne-pdf')
// Immer mit führendem und schließendem Schrägstrich: »/repo/« oder »/«
const basis = `/${(process.env.PAGES_BASE ?? '').replace(/^\/+|\/+$/g, '')}/`.replace(/^\/\/$/, '/')

const istObjekt = w => typeof w === 'object' && w !== null && !Array.isArray(w)

function frontmatter(text) {
  // BOM und Windows-Zeilenenden dürfen den Kopf nicht unsichtbar machen
  const kopf = text.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---/)?.[1]
  const daten = kopf ? parse(kopf) : null
  return istObjekt(daten) ? daten : {}
}

const html = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Feldnamen dürfen Umlaute und Bindestriche tragen (»größe«, »router-mode«).
// Abschnitt und Feld stehen in einem Ausdruck, damit ein Durchlauf genügt.
const PLATZHALTER = /\{\{#([\p{L}\p{N}_-]+)\}\}([\s\S]*?)\{\{\/\1\}\}|\{\{([\p{L}\p{N}_-]+)\}\}/gu

/** Füllt die Platzhalter; `daten` ist eine Kette von innen nach außen. */
function fuelle(text, ...daten) {
  // Nur Objekte befragen: Listeneinträge können auch leer oder Text sein
  const wert = feld => daten.find(d => istObjekt(d) && d[feld] !== undefined && d[feld] !== null)?.[feld]
  // Ein Durchlauf für Abschnitte und Felder — eingesetzte Werte werden so
  // nie selbst wieder als Vorlage gelesen.
  return text.replace(PLATZHALTER, (_, abschnitt, innen, feld) => {
    if (abschnitt === undefined) return html(wert(feld) ?? '')
    const w = wert(abschnitt)
    if (Array.isArray(w)) return w.map(eintrag => fuelle(innen, eintrag, ...daten)).join('')
    return w === undefined || w === false || w === '' ? '' : fuelle(innen, ...daten)
  })
}

const BLATT = 'uebungsblatt.md'

/** Alle Vorlesungen bzw. Übungen eines Sammelordners (`lectures`, `exercises`). */
function foliensaetze(sammlung) {
  const pfad = join(wurzel, sammlung)
  if (!existsSync(pfad)) return []
  return readdirSync(pfad, { withFileTypes: true })
    .filter(e => e.isDirectory() && ['slides.md', BLATT].some(n => existsSync(join(pfad, e.name, n))))
    .map(e => e.name)
    .sort()
    .map((ordner) => {
      const mitFolien = existsSync(join(pfad, ordner, 'slides.md'))
      const mitBlatt = existsSync(join(pfad, ordner, BLATT))
      // Ohne Foliensatz stehen die Angaben im Kopf des Übungsblatts
      const kopf = frontmatter(readFileSync(join(pfad, ordner, mitFolien ? 'slides.md' : BLATT), 'utf8'))
      // »V01 — Einführung …« bzw. »Ü01 — …« in Nummer und Titel zerlegen
      const name = String(kopf.title ?? ordner)
      const [, nummer, titel] = name.match(/^([VÜ]\d+)\s*[—–-]\s*(.+)$/) ?? [null, '', name]
      // Neben einem Foliensatz liegt das Blatt als eigene Seite, sonst ist es die Übung selbst
      const blatt = mitBlatt ? `${ordner}/${mitFolien ? 'uebungsblatt.html' : 'index.html'}` : undefined
      // Ohne `woche` im Frontmatter zählt die Nummer: V03 und Ü03 teilen eine Zeile
      const woche = Number(kopf.woche ?? nummer.replace(/\D/g, '')) || 0
      // `bis` im Frontmatter: der Foliensatz reicht über mehrere Termine
      const bis = Math.max(Number(kopf.bis) || woche, woche)
      const spanne = bis - woche + 1
      const dauer = spanne > 1 ? `Termine ${woche} ${spanne === 2 ? 'und' : 'bis'} ${bis}` : undefined
      return { ...kopf, ordner, verzeichnis: join(pfad, ordner), link: `${ordner}/`, nummer, titel, blatt, mitFolien, woche, bis, spanne, dauer }
    })
}

// Der Dateiname trägt den Foliensatz, damit er auch heruntergeladen noch etwas sagt
const pdfVon = v => `${v.ordner}/${v.ordner}.pdf`
// Darunter gilt ein PDF als leer gedruckt (siehe unten beim Export)
const PDF_MINDESTENS_JE_SEITE = 2 * 1024

const vorlesungen = foliensaetze('lectures')
const uebungen = foliensaetze('exercises')
const alle = [...vorlesungen, ...uebungen]

if (!vorlesungen.length) throw new Error('Keine Foliensätze unter lectures/ gefunden.')

if (!nurIndex) rmSync(ziel, { recursive: true, force: true })
mkdirSync(ziel, { recursive: true })

if (!nurIndex) {
  for (const v of alle.filter(v => v.mitFolien)) {
    console.log(`\n▸ ${v.ordner} → ${basis}${v.ordner}/`)
    // Hash-Adressen (`…/v01-einfuehrung/#/12`): GitHub Pages kennt keine
    // Umleitung auf die index.html, ein echter Pfad je Folie liefe ins Leere.
    // Zielpfade relativ zum Foliensatz: Mit der Shell (Windows) zerfiele ein
    // absoluter Pfad an Leerzeichen im Benutzerverzeichnis.
    const nach = pfad => relative(v.verzeichnis, join(ziel, pfad))
    execFileSync('npx', ['slidev', 'build', '--base', `${basis}${v.ordner}/`, '--router-mode', 'hash', '--out', nach(v.ordner)], {
      cwd: v.verzeichnis,
      stdio: 'inherit',
      // Unter Windows ist npx eine .cmd-Datei und braucht die Shell
      shell: process.platform === 'win32',
    })
    if (ohnePdf) continue
    // Das PDF nach dem Build: `slidev build` leert sein Zielverzeichnis.
    // Wie exportiert wird (eine Seite je Klickschritt), legt das Theme fest:
    // `slidev.defaults.export` in theme-thm/package.json.
    execFileSync('npx', ['slidev', 'export', '--output', nach(pdfVon(v))], {
      cwd: v.verzeichnis,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    })
    // Fragt eine Folie die Höhe eines Size-Containers ab (`container-type:
    // size` mit `cqh`), druckt Chromium alle Seiten leer, und der Export
    // meldet trotzdem Erfolg. Eine leere Seite hat unter 200 B, eine gefüllte
    // über 15 KB: Ist das PDF zu klein, abbrechen, statt es zu veröffentlichen.
    // Ein neuer Versuch hülfe nicht, der Fehler steckt in der Folie.
    const pdf = readFileSync(join(ziel, pdfVon(v)))
    const seiten = (await PDFDocument.load(pdf)).getPageCount()
    if (pdf.length < seiten * PDF_MINDESTENS_JE_SEITE)
      throw new Error(`${pdfVon(v)} ist leer gedruckt: unter ${PDF_MINDESTENS_JE_SEITE / 1024} KB je Seite. `
        + 'Vermutlich fragt eine Folie die Höhe eines Size-Containers ab (cqh), siehe CLAUDE.md, Fallstricke.')
  }
}
// Am Ergebnis abgelesen: Mit `--nur-index` oder `--ohne-pdf` gilt, was in dist/ liegt
for (const v of alle) if (existsSync(join(ziel, pdfVon(v)))) v.pdf = pdfVon(v)

// ---- Übungsblätter ----
// Nach den Foliensätzen: `slidev build` leert sein Zielverzeichnis.
const blattVorlage = readFileSync(join(vorlage, 'blatt.html'), 'utf8')
// Codeblöcke färbt Shiki ein, und zwar über CSS-Variablen (`--code-token-…`):
// Welche Farbe ein Schlüsselwort trägt, steht so in index.css bei den
// CD-Tokens und nicht als Hex-Wert hier. Unbekannte Sprachen bleiben schlicht.
const codeThema = createCssVariablesTheme({ name: 'thm', variablePrefix: '--code-', fontStyle: true })
const SPRACHEN = ['bash', 'markdown', 'java', 'javascript', 'json', 'yaml', 'html', 'css', 'python', 'sql']
const hervorheber = await createHighlighter({ themes: [codeThema], langs: SPRACHEN })
const faerbe = (code, sprache) =>
  hervorheber.getLoadedLanguages().includes(sprache) ? hervorheber.codeToHtml(code.replace(/\n$/, ''), { lang: sprache, theme: 'thm' }) : ''
const md = new MarkdownIt({ html: true, linkify: true, highlight: faerbe })
// ```console wird zum Terminalfenster: Eingaben (`$ …`) und Ausgaben getrennt,
// die Dateizeilen von `git status` rot und grün wie im Terminal.
const zaun = md.renderer.rules.fence
md.renderer.rules.fence = (tokens, idx, ...rest) => {
  const art = tokens[idx].info.trim()
  if (art === 'console') return terminal(tokens[idx].content)
  if (art === 'prompt') return prompt(tokens[idx].content)
  if (/^markdown\s+vorschau$/.test(art)) return vorschau(tokens[idx].content)
  return zaun(tokens, idx, ...rest)
}

// Kasten mit zwei Reitern, der erste ist vorausgewählt. Die Reiter sind
// Radio-Knöpfe, sie wirken ohne Skript und mit der Tastatur. Kästen derselben
// `gruppe` schalten gemeinsam um (index/reiterkasten.js).
let reiterNr = 0
function reiterkasten(titel, felder, gruppe) {
  const n = ++reiterNr
  const kopf = felder.map(({ name }, i) =>
    `<input type="radio" class="rk-wahl rk-wahl-${i + 1}" name="rk-${n}" id="rk-${n}-${i + 1}" value="${name}"${i ? '' : ' checked'}><label for="rk-${n}-${i + 1}">${name}</label>`)
  const inhalt = felder.map(({ html, art }, i) => `<div class="rk-feld rk-feld-${i + 1} rk-${art}">${html}</div>`)
  return `<div class="reiterkasten"${gruppe ? ` data-gruppe="${gruppe}"` : ''}><div class="rk-kopf">${titel ? `<span class="rk-titel">${titel}</span>` : ''}${kopf.join('')}</div>${inhalt.join('')}</div>\n`
}

// ```markdown vorschau wird zum Beispielkasten: „Markdown“ zeigt den
// Quelltext, „Ergebnis“ das, was daraus erscheint. Das Ergebnis rendert der
// Build selbst, im Blatt steht das Beispiel nur einmal.
function vorschau(text) {
  return reiterkasten('Beispiel', [
    { name: 'Markdown', html: faerbe(text, 'markdown'), art: 'quelltext' },
    { name: 'Ergebnis', html: md.render(text, { vorschau: true }), art: 'ergebnis' },
  ])
}

function terminal(text) {
  let abschnitt = ''
  const zeilen = text.replace(/\n$/, '').split('\n').map((zeile) => {
    const z = md.utils.escapeHtml(zeile)
    if (zeile.startsWith('$ ')) {
      abschnitt = ''
      return `<span class="eingabe"><span class="prompt">$ </span>${z.slice(2)}</span>`
    }
    if (/^(Untracked files|Changes not staged)/.test(zeile)) abschnitt = 'rot'
    else if (/^Changes to be committed/.test(zeile)) abschnitt = 'gruen'
    else if (!/^\s/.test(zeile)) abschnitt = ''
    // Farbig sind nur die Dateizeilen, nicht die eingeklammerten Hinweise (»(use "git add" …)«)
    return `<span class="ausgabe${abschnitt && /^\s+[^\s(]/.test(zeile) ? ` ${abschnitt}` : ''}">${z}</span>`
  })
  return `<pre class="terminal"><code>${zeilen.join('\n')}</code></pre>\n`
}

// ```prompt wird zum Eingabefenster von opencode: was man dem Agenten schreibt,
// als Fließtext mit Umbruch — anders als im Terminal zählt hier jedes Wort, nicht die Zeile.
function prompt(text) {
  return `<pre class="terminal agent"><code><span class="prompt">› </span>${md.utils.escapeHtml(text.trim())}</code></pre>\n`
}

// Überschriften bekommen dieselben Sprungmarken, die GitHub im Markdown vergibt —
// ein Verweis wie `[Aufgabe 2](#aufgabe-2--klonen-…)` gilt dann hier wie dort.
md.core.ruler.push('sprungmarken', (state) => {
  // Überschriften im Ergebnis eines Beispiels (```markdown vorschau) bekommen keine Marke
  if (state.env.vorschau) return
  const vergeben = new Map()
  state.tokens.forEach((t, i) => {
    if (t.type !== 'heading_open') return
    const text = state.tokens[i + 1].children.filter(k => k.type === 'text' || k.type === 'code_inline').map(k => k.content).join('')
    const marke = text.trim().toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s/g, '-')
    const zahl = vergeben.get(marke) ?? 0
    vergeben.set(marke, zahl + 1)
    t.attrSet('id', zahl ? `${marke}-${zahl}` : marke)
  })
})

// **Kontrollfrage(n)** mit der folgenden Liste wird zum gelben Kasten. Am
// Tokenstrom statt am fertigen HTML: Die Liste endet an ihrem eigenen
// Schluss-Token, auch wenn ein Punkt selbst eine Liste enthält.
md.core.ruler.push('fragen', (state) => {
  const t = state.tokens
  const block = (inhalt) => {
    const token = new state.Token('html_block', '', 0)
    token.content = inhalt
    return token
  }
  const html = (von, bis) => md.renderer.render(t.slice(von, bis), md.options, state.env)
  const listenEnde = (auf) => t.findIndex((k, n) => n > auf && k.type === 'bullet_list_close' && k.level === t[auf].level)
  // Die Punkte einer Liste als Bereiche [Anfang, Ende) im Tokenstrom
  const punkte = (auf, zu) => {
    const bereiche = []
    for (let k = auf + 1; k < zu; k++) {
      if (t[k].type !== 'list_item_open' || t[k].level !== t[auf].level + 1) continue
      const e = t.findIndex((x, n) => n > k && x.type === 'list_item_close' && x.level === t[k].level)
      bereiche.push([k, e + 1])
      k = e
    }
    return bereiche
  }
  for (let i = 0; i + 3 < t.length; i++) {
    if (t[i].type !== 'paragraph_open' || t[i + 3].type !== 'bullet_list_open') continue
    const name = t[i + 1].content.match(/^\*\*(Kontrollfragen?)\*\*$/)?.[1]
    if (!name) continue
    const ende = listenEnde(i + 3)
    if (ende < 0) continue
    // Folgen die Musterantworten als zugeklappter Abschnitt (<details>, auf
    // GitHub lesbar), stehen sie im Kasten hinter einem zweiten Reiter: je
    // Frage die Antwort darunter, damit niemand hin- und herschalten muss.
    const einzahl = name === 'Kontrollfrage'
    const auf = t[ende + 1]
    if (auf?.type === 'html_block' && /^<details>\s*<summary>Musterantwort(?:en)?<\/summary>/.test(auf.content)) {
      // Ohne Leerzeile nach </summary> schluckt der HTML-Block die Liste
      if (!/<\/summary>\s*$/.test(auf.content))
        throw new Error(`${name} ab Zeile ${t[i].map[0] + 1}: Nach </summary> fehlt die Leerzeile`)
      const liste = ende + 2
      const listeZu = t[liste]?.type === 'bullet_list_open' ? listenEnde(liste) : -1
      if (listeZu < 0 || t[listeZu + 1]?.type !== 'html_block' || !/^<\/details>\s*$/.test(t[listeZu + 1].content))
        throw new Error(`${name} ab Zeile ${t[i].map[0] + 1}: Nach <summary> wird eine Liste erwartet, danach </details>, je durch eine Leerzeile getrennt`)
      const fragen = punkte(i + 3, ende)
      const antworten = punkte(liste, listeZu)
      if (fragen.length !== antworten.length)
        throw new Error(`${name} ab Zeile ${t[i].map[0] + 1}: ${fragen.length} Fragen, aber ${antworten.length} Musterantworten`)
      const paare = fragen.map(([fa, fe], k) => `<li><div class="frage-wdh">${html(fa + 1, fe - 1)}</div>${html(antworten[k][0] + 1, antworten[k][1] - 1)}</li>`)
      const kasten = reiterkasten(name, [
        { name: einzahl ? 'Frage' : 'Fragen', html: html(i + 3, ende + 1), art: 'fragen' },
        { name: einzahl ? 'Musterantwort' : 'Musterantworten', html: `<ul class="antworten">${paare.join('')}</ul>`, art: 'antworten' },
      ])
      t.splice(i, listeZu + 2 - i, block(`<aside class="fragen mit-antworten">\n${kasten}</aside>\n`))
      continue
    }
    t.splice(ende + 1, 0, block('</aside>\n'))
    t.splice(i, 3, block(`<aside class="fragen"><p class="fragen-kopf">${name}</p>\n`))
  }
})

/**
  Wiederkehrende Muster des Übungsblatts bekommen ihre Form hier, damit das
  Markdown schlicht bleibt und auch auf GitHub lesbar ist:

    *Auf Ihrem Rechner, 15 Minuten.*   unter einer Überschrift: Angabe zu Ort und Dauer
    **Kontrollfrage(n)** + Liste       gelber Kasten zur Selbstkontrolle — Gelb heißt »hier sind Sie gefragt«
                                       (Regel `fragen` oben, nicht hier); folgt
                                       <details><summary>Musterantworten</summary> mit Liste,
                                       bekommt er die Reiter „Fragen“ und „Musterantworten“
    **Terminal** + ```console          die Zwischenzeile entfällt, das Fenster trägt den Titel
    ```prompt                          Eingabefenster „opencode“: was man dem Agenten schreibt
    **VS Code:** …                     Kasten mit dem Klickweg
    beides direkt hintereinander       ein Kasten mit den Reitern „Terminal“ (vorausgewählt) und „Visual Studio Code“
    > [!IMPORTANT] …                   roter Kasten „Wichtig“, z.B. für Regeln der Einreichung (GitHub zeigt ihn ebenso)
    > [!NOTE] …                        grüner Kasten „Hinweis“ für eine Information am Rand
*/
const KAESTEN = {
  IMPORTANT: { klasse: 'wichtig', titel: 'Wichtig' },
  NOTE: { klasse: 'info', titel: 'Hinweis' },
}
function forme(inhalt) {
  return inhalt
    .replace(/(<\/h[23]>\s*)<p><em>([^<]+?)\.?<\/em><\/p>/g, '$1<p class="angabe">$2</p>')
    .replace(/<p><strong>Terminal<\/strong><\/p>\s*(?=<pre class="terminal">)/g, '')
    // Kein `[\s\S]*?` bis </pre>: Folgt einem Terminal kein Klickweg, liefe der Ausdruck ins nächste weiter
    .replace(/(<pre class="terminal">(?:(?!<\/pre>)[\s\S])*<\/pre>)\s*<p><strong>VS Code:<\/strong>\s*((?:(?!<\/p>)[\s\S])*)<\/p>\s*/g,
      (_, befehl, klickweg) => reiterkasten('', [
        { name: 'Terminal', html: befehl, art: 'terminal' },
        { name: 'Visual Studio Code', html: `<div class="vscode"><p class="vscode-kopf">Visual Studio Code</p><p>${klickweg}</p></div>`, art: 'vscode' },
      ], 'befehl'))
    // Steht die Marke allein im Absatz, folgen eigene Blöcke (Absatz, Liste);
    // sonst geht der Absatz hinter der Marke weiter und braucht sein <p>
    .replace(/<blockquote>\s*<p>\[!(IMPORTANT|NOTE)\]\s*(<\/p>\s*)?([\s\S]*?)<\/blockquote>/g, (_, art, allein, text) => {
      // Der Ausdruck endet am ersten </blockquote>: Ein Zitat im Kasten würde ihn zerbrechen
      if (text.includes('<blockquote>'))
        throw new Error(`Kasten [!${art}] „${text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 40)}…“: Ein Zitat im Kasten kann der Build nicht darstellen`)
      return `<aside class="${KAESTEN[art].klasse}"><p class="${KAESTEN[art].klasse}-kopf">${KAESTEN[art].titel}</p>\n${allein ? '' : '<p>'}${text}</aside>`
    })
    .replace(/<p><strong>VS Code:<\/strong>\s*([\s\S]*?)<\/p>/g, '<div class="vscode"><p class="vscode-kopf">Visual Studio Code</p><p>$1</p></div>')
}
for (const v of alle.filter(v => v.blatt)) {
  // Der Kopf mit den Angaben zur Übung gehört nicht auf die Seite
  const text = readFileSync(join(v.verzeichnis, BLATT), 'utf8').replace(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
  // Die Überschrift am Kopf des Blatts wandert als Titel in den Seitenkopf.
  // Nur dort gesucht: Weiter unten beginnen auch Kommentare einer Szene und
  // Zeilen in Codeblöcken mit »# «.
  const kopfzeile = text.match(/^\s*# +(.+)\r?\n?/)
  const titel = kopfzeile?.[1].trim() ?? v.titel
  const inhalt = forme(md.render(kopfzeile ? text.slice(kopfzeile[0].length) : text))
  mkdirSync(join(ziel, v.ordner), { recursive: true })
  // Der Inhalt ist fertiges HTML und wird deshalb nach dem Füllen eingesetzt
  const seiteHtml = fuelle(blattVorlage, { titel, rubrik: v.mitFolien ? 'Übungsblatt' : 'Übung', folien: v.mitFolien ? './' : undefined }, v)
    .replace('<!--inhalt-->', () => inhalt)
  writeFileSync(join(ziel, v.blatt), seiteHtml)
}

// ---- Foliennotizen ----
// Die Notizen sind Lernmaterial, im Foliensatz selbst aber nur in der
// Referentenansicht zu sehen. Deshalb je Foliensatz eine Seite, die sie in
// der Folge der Folien zeigt. Der Parser von Slidev löst eingebundene Folien
// (`src:`) auf und lässt ausgeblendete weg — die Nummern stimmen so mit denen
// im Foliensatz überein.
// Zeilenumbrüche gelten wie in der Notizansicht von Slidev: Belege stehen zeilenweise
const notizMd = new MarkdownIt({ html: true, linkify: true, breaks: true })
for (const v of alle.filter(v => v.mitFolien)) {
  const { slides } = await load({ userRoot: v.verzeichnis, roots: [v.verzeichnis] }, join(v.verzeichnis, 'slides.md'))
  const notizen = slides
    .map((folie, i) => ({ nr: i + 1, titel: folie.frontmatter.titel ?? folie.title, text: folie.note?.trim() }))
    .filter(n => n.text)
  if (!notizen.length) continue
  v.notizen = `${v.ordner}/notizen.html`
  // Ohne gebauten Foliensatz (`--nur-index`) liefe der Link der Übersicht ins Leere — die Seite entsteht trotzdem
  const inhalt = notizen.map(n =>
    `<h2 id="folie-${n.nr}"><a href="./#/${n.nr}">Folie ${n.nr}</a>${n.titel ? ` — ${html(n.titel)}` : ''}</h2>\n${notizMd.render(n.text)}`).join('\n')
  mkdirSync(join(ziel, v.ordner), { recursive: true })
  const seiteHtml = fuelle(blattVorlage, { titel: v.nummer ? `${v.nummer} — ${v.titel}` : v.titel, rubrik: 'Foliennotizen', folien: './' }, v)
    .replace('<!--inhalt-->', () => inhalt)
  writeFileSync(join(ziel, v.notizen), seiteHtml)
}

// ---- Übersichtsseite ----
// Zeitleiste: je Woche eine Zeile mit Vorlesungen, Übungen und Übungsblättern.
// Jede Liste ist gesetzt, auch leer — sonst griffe die Vorlage auf die
// gleichnamige Liste der Seite zurück.
// Eine Vorlesung über mehrere Termine (`bis`) belegt ihre Zelle in allen
// diesen Zeilen: Sie beginnt in der ersten, die übrigen führen sie unter
// `weiter` und lassen die Zelle dafür frei. Nur Vorlesungen reichen über
// mehrere Zeilen; eine Übung belegt ihre eine.
const belegt = [
  ...vorlesungen.flatMap(v => Array.from({ length: v.spanne }, (_, i) => v.woche + i)),
  ...uebungen.map(v => v.woche),
]
const wochen = [...new Set(belegt)].sort((a, b) => a - b).map((woche, i) => {
  const hier = vorlesungen.filter(v => v.woche === woche)
  const weiter = vorlesungen.filter(v => v.woche < woche && woche <= v.bis)
  // Die Zelle ist von der weiterlaufenden Vorlesung belegt — eine, die hier
  // beginnt, fiele still aus der Übersicht
  if (weiter.length && hier.length) {
    throw new Error(`${hier.map(v => v.nummer).join(', ')} beginnt in Woche ${woche}, die ${weiter.map(v => v.nummer).join(', ')} mit \`bis\` noch belegt.`)
  }
  return {
    woche: woche || '–',
    zeile: i + 1,
    vorlesungen: hier,
    vlSpanne: Math.max(1, ...hier.map(v => v.spanne)),
    vlZelle: !weiter.length,
    weiter,
    uebungen: uebungen.filter(v => v.woche === woche),
    blaetter: uebungen.filter(v => v.woche === woche && v.blatt && v.mitFolien).map(v => ({
      link: v.blatt,
      nummer: v.nummer,
      titel: 'Übungsblatt',
      beschreibung: 'Einrichtung, Anleitung und Aufgaben zum Nachlesen',
    })),
  }
})

// Leere Schlüssel in seite.yaml (»veranstaltung:«) lassen die Vorgabe stehen
const angaben = parse(readFileSync(join(vorlage, 'seite.yaml'), 'utf8'))
const seite = {
  rubrik: 'Veranstaltungsunterlagen',
  veranstaltung: vorlesungen[0].veranstaltung ?? 'Vorlesung',
  dozent: vorlesungen[0].dozent,
  ...(uebungen.length ? { uebungsrubrik: 'Übungen' } : {}),
  // Die dritte Spalte steht nur, wenn eine Übung neben den Folien ein Blatt hat
  ...(uebungen.some(v => v.blatt && v.mitFolien) ? { mitBlaettern: true, spalten: 3 } : { spalten: 2 }),
  ...Object.fromEntries(Object.entries(istObjekt(angaben) ? angaben : {}).filter(([, w]) => w !== null)),
  vorlesungen,
  uebungen,
  wochen,
}

// Jedes Token, das die Gestaltung nutzt, muss es im Theme oder in ihr selbst geben
const tokens = readFileSync(join(wurzel, 'theme-thm', 'styles', 'tokens.css'), 'utf8')
// Die Stylesheets der Vorlage stehen gemeinsam auf einer Seite: Was eines
// festlegt, darf ein anderes nutzen.
const stylesheets = readdirSync(vorlage).filter(n => n.endsWith('.css')).map(datei => [datei, readFileSync(join(vorlage, datei), 'utf8')])
const bekannt = tokens + stylesheets.map(([, css]) => css).join('\n')
for (const [datei, css] of stylesheets) {
  for (const [, name] of css.matchAll(/var\(\s*(--[\w-]+)/g)) {
    if (!new RegExp(`${name}\\s*:`).test(bekannt)) throw new Error(`Token ${name} aus index/${datei} fehlt in theme-thm/styles/tokens.css.`)
  }
}

// Was der Build selbst nach dist/ schreibt, darf index/ nicht mitbringen —
// sonst würde es still überschrieben oder in einen Foliensatz gemischt.
for (const name of ['tokens.css', ...LOCKUPS, ...alle.map(v => v.ordner)]) {
  if (existsSync(join(vorlage, name))) throw new Error(`index/${name} kollidiert mit einer Ausgabe des Builds.`)
}

// Alles aus index/ übernehmen; Datendatei und Blattvorlage bleiben im Repository,
// .DS_Store aus lokalen Builds ebenso
cpSync(vorlage, ziel, {
  recursive: true,
  filter: quelle => !['seite.yaml', 'blatt.html'].some(n => quelle === join(vorlage, n)) && basename(quelle) !== '.DS_Store',
})
// Die Tokens des Themes, damit die Übersicht nicht von den Folien abweicht
writeFileSync(join(ziel, 'tokens.css'), tokens)
// Die Lockup aus dem Theme, damit Blatt und Folien dieselbe Datei zeigen
for (const name of LOCKUPS) cpSync(join(wurzel, 'theme-thm', 'assets', name), join(ziel, name))
writeFileSync(join(ziel, 'index.html'), fuelle(readFileSync(join(vorlage, 'index.html'), 'utf8'), seite))

console.log(nurIndex
  ? '✓ Übersichtsseite nach dist/ gebaut'
  : `\n✓ ${alle.filter(v => v.mitFolien).length} Foliensätze, ${alle.filter(v => v.pdf).length} PDFs, ${alle.filter(v => v.blatt).length} Übungsblätter und ${alle.filter(v => v.notizen).length} Notizenseiten nach dist/ gebaut (Basispfad ${basis})`)
