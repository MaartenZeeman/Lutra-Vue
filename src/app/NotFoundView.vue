<template>
  <section class="niet-gevonden">
    <h1>Pagina niet gevonden</h1>
    <p>Deze pagina bestaat niet of is verplaatst.</p>
    <RouterLink class="knop knop--primair" :to="{ name: 'home' }">Naar de homepage</RouterLink>
  </section>
</template>

<style scoped>
.niet-gevonden {
  max-width: 32rem;
}
</style>
