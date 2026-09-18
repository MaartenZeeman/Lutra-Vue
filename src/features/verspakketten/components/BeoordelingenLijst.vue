<script setup lang="ts">
import type { Beoordeling } from '../model/verspakket'
import ScoreOverzicht from './ScoreOverzicht.vue'

defineProps<{
  beoordelingen?: Beoordeling[] | null
}>()
</script>

<template>
  <div v-if="beoordelingen && beoordelingen.length > 0" class="beoordelingen">
    <article v-for="(beoordeling, index) in beoordelingen" :key="index" class="kaart beoordeling">
      <div class="beoordeling__kop">
        <ScoreOverzicht :smaak="beoordeling.cijferSmaak" :bereiden="beoordeling.cijferBereiden" />
        <span class="badge">
          {{ beoordeling.aanbevolen ? 'Aanbevolen' : 'Niet aanbevolen' }}
        </span>
      </div>
      <p v-if="beoordeling.tekst" class="beoordeling__tekst">{{ beoordeling.tekst }}</p>
      <p v-else class="beoordeling__tekst beoordeling__tekst--leeg">Geen toelichting gegeven.</p>
    </article>
  </div>
  <p v-else class="melding">Er zijn nog geen beoordelingen voor dit verspakket.</p>
</template>

<style scoped>
.beoordelingen {
  display: grid;
  gap: var(--ruimte-3);
}

.beoordeling {
  padding: var(--ruimte-4);
}

.beoordeling__kop {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--ruimte-2);
  align-items: center;
}

.beoordeling__tekst {
  margin: var(--ruimte-3) 0 0;
}

.beoordeling__tekst--leeg {
  color: var(--kleur-tekst-zacht);
  font-style: italic;
}
</style>
