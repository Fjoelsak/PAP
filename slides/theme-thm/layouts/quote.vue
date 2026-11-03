<!--
  Vollflächiges Zitat auf dunkler Rasterfläche: grünes Quadrat mit
  Anführungszeichen, das Zitat groß in Weiß, darunter die Herkunft
  neben einem grünen Balken. Hervorhebungen (**…**) erscheinen in Grün.

  Frontmatter:
    layout: quote
    rubrik: Zum Einstieg     # optional
    autor: Carsten Lucke
    smiley: true             # setzt ein Smiley neben die Herkunft

  Slot `::botschaft::` (optional): die Aussage des Zitats in einfachen
  Worten, als grünes Merksatz-Band unter dem Zitat — für Zitate, die sich
  nicht von selbst erschließen.
-->
<script setup lang="ts">
defineProps<{ rubrik?: string; autor?: string; smiley?: boolean; ton?: string }>()
</script>

<template>
  <div class="slidev-layout thm-quote thm-dark">
    <ThmLockup hell />
    <div class="q-inner">
      <div v-if="rubrik" class="thm-eyebrow">{{ rubrik }}</div>
      <ThmIcon name="quote" box :size="2.6" class="q-glyph" />
      <blockquote class="q-body"><slot /></blockquote>
      <div v-if="autor" class="q-autor">
        <span class="q-strich" />
        <span>{{ autor }}</span>
        <ThmIcon v-if="smiley" name="smile" ton="weiss" :size="1.3" class="q-smiley" />
      </div>
      <Callout v-if="$slots.botschaft" icon="lightbulb" class="q-botschaft">
        <slot name="botschaft" />
      </Callout>
    </div>
    <SlideFooter dunkel />
  </div>
</template>

<style scoped>
.thm-quote {
  padding: 0 var(--slide-pad-x);
  overflow: hidden;
}

.q-inner {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 44rem;
}

.q-glyph { margin: 0.4rem 0 1.4rem; }

.q-body {
  margin: 0;
  padding: 0;
  border: 0;
  color: var(--white);
  font-size: 2rem;
  font-weight: var(--fw-medium);
  line-height: 1.3;
}

.q-body :deep(strong) { color: var(--thm-green-400); }
.q-body :deep(p:last-child) { margin-bottom: 0; }

.q-autor {
  margin-top: 1.8rem;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  color: var(--white);
  font-weight: var(--fw-bold);
  font-size: 0.95rem;
}

.q-strich {
  width: 0.35rem;
  height: 1.4rem;
  background: var(--thm-green-500);
}

.q-smiley { color: var(--thm-green-400); }

.q-botschaft { margin-top: 1.8rem; }
</style>
