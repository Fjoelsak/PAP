<!--
  Die Darstellungskonventionen der Vorlesungsreihe: Frage, Moodle-Hinweis und
  Quellenangabe als Muster in drei Karten, darunter der Hinweis auf die
  Foliennotizen. Steht in jedem Foliensatz an derselben Stelle — eingebunden
  über die gemeinsame Folie `theme-thm/slides/konventionen.md`.

  Verwendung:
    <Konventionen quelle="(Balzert, 2009)" />

  quelle: die Quellenangabe, die als Muster erscheint — am besten die
          Hauptquelle des Foliensatzes

  Im veröffentlichten Foliensatz führt das Wort »Foliennotizen« auf die Seite
  `notizen.html`, die der Pages-Build neben den Foliensatz legt. Im
  Dev-Server und im Export gibt es die Seite nicht, dort bleibt es Text.
-->
<script setup lang="ts">
withDefaults(defineProps<{ quelle?: string }>(), { quelle: '(Balzert, 2009)' })

const veroeffentlicht = import.meta.env.PROD
</script>

<template>
  <CardGrid :cols="3" fill class="konventionen">
    <Card>
      <div class="kv-muster">
        <QuestionItem>Lorem ipsum …</QuestionItem>
      </div>
      <div class="kv-erklaerung">Frage zur Beantwortung durch die Teilnehmer:innen</div>
    </Card>
    <Card>
      <div class="kv-muster">
        <MoodleNote>Hier gibt es etwas im Moodle nachzulesen oder zu tun oder usw.</MoodleNote>
      </div>
      <div class="kv-erklaerung">Ein Hinweis auf den Moodle-Kurs</div>
    </Card>
    <Card>
      <div class="kv-muster">
        <SourceBadge :quelle="quelle" place="inline" />
      </div>
      <div class="kv-erklaerung">Eine Quellenangabe</div>
    </Card>
  </CardGrid>

  <Callout icon="file-text" ton="grau" class="kv-fuss">
    <strong><a v-if="veroeffentlicht" href="notizen.html" target="_blank">Foliennotizen</a><template v-else>Foliennotizen</template>:</strong>
    Detailinformationen zu einzelnen Folien — zum Verständnis und für die Nachbereitung.
    Sie stehen auf der Übersichtsseite der Veranstaltung beim jeweiligen Foliensatz.
  </Callout>
</template>

<style scoped>
.konventionen :deep(.card-text) {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.kv-muster {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 0;
}
.kv-erklaerung {
  padding-top: 0.8rem;
  border-top: 1px solid var(--border-default);
  font-size: 1.05em;
  font-weight: var(--fw-semibold);
  color: var(--text-strong);
}
.kv-fuss { margin-top: var(--grid-gap); font-size: 1rem; }
.kv-fuss a { color: inherit; text-decoration: underline; text-underline-offset: 0.15em; }
</style>
