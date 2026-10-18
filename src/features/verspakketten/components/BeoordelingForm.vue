<script setup lang="ts">
import { computed, ref } from 'vue'

import { foutmelding } from '@/shared/api/apiError'

import { verspakkettenApi } from '../api/verspakkettenApi'
import type { Beoordeling } from '../model/verspakket'

const props = defineProps<{
  verspakketId: string
  beoordeling?: Beoordeling | null
}>()

const emit = defineEmits<{ opgeslagen: []; geannuleerd: [] }>()

const isBewerken = computed(() => props.beoordeling != null)
const veldSuffix = computed(() => props.beoordeling?.id ?? 'nieuw')

const cijferSmaak = ref(props.beoordeling?.cijferSmaak ?? 8)
const cijferBereiden = ref(props.beoordeling?.cijferBereiden ?? 8)
const aanbevolen = ref(props.beoordeling?.aanbevolen ?? true)
const tekst = ref(props.beoordeling?.tekst ?? '')
const bezig = ref(false)
const fout = ref<string | null>(null)
const succes = ref(false)

async function versturen(): Promise<void> {
  fout.value = null
  succes.value = false

  if (
    cijferSmaak.value < 1 ||
    cijferSmaak.value > 10 ||
    cijferBereiden.value < 1 ||
    cijferBereiden.value > 10
  ) {
    fout.value = 'Geef beide cijfers een waarde tussen 1 en 10.'
    return
  }

  if (tekst.value.length > 1024) {
    fout.value = 'De toelichting mag maximaal 1024 tekens bevatten.'
    return
  }

  const invoer = {
    cijferSmaak: cijferSmaak.value,
    cijferBereiden: cijferBereiden.value,
    aanbevolen: aanbevolen.value,
    tekst: tekst.value.trim().length > 0 ? tekst.value.trim() : null,
  }

  bezig.value = true

  try {
    if (props.beoordeling) {
      await verspakkettenApi.updateBeoordeling(props.verspakketId, props.beoordeling.id, invoer)
    } else {
      await verspakkettenApi.addBeoordeling(props.verspakketId, invoer)
      tekst.value = ''
      cijferSmaak.value = 8
      cijferBereiden.value = 8
      aanbevolen.value = true
      succes.value = true
    }

    emit('opgeslagen')
  } catch (foutWaarde) {
    fout.value = foutmelding(foutWaarde)
  } finally {
    bezig.value = false
  }
}
</script>

<template>
  <form class="kaart beoordeling-form" @submit.prevent="versturen">
    <h3>{{ isBewerken ? 'Beoordeling bewerken' : 'Beoordeling toevoegen' }}</h3>

    <p v-if="fout" class="foutmelding" role="alert">{{ fout }}</p>
    <p v-if="succes && !isBewerken" class="melding melding--succes" role="status">
      Bedankt, je beoordeling is opgeslagen.
    </p>

    <div class="beoordeling-form__cijfers">
      <div class="veld">
        <label :for="`cijfer-smaak-${veldSuffix}`">Cijfer smaak (1–10)</label>
        <input
          :id="`cijfer-smaak-${veldSuffix}`"
          v-model.number="cijferSmaak"
          type="number"
          min="1"
          max="10"
          step="1"
        />
      </div>
      <div class="veld">
        <label :for="`cijfer-bereiden-${veldSuffix}`">Cijfer bereiden (1–10)</label>
        <input
          :id="`cijfer-bereiden-${veldSuffix}`"
          v-model.number="cijferBereiden"
          type="number"
          min="1"
          max="10"
          step="1"
        />
      </div>
    </div>

    <fieldset class="beoordeling-form__keuze">
      <legend>Aanbevolen?</legend>
      <label>
        <input v-model="aanbevolen" type="radio" :value="true" name="aanbevolen" />
        Ja
      </label>
      <label>
        <input v-model="aanbevolen" type="radio" :value="false" name="aanbevolen" />
        Nee
      </label>
    </fieldset>

    <div class="veld">
      <label :for="`beoordeling-tekst-${veldSuffix}`">Toelichting (optioneel)</label>
      <textarea
        :id="`beoordeling-tekst-${veldSuffix}`"
        v-model="tekst"
        maxlength="1024"
        placeholder="Wat vond je van het verspakket?"
      ></textarea>
      <span class="toelichting">{{ tekst.length }} / 1024 tekens</span>
    </div>

    <div class="beoordeling-form__acties">
      <button class="knop knop--primair" type="submit" :disabled="bezig">
        {{ bezig ? 'Bezig…' : isBewerken ? 'Wijzigingen opslaan' : 'Beoordeling plaatsen' }}
      </button>
      <button v-if="isBewerken" class="knop" type="button" @click="emit('geannuleerd')">
        Annuleren
      </button>
    </div>
  </form>
</template>

<style scoped>
.beoordeling-form {
  display: grid;
  gap: var(--ruimte-4);
  padding: var(--ruimte-5);
  border-top: 4px solid var(--kleur-accent-helder);
}

.beoordeling-form h3 {
  margin: 0;
}

.beoordeling-form__acties {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ruimte-3);
}

.beoordeling-form__cijfers {
  display: grid;
  gap: var(--ruimte-4);
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
}

.beoordeling-form__keuze {
  display: flex;
  gap: var(--ruimte-4);
  margin: 0;
  padding: var(--ruimte-3);
  border: 1px solid var(--kleur-rand);
  border-radius: var(--straal-klein);
}

.beoordeling-form__keuze legend {
  padding-inline: var(--ruimte-2);
  font-weight: 600;
}

.beoordeling-form__keuze label {
  display: inline-flex;
  align-items: center;
  gap: var(--ruimte-2);
}
</style>
