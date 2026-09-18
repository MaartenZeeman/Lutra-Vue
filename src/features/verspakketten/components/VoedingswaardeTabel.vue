<script setup lang="ts">
import { computed } from 'vue'

import { formatGetal } from '@/shared/utils/format'

import { VOEDINGSWAARDE_BASIS_LABELS, type Voedingswaarde } from '../model/verspakket'

const props = defineProps<{
  voedingswaarden?: Voedingswaarde[] | null
}>()

interface Rij {
  label: string
  veld: keyof Voedingswaarde
}

const rijen: Rij[] = [
  { label: 'Energie (kJ)', veld: 'energieKj' },
  { label: 'Energie (kcal)', veld: 'energieKcal' },
  { label: 'Vetten (g)', veld: 'vetten' },
  { label: 'Waarvan verzadigd (g)', veld: 'waarvanVerzadigd' },
  { label: 'Koolhydraten (g)', veld: 'koolhydraten' },
  { label: 'Waarvan suikers (g)', veld: 'waarvanSuikers' },
  { label: 'Vezels (g)', veld: 'vezels' },
  { label: 'Eiwitten (g)', veld: 'eiwitten' },
  { label: 'Zout (g)', veld: 'zout' },
]

const kolommen = computed(() => props.voedingswaarden ?? [])
</script>

<template>
  <div v-if="kolommen.length > 0" class="voeding">
    <table class="tabel">
      <caption class="zichtbaar-voor-lezer">
        Voedingswaarden
      </caption>
      <thead>
        <tr>
          <th scope="col">Voedingswaarde</th>
          <th v-for="kolom in kolommen" :key="kolom.basis" scope="col">
            {{ VOEDINGSWAARDE_BASIS_LABELS[kolom.basis ?? 0] }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="rij in rijen" :key="rij.veld">
          <th scope="row">{{ rij.label }}</th>
          <td v-for="kolom in kolommen" :key="kolom.basis">
            {{ formatGetal(kolom[rij.veld]) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <p v-else class="melding">Geen voedingswaarden bekend.</p>
</template>

<style scoped>
.voeding {
  overflow-x: auto;
}
</style>
