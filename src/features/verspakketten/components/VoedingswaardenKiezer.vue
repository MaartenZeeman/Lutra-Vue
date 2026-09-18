<script setup lang="ts">
import { computed } from 'vue'

import {
  VOEDINGSWAARDE_BASIS_LABELS,
  VoedingswaardeBasis,
  type VoedingswaardeAanmaak,
} from '../model/verspakket'

const voedingswaarden = defineModel<VoedingswaardeAanmaak[]>({ required: true })

const basisopties = [VoedingswaardeBasis.Per100Gram, VoedingswaardeBasis.PerPortie] as const

interface Veld {
  sleutel: keyof Omit<VoedingswaardeAanmaak, 'basis'>
  label: string
}

const velden: Veld[] = [
  { sleutel: 'energieKj', label: 'Energie (kJ)' },
  { sleutel: 'energieKcal', label: 'Energie (kcal)' },
  { sleutel: 'vetten', label: 'Vetten (g)' },
  { sleutel: 'waarvanVerzadigd', label: 'Waarvan verzadigd (g)' },
  { sleutel: 'koolhydraten', label: 'Koolhydraten (g)' },
  { sleutel: 'waarvanSuikers', label: 'Waarvan suikers (g)' },
  { sleutel: 'vezels', label: 'Vezels (g)' },
  { sleutel: 'eiwitten', label: 'Eiwitten (g)' },
  { sleutel: 'zout', label: 'Zout (g)' },
]

const ontbrekendeBasis = computed(() =>
  basisopties.find((basis) => !voedingswaarden.value.some((entry) => entry.basis === basis)),
)

function toevoegen(): void {
  const basis = ontbrekendeBasis.value
  if (basis === undefined) {
    return
  }

  voedingswaarden.value = [
    ...voedingswaarden.value,
    {
      basis,
      energieKj: null,
      energieKcal: null,
      vetten: null,
      waarvanVerzadigd: null,
      koolhydraten: null,
      waarvanSuikers: null,
      vezels: null,
      eiwitten: null,
      zout: null,
    },
  ]
}

function verwijderen(index: number): void {
  voedingswaarden.value = voedingswaarden.value.filter((_, i) => i !== index)
}

function bijwerkenGetal(index: number, sleutel: Veld['sleutel'], event: Event): void {
  const waarde = (event.target as HTMLInputElement).value
  const getal = waarde === '' ? null : Number(waarde)

  voedingswaarden.value = voedingswaarden.value.map((entry, i) =>
    i === index ? { ...entry, [sleutel]: getal } : entry,
  )
}
</script>

<template>
  <div class="voeding-kiezer">
    <div v-for="(entry, index) in voedingswaarden" :key="entry.basis" class="voeding-entry">
      <div class="voeding-entry__kop">
        <h4>{{ VOEDINGSWAARDE_BASIS_LABELS[entry.basis] }}</h4>
        <button class="knop knop--klein knop--gevaar" type="button" @click="verwijderen(index)">
          Verwijderen
        </button>
      </div>
      <div class="voeding-entry__velden">
        <div v-for="veld in velden" :key="veld.sleutel" class="veld">
          <label :for="`voeding-${entry.basis}-${veld.sleutel}`">{{ veld.label }}</label>
          <input
            :id="`voeding-${entry.basis}-${veld.sleutel}`"
            type="number"
            min="0"
            step="0.01"
            :value="entry[veld.sleutel] ?? ''"
            @input="bijwerkenGetal(index, veld.sleutel, $event)"
          />
        </div>
      </div>
    </div>

    <p v-if="voedingswaarden.length === 0" class="melding">Nog geen voedingswaarden toegevoegd.</p>

    <div>
      <button
        class="knop knop--klein"
        type="button"
        :disabled="ontbrekendeBasis === undefined"
        @click="toevoegen"
      >
        Voedingswaarde toevoegen
      </button>
    </div>
  </div>
</template>

<style scoped>
.voeding-kiezer {
  display: grid;
  gap: var(--ruimte-4);
}

.voeding-entry {
  padding: var(--ruimte-3);
  border: 1px solid var(--kleur-rand);
  border-radius: var(--straal-klein);
}

.voeding-entry__kop {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--ruimte-2);
  margin-bottom: var(--ruimte-3);
}

.voeding-entry__kop h4 {
  margin: 0;
}

.voeding-entry__velden {
  display: grid;
  gap: var(--ruimte-3);
  grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
}
</style>
