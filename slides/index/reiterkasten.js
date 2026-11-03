/*
  Reiterkästen einer Gruppe schalten gemeinsam um (scripts/build-pages.mjs,
  `reiterkasten()`): Wer im Kasten eines Schritts „Visual Studio Code“ wählt,
  sieht es in allen Kästen der Seite und beim nächsten Besuch wieder. Ohne
  Skript wirkt jeder Kasten für sich, vorausgewählt ist der erste Reiter.
  Kästen ohne `data-gruppe` (die Beispiele) bleiben für sich.
*/
(() => {
  const SCHLUESSEL = 'reiterkasten-'

  function waehle(gruppe, wert) {
    for (const knopf of document.querySelectorAll(`.reiterkasten[data-gruppe="${gruppe}"] .rk-wahl`))
      if (knopf.value === wert) knopf.checked = true
  }

  document.addEventListener('change', (ev) => {
    const knopf = ev.target.closest?.('.rk-wahl')
    const gruppe = knopf?.closest('.reiterkasten')?.dataset.gruppe
    if (!gruppe) return
    // Die Kästen darüber wechseln mit die Höhe; der angeklickte bleibt an seinem Platz
    const vorher = knopf.closest('.reiterkasten').getBoundingClientRect().top
    waehle(gruppe, knopf.value)
    window.scrollBy(0, knopf.closest('.reiterkasten').getBoundingClientRect().top - vorher)
    try { localStorage.setItem(SCHLUESSEL + gruppe, knopf.value) } catch {}
  })

  const gruppen = new Set([...document.querySelectorAll('.reiterkasten[data-gruppe]')].map(k => k.dataset.gruppe))
  for (const gruppe of gruppen) {
    let wert = null
    try { wert = localStorage.getItem(SCHLUESSEL + gruppe) } catch {}
    if (wert) waehle(gruppe, wert)
  }
})()
