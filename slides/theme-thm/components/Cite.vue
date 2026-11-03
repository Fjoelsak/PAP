<!--
  Literaturverweis als eckiges Tag in eckigen Klammern. Cyan steht in dieser
  Vorlesungsreihe durchgängig für Herkunft — hier als Klammern und zarter
  Grund, damit der Verweis im Fließtext erkennbar, aber nicht laut ist.

  Verwendung:
    … durchgeführt werden <Cite>BJN+06, S. 212</Cite>.
    <Cite icon>Balzert, 2009, S. 3</Cite>

  Steht der Verweis im Literaturverzeichnis (siehe <Quelle>), ist er
  klickbar und springt auf den hervorgehobenen Eintrag.
-->
<script setup lang="ts">
import { computed, inject, onMounted, onUpdated, ref } from 'vue'
import { useLiteratur } from '../composables/literatur'

defineProps<{ icon?: boolean }>()

const { finde, springe } = useLiteratur()
const imVerzeichnis = inject('thm-im-verzeichnis', false)

// Der Verweistext kommt aus dem Slot; gelesen wird er aus dem DOM, weil
// sich ein Slot außerhalb der Render-Funktion nicht auswerten lässt.
const textEl = ref<HTMLElement>()
const text = ref('')
const lies = () => { text.value = textEl.value?.textContent ?? '' }
onMounted(lies)
onUpdated(lies)

const ziel = computed(() => (imVerzeichnis ? undefined : finde(text.value)))
</script>

<template>
  <span
    class="cite"
    :class="{ link: ziel }"
    :role="ziel ? 'link' : undefined"
    :tabindex="ziel ? 0 : undefined"
    :title="ziel ? 'Zum Eintrag im Literaturverzeichnis' : undefined"
    @click="ziel && ($event.stopPropagation(), springe(text))"
    @keydown.enter="ziel && springe(text)"
  >
    <ThmIcon v-if="icon" name="book-open" :size="0.95" class="cite-icon" />
    <span class="cite-br" aria-hidden="true">[</span><span ref="textEl" class="cite-text"><slot /></span><span class="cite-br" aria-hidden="true">]</span>
  </span>
</template>

<style scoped>
.cite {
  display: inline-flex;
  align-items: center;
  gap: 0.1em;
  padding: 0.08em 0.6em;
  border-radius: 0;
  background: var(--role-source-soft);
  border: 1px solid color-mix(in srgb, var(--role-source) 45%, transparent);
  color: var(--thm-grey-700);
  font-size: 0.78em;
  font-weight: var(--fw-semibold);
  font-style: normal;
  line-height: 1.35;
  white-space: nowrap;
  vertical-align: 0.08em;
}

.cite.link { cursor: pointer; }
.cite.link:hover,
.cite.link:focus-visible {
  border-color: var(--role-source);
  outline: none;
}

.cite-br {
  color: var(--role-source);
  font-weight: var(--fw-bold);
}

.cite-icon {
  color: var(--role-source);
  margin-right: 0.3em;
}
</style>
