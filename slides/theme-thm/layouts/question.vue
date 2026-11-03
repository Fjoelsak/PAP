<!--
  Frage an die Teilnehmer:innen: vollflächig Gelb mit dem feinen Raster
  der dunklen Folien, einem großen gelben Fragezeichen-Quadrat und der
  Frage groß in Weiß. Gelb heißt in dieser Vorlesungsreihe immer „hier
  sind Sie gefragt“.

  Frontmatter:
    layout: question
    titel: Bedeutung von Software     # optional, als Rubrik über der Frage

  Für Folien mit mehreren Fragen untereinander stattdessen `layout: default`
  mit mehreren <QuestionItem> verwenden.
-->
<script setup lang="ts">
defineProps<{ titel?: string }>()
</script>

<template>
  <div class="slidev-layout thm-question thm-dark">
    <ThmLockup hell />
    <div class="q-ghost" aria-hidden="true">?</div>
    <div class="q-inner">
      <div class="thm-eyebrow q-eyebrow">{{ titel ?? 'Frage an Sie' }}</div>
      <div class="q-text"><slot /></div>
    </div>
    <SlideFooter dunkel />
  </div>
</template>

<style scoped>
.thm-question {
  padding: 0 var(--slide-pad-x);
  overflow: hidden;
  background-color: var(--role-ask);
  --grid-line-dark: rgba(255, 255, 255, 0.13);
}

.q-ghost {
  position: absolute;
  right: 3.4rem;
  bottom: 1.2rem;
  font-size: 17rem;
  line-height: 1;
  font-weight: var(--fw-bold);
  color: var(--white);
  opacity: 0.3;
}

.q-inner {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 40rem;
}

.q-eyebrow {
  color: var(--white) !important;
  opacity: 0.9;
  margin-bottom: 1rem;
}

.q-text {
  color: var(--white);
  font-size: 2.15rem;
  font-weight: var(--fw-semibold);
  line-height: 1.25;
}

/* Auf Gelb wirken die sonst üblichen dunklen Textfarben fast schwarz —
   hier stattdessen ein kräftiges dunkles Grau für beide Hervorhebungen. */
.q-text :deep(.term),
.q-text :deep(strong) {
  color: var(--thm-grey-800);
  font-weight: var(--fw-bold);
  font-style: normal;
}

.q-text :deep(p) { margin-bottom: 0.9rem; }
.q-text :deep(p:last-child) { margin-bottom: 0; }
</style>
