<!--
  Einzelne Frage an die Teilnehmer:innen — für Folien, auf denen mehrere
  Fragen stehen. Gelb heißt in dieser Vorlesungsreihe immer „hier sind
  Sie gefragt“.
-->
<template>
  <div class="qi">
    <span class="qi-mark" aria-hidden="true">?</span>
    <span class="qi-text"><slot /></span>
  </div>
</template>

<style scoped>
.qi {
  display: flex;
  align-items: center;
  gap: 1.1rem;
  background: var(--role-ask-soft);
  border-left: 0.25rem solid var(--role-ask);
  padding: 0.9rem 1.2rem;
}

.qi-mark {
  flex: none;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: var(--radius-icon);
  background: var(--role-ask);
  color: var(--white);
  font-size: 1.6rem;
  font-weight: var(--fw-bold);
  display: grid;
  place-items: center;
  line-height: 1;
}

.qi-text {
  flex: 1;
  min-width: 0;
  font-size: 1.05rem;
  line-height: var(--lh-snug);
  color: var(--text-strong);
}
</style>
