<template>
  <footer class="voet">
    <div class="container voet__binnen">
      <p>Lutra</p>
      <p>Verspakketten toevoegen, importeren en beoordelen.</p>
    </div>
  </footer>
</template>

<style scoped>
.voet {
  border-top: 1px solid var(--kleur-rand);
  background-color: var(--kleur-oppervlak);
}

.voet__binnen {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--ruimte-2);
  padding-block: var(--ruimte-4);
  color: var(--kleur-tekst-zacht);
  font-size: 0.9rem;
}

.voet p {
  margin: 0;
}
</style>
