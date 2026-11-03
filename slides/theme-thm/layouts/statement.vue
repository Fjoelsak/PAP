<!--
  Große, freistehende Aussage unter einem optionalen Folienkopf.

  Mit Zitat-Glyphe (Voreinstellung) steht der Text auf zartem Grün hinter
  einem grünen Balken, das Anführungszeichen im grünen Quadrat davor —
  für die Kernsätze und Definitionen aus der Literatur.
  Mit `zitat: false` steht die Aussage größer und ohne Kasten, nur mit
  dem grünen Balken links — für eigene Kernaussagen.

  Frontmatter:
    layout: statement
    rubrik: Was ist Software?     # optional
    titel: …                      # optional
    zitat: false                  # optional
    label: Definition             # optional, grüne Versalien über dem Text

  Eine nachgestellte Erläuterung steht in <span class="st-note">…</span>.
-->
<script setup lang="ts">
/* Ohne withDefaults würde Vue das fehlende Boolean-Prop `zitat` zu false
   umdeuten — dann fehlte die Glyphe auch dort, wo sie gewollt ist. */
withDefaults(
  defineProps<{ rubrik?: string; titel?: string; zitat?: boolean; label?: string; align?: string }>(),
  { zitat: true },
)
</script>

<template>
  <div class="slidev-layout thm-statement">
    <ThmLockup />
    <SlideHead :rubrik="rubrik" :titel="titel" />
    <!-- Bewusst ohne position:relative — sonst würde dieser Kasten zum
         Bezugsrahmen für <SourceBadge> und der Badge landete mitten auf der
         Folie statt an ihrem Rand. -->
    <div class="st-wrap" :class="{ 'no-glyph': zitat === false, 'no-head': !titel && !rubrik }">
      <div class="st-box">
        <ThmIcon v-if="zitat !== false" name="quote" box :size="2.3" />
        <div class="st-main">
          <div v-if="label" class="thm-eyebrow">{{ label }}</div>
          <blockquote class="st-body"><slot /></blockquote>
        </div>
      </div>
    </div>
    <SlideFooter />
  </div>
</template>

<style scoped>
.st-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.st-wrap.no-head { padding-top: 1.2rem; }

.st-box {
  display: flex;
  align-items: flex-start;
  gap: 1.3rem;
  background: var(--thm-green-50);
  border-left: 0.3rem solid var(--thm-green-500);
  padding: 1.7rem 2rem;
}

.st-main { flex: 1; min-width: 0; }

.st-body {
  margin: 0;
  padding: 0;
  border: 0;
  color: var(--text-strong);
  font-size: 1.45rem;
  font-weight: var(--fw-medium);
  line-height: 1.35;
}

.st-body :deep(strong) { color: var(--thm-green-800); }

/* Ohne Glyphe: kein Kasten, größere Schrift, nur der Balken links */
.st-wrap.no-glyph .st-box {
  background: none;
  padding: 0.3rem 0 0.3rem 1.8rem;
  border-left-width: 0.4rem;
}

.st-wrap.no-glyph .st-body {
  font-size: 2rem;
  line-height: 1.28;
}

.st-body :deep(p) { margin-bottom: 0.9rem; }
.st-body :deep(p:last-child) { margin-bottom: 0; }

/* Nachgestellte, kleinere Erläuterung unter dem Kernsatz */
.st-body :deep(.st-note) {
  display: block;
  margin-top: 1rem;
  font-size: 0.95rem;
  font-weight: var(--fw-regular);
  color: var(--thm-grey-500);
  line-height: var(--lh-snug);
}

.st-wrap.no-glyph .st-body :deep(.st-note) { font-size: 1.05rem; }
</style>
