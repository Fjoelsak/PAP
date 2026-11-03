<!--
  Gliederung der Vorlesung — in zwei Gestalten:

  Ohne `aktiv` die Übersicht: helle Folie mit einer nummerierten Karte
  je Gliederungspunkt.

  Mit `aktiv: n` der Abschnittstrenner vor Punkt n: dunkle Rasterfläche,
  „Abschnitt 0n“ in grünen Versalien, der Punkt als großer Titel, die
  Nummer blass im Hintergrund und das Icon des Punktes im grünen Quadrat.

  Frontmatter:
    layout: agenda
    punkte:
      - Was ist Software?
      - Warum ist Software so schwer zu entwickeln?
      - Was ist Softwaretechnik?
    icons: [box, hourglass, pencil-ruler]   # optional, aus icons.ts
    aktiv: 2          # 1-basiert, weglassen für die Übersicht
    titel: Agenda     # Titel der Übersicht (Voreinstellung)
    rubrik: Überblick
-->
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  punkte: string[]
  icons?: string[]
  aktiv?: number
  titel?: string
  rubrik?: string
  thema?: string
}>()

const nr = (i: number) => String(i).padStart(2, '0')
const aktuell = computed(() => (props.aktiv ? props.punkte[props.aktiv - 1] : undefined))
const aktIcon = computed(() => (props.aktiv ? props.icons?.[props.aktiv - 1] : undefined))
</script>

<template>
  <!-- Abschnittstrenner -->
  <div v-if="aktiv" class="slidev-layout thm-section thm-dark deep">
    <ThmLockup hell />
    <div class="se-ghost" aria-hidden="true">{{ nr(aktiv) }}</div>
    <div class="se-text">
      <div class="thm-eyebrow">Abschnitt {{ nr(aktiv) }}</div>
      <h1>{{ aktuell }}</h1>
      <div class="thm-bar se-bar" />
    </div>
    <div class="se-deko" aria-hidden="true">
      <span class="se-quad grau" />
      <span class="se-quad hell" />
      <ThmIcon v-if="aktIcon" :name="aktIcon" box :size="5" class="se-icon" />
      <span v-else class="se-icon se-leer" />
    </div>
    <SlideFooter dunkel />
  </div>

  <!-- Übersicht -->
  <div v-else class="slidev-layout thm-agenda">
    <ThmLockup />
    <SlideHead :rubrik="rubrik ?? 'Überblick'" :titel="titel ?? 'Agenda'" />
    <div class="ag-grid" :style="{ '--n': punkte.length }">
      <div v-for="(p, i) in punkte" :key="i" class="ag-item">
        <div class="ag-nr" :class="i % 2 ? 'grau' : 'gruen'">{{ nr(i + 1) }}</div>
        <div class="ag-body">
          <ThmIcon v-if="icons?.[i]" :name="icons[i]" ton="gruen" :size="1.7" />
          <div class="ag-titel">{{ p }}</div>
        </div>
      </div>
    </div>
    <SlideFooter />
  </div>
</template>

<style scoped>
/* ---------- Übersicht ---------- */
.ag-grid {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-rows: repeat(var(--n), minmax(0, 1fr));
  gap: var(--grid-gap);
  max-height: 20rem;
}

.ag-item {
  display: flex;
  background: var(--card-bg);
  min-height: 0;
}

.ag-nr {
  flex: none;
  width: 5.4rem;
  display: grid;
  place-items: center;
  color: var(--white);
  font-size: 1.9rem;
  font-weight: var(--fw-bold);
}

.ag-nr.gruen { background: var(--thm-green-500); }
.ag-nr.grau  { background: var(--thm-grey-600); }

.ag-body {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0 1.5rem;
}

.ag-titel {
  font-size: 1.35rem;
  font-weight: var(--fw-bold);
  color: var(--text-strong);
  line-height: 1.2;
}

/* ---------- Abschnittstrenner ---------- */
.thm-section {
  padding: 0;
  overflow: hidden;
}

.se-ghost {
  position: absolute;
  right: 5.2rem;
  top: 3.2rem;
  font-size: 9.5rem;
  font-weight: var(--fw-bold);
  line-height: 1;
  color: var(--white);
  opacity: 0.1;
  letter-spacing: -0.02em;
}

.se-text {
  position: absolute;
  left: var(--slide-pad-x);
  top: 0;
  bottom: 0;
  width: 60%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.se-text h1 {
  color: var(--white);
  font-size: 2.5rem;
  line-height: 1.1;
  margin-top: 0.3rem;
}

.se-bar {
  width: 5.8rem;
  margin-top: 2.2rem;
}

.se-deko {
  position: absolute;
  right: 5.2rem;
  bottom: 5.4rem;
  width: 5rem;
  height: 5rem;
}

.se-icon {
  position: absolute;
  inset: 0;
}

.se-leer { background: var(--thm-green-500); }

.se-quad {
  position: absolute;
  width: 2rem;
  height: 2rem;
}

.se-quad.hell {
  background: var(--thm-green-400);
  left: -2.7rem;
  bottom: 0;
}

.se-quad.grau {
  background: var(--thm-grey-500);
  right: -2.7rem;
  top: -2.7rem;
}
</style>
