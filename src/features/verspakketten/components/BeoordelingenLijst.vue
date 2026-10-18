<script setup lang="ts">
import { ref } from 'vue'

import { foutmelding } from '@/shared/api/apiError'

import { verspakkettenApi } from '../api/verspakkettenApi'
import type { Beoordeling } from '../model/verspakket'
import BeoordelingForm from './BeoordelingForm.vue'
import ScoreOverzicht from './ScoreOverzicht.vue'

const props = defineProps<{
  verspakketId: string
  beoordelingen?: Beoordeling[] | null
}>()

const emit = defineEmits<{ gewijzigd: [] }>()

const bewerkId = ref<string | null>(null)
const verwijderId = ref<string | null>(null)
const bezigId = ref<string | null>(null)
const rijFout = ref<{ id: string; bericht: string } | null>(null)

function startBewerken(beoordeling: Beoordeling): void {
  bewerkId.value = beoordeling.id
  verwijderId.value = null
  rijFout.value = null
}

function stopBewerken(): void {
  bewerkId.value = null
}

function vraagVerwijderen(beoordeling: Beoordeling): void {
  verwijderId.value = beoordeling.id
  rijFout.value = null
}

async function verwijderen(beoordeling: Beoordeling): Promise<void> {
  bezigId.value = beoordeling.id
  rijFout.value = null

  try {
    await verspakkettenApi.removeBeoordeling(props.verspakketId, beoordeling.id)
    verwijderId.value = null
    emit('gewijzigd')
  } catch (foutWaarde) {
    rijFout.value = { id: beoordeling.id, bericht: foutmelding(foutWaarde) }
  } finally {
    bezigId.value = null
  }
}

function onOpgeslagen(): void {
  bewerkId.value = null
  emit('gewijzigd')
}
</script>

<template>
  <div v-if="beoordelingen && beoordelingen.length > 0" class="beoordelingen">
    <template v-for="beoordeling in beoordelingen" :key="beoordeling.id">
      <BeoordelingForm
        v-if="bewerkId === beoordeling.id"
        :verspakket-id="verspakketId"
        :beoordeling="beoordeling"
        @opgeslagen="onOpgeslagen"
        @geannuleerd="stopBewerken"
      />
      <article v-else class="kaart beoordeling">
        <div class="beoordeling__kop">
          <ScoreOverzicht :smaak="beoordeling.cijferSmaak" :bereiden="beoordeling.cijferBereiden" />
          <span class="badge" :class="beoordeling.aanbevolen ? 'badge--groen' : 'badge--rood'">
            {{ beoordeling.aanbevolen ? 'Aanbevolen' : 'Niet aanbevolen' }}
          </span>
        </div>
        <p v-if="beoordeling.tekst" class="beoordeling__tekst">{{ beoordeling.tekst }}</p>
        <p v-else class="beoordeling__tekst beoordeling__tekst--leeg">Geen toelichting gegeven.</p>

        <p v-if="rijFout?.id === beoordeling.id" class="foutmelding beoordeling__fout" role="alert">
          {{ rijFout.bericht }}
        </p>

        <div class="beoordeling__acties">
          <template v-if="verwijderId === beoordeling.id">
            <span class="beoordeling__vraag">Deze beoordeling verwijderen?</span>
            <button
              class="knop knop--klein knop--gevaar"
              type="button"
              :disabled="bezigId === beoordeling.id"
              @click="verwijderen(beoordeling)"
            >
              {{ bezigId === beoordeling.id ? 'Bezig…' : 'Ja, verwijderen' }}
            </button>
            <button class="knop knop--klein" type="button" @click="verwijderId = null">
              Annuleren
            </button>
          </template>
          <template v-else>
            <button class="knop knop--klein" type="button" @click="startBewerken(beoordeling)">
              Bewerken
            </button>
            <button
              class="knop knop--klein knop--gevaar"
              type="button"
              @click="vraagVerwijderen(beoordeling)"
            >
              Verwijderen
            </button>
          </template>
        </div>
      </article>
    </template>
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

.beoordeling__fout {
  margin-top: var(--ruimte-3);
}

.beoordeling__acties {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ruimte-2);
  margin-top: var(--ruimte-3);
}

.beoordeling__vraag {
  color: var(--kleur-tekst-zacht);
  font-size: 0.9rem;
}
</style>
