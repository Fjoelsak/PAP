<!--
  Inhaltskarte im Stil des Design-Systems.

  Töne:
    tone="soft"  — helles Grau-50, der Normalfall (Voreinstellung)
    tone="tint"  — zartes Grün, für Definitionen und Kernaussagen
    tone="green" — THM Grün, weiße Schrift, für die hervorgehobene Karte
    tone="grey"  — THM Grau, weiße Schrift
    tone="plain" — weiß mit Rahmen
    tone="light" — älterer Name für „soft“

  Bausteine (alle optional):
    icon="layers"      Icon im grünen Quadrat über dem Titel (icons.ts)
    icon-ton="grau"    Farbe des Icon-Quadrats
    titel="…"          fette Kartenüberschrift
    nummer="01"        kleine grüne Ordnungszahl über dem Icon
    band="gruen|grau"  Titel und Icon stehen weiß in einem Farbband
    quelle="…"         Beleg am Kartenfuß; ein Verweis in eckigen Klammern
                       (oder die ganze Angabe) erscheint als <Cite>-Pill
    akzent             grüner Balken am linken Rand
    kompakt            Icon neben statt über dem Titel — für dichte Raster
    center             Inhalt mittig
-->
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  tone?: 'soft' | 'tint' | 'green' | 'grey' | 'plain' | 'light'
  icon?: string
  iconTon?: 'gruen' | 'grau' | 'gelb' | 'cyan' | 'rot' | 'weiss'
  titel?: string
  nummer?: string
  band?: 'gruen' | 'grau'
  quelle?: string
  akzent?: boolean
  kompakt?: boolean
  center?: boolean
}>()

/* „IEEE Standard Glossary [ANSI83, S. 31]“ → Vortext + Pill mit dem Kürzel;
   eine Angabe ganz ohne Klammern wird als Ganzes zur Pill. */
const beleg = computed(() => {
  if (!props.quelle) return undefined
  const m = props.quelle.match(/^(.*?)\s*\[([^\]]+)\]\s*$/)
  return m ? { vor: m[1], ref: m[2] } : { vor: '', ref: props.quelle }
})
</script>

<template>
  <div
    class="thm-card"
    :class="[tone === 'light' ? 'soft' : (tone ?? 'soft'), { center, akzent, kompakt, 'has-band': band }]"
  >
    <div v-if="band" class="card-band" :class="band">
      <ThmIcon v-if="icon" :name="icon" ton="weiss" :size="1.35" />
      <span>{{ titel }}</span>
    </div>
    <div class="card-inner">
      <div v-if="nummer" class="card-num">{{ nummer }}</div>
      <div v-if="(icon || titel) && !band" class="card-head">
        <ThmIcon
          v-if="icon"
          :name="icon"
          box
          :size="kompakt ? 1.7 : undefined"
          :ton="iconTon ?? (tone === 'green' ? 'weiss' : 'gruen')"
          class="card-icon"
        />
        <div v-if="titel" class="card-title">{{ titel }}</div>
      </div>
      <div class="card-text"><slot /></div>
      <div v-if="quelle || $slots.fuss" class="card-foot">
        <slot name="fuss">
          <span v-if="beleg?.vor" class="foot-vor">{{ beleg.vor }}</span>
          <Cite v-if="beleg">{{ beleg.ref }}</Cite>
        </slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.thm-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  line-height: var(--lh-snug);
  font-size: 0.84em;
}

.card-inner {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: var(--card-pad);
  min-height: 0;
}

.thm-card.soft  { background: var(--card-bg); color: var(--text-body); }
.thm-card.tint  { background: var(--thm-green-50); color: var(--text-strong); }
.thm-card.green { background: var(--thm-green-500); color: var(--white); }
.thm-card.grey  { background: var(--thm-grey-600); color: var(--white); }
.thm-card.plain { background: var(--white); color: var(--text-body); border: 1px solid var(--border-default); }

.thm-card.akzent { border-left: 0.25rem solid var(--thm-green-500); }

.thm-card.center .card-inner {
  align-items: center;
  justify-content: center;
  text-align: center;
}

.card-band {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 1.05rem;
  color: var(--white);
  font-weight: var(--fw-bold);
  font-size: 1.2em;
  line-height: 1.2;
}

.card-band.gruen { background: var(--thm-green-500); }
.card-band.grau  { background: var(--thm-grey-600); }

.card-num {
  font-size: 0.8em;
  font-weight: var(--fw-bold);
  color: var(--thm-green-700);
  letter-spacing: 0.08em;
  margin-bottom: 0.45rem;
}

.card-head {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.card-icon { margin-bottom: 0.7rem; }

.thm-card.kompakt .card-head {
  flex-direction: row;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.45rem;
}

.thm-card.kompakt .card-icon { margin-bottom: 0; }
.thm-card.kompakt .card-title { margin-bottom: 0; }

.card-title {
  font-weight: var(--fw-bold);
  font-size: 1.12em;
  line-height: 1.25;
  color: var(--text-strong);
  margin-bottom: 0.35rem;
}

.thm-card.green .card-title,
.thm-card.grey .card-title,
.thm-card.green .card-num,
.thm-card.grey .card-num { color: inherit; }

.card-text :deep(p:last-child) { margin-bottom: 0; }
.card-text :deep(p) { margin-bottom: 0.5rem; }

.card-foot {
  margin-top: auto;
  padding-top: 0.6rem;
  border-top: 1px solid var(--border-default);
  font-size: 0.92em;
  color: var(--text-muted);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem 0.5rem;
}

.card-foot .cite { font-size: 0.9em; }

/* Fußzeile braucht Abstand zum Text, auch wenn die Karte nicht gestreckt ist */
.card-text:not(:last-child) { margin-bottom: 0.7rem; }

.thm-card.green .card-foot,
.thm-card.grey .card-foot {
  color: rgba(255, 255, 255, 0.8);
  border-top-color: rgba(255, 255, 255, 0.3);
}

.thm-card.green :deep(strong),
.thm-card.grey :deep(strong) { color: inherit; }

.thm-card :deep(ul) { margin-bottom: 0; }
.thm-card :deep(ul > li) { margin-bottom: 0.4rem; }
.thm-card.green :deep(ul > li::before),
.thm-card.grey :deep(ul > li::before) { background: rgba(255, 255, 255, 0.75); }
</style>
