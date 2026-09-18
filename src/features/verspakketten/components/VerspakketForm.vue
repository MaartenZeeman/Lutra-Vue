<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import { foutmelding } from '@/shared/api/apiError'

import { supermarktenApi } from '@/features/supermarkten/api/supermarktenApi'
import type { Supermarkt } from '@/features/supermarkten/model/supermarkt'

import {
  type BeoordelingAanmaak,
  type FotoAanmaak,
  type IngredientAanmaak,
  type Verspakket,
  type VoedingswaardeAanmaak,
} from '../model/verspakket'
import type { VerspakketFormUitvoer } from '../model/verspakketForm'
import AllergenenKiezer from './AllergenenKiezer.vue'
import FotoKiezer from './FotoKiezer.vue'
import IngredientenKiezer from './IngredientenKiezer.vue'
import VoedingswaardenKiezer from './VoedingswaardenKiezer.vue'

const props = withDefaults(
  defineProps<{
    verspakket?: Verspakket | null
    bezig?: boolean
    fout?: string | null
  }>(),
  {
    verspakket: null,
    bezig: false,
    fout: null,
  },
)

const emit = defineEmits<{ opslaan: [uitvoer: VerspakketFormUitvoer] }>()

const isBewerken = computed(() => props.verspakket !== null)

const naam = ref(props.verspakket?.naam ?? '')
const prijsInEuros = ref(
  props.verspakket?.prijsInCenten != null ? (props.verspakket.prijsInCenten / 100).toFixed(2) : '',
)
const aantalPersonen = ref(props.verspakket?.aantalPersonen ?? 2)
const supermarktId = ref(props.verspakket?.supermarkt?.id ?? '')
const fotos = ref<FotoAanmaak[]>(
  (props.verspakket?.fotos ?? []).map((foto) => ({
    base64Data: foto.base64Data,
    isMainImage: foto.isMainImage,
  })),
)
const ingredienten = ref<IngredientAanmaak[]>(
  (props.verspakket?.ingredienten ?? []).map((ingredient) => ({
    naam: ingredient.naam,
    hoeveelheid: ingredient.hoeveelheid,
    eenheid: ingredient.eenheid ?? 0,
    inbegrepen: ingredient.inbegrepen,
  })),
)
const voedingswaarden = ref<VoedingswaardeAanmaak[]>(
  (props.verspakket?.voedingswaarden ?? []).map((voedingswaarde) => ({
    basis: voedingswaarde.basis ?? 0,
    energieKj: voedingswaarde.energieKj ?? null,
    energieKcal: voedingswaarde.energieKcal ?? null,
    vetten: voedingswaarde.vetten ?? null,
    waarvanVerzadigd: voedingswaarde.waarvanVerzadigd ?? null,
    koolhydraten: voedingswaarde.koolhydraten ?? null,
    waarvanSuikers: voedingswaarde.waarvanSuikers ?? null,
    vezels: voedingswaarde.vezels ?? null,
    eiwitten: voedingswaarde.eiwitten ?? null,
    zout: voedingswaarde.zout ?? null,
  })),
)
const allergenen = ref<number[]>([...(props.verspakket?.allergenen ?? [])])

const beoordelingSmaak = ref(8)
const beoordelingBereiden = ref(8)
const beoordelingAanbevolen = ref(true)
const beoordelingTekst = ref('')

const fotosGewijzigd = ref(false)
const supermarkten = ref<Supermarkt[]>([])
const supermarktenFout = ref<string | null>(null)
const fouten = ref<string[]>([])

watch(
  fotos,
  () => {
    fotosGewijzigd.value = true
  },
  { deep: true },
)

onMounted(async () => {
  try {
    const resultaat = await supermarktenApi.list({ take: 200 })
    supermarkten.value = resultaat.supermarkten
  } catch (foutWaarde) {
    supermarktenFout.value = foutmelding(foutWaarde)
  }
})

function valideer(): string[] {
  const meldingen: string[] = []

  if (naam.value.trim().length === 0) {
    meldingen.push('Vul een naam in.')
  } else if (naam.value.length > 255) {
    meldingen.push('De naam mag maximaal 255 tekens bevatten.')
  }

  const euros = Number(prijsInEuros.value.replace(',', '.'))
  if (prijsInEuros.value.trim().length === 0 || !Number.isFinite(euros) || euros < 0) {
    meldingen.push('Vul een geldige prijs in euro’s in.')
  }

  if (
    !Number.isInteger(aantalPersonen.value) ||
    aantalPersonen.value < 1 ||
    aantalPersonen.value > 10
  ) {
    meldingen.push('Kies een aantal personen tussen 1 en 10.')
  }

  if (supermarktId.value.length === 0) {
    meldingen.push('Kies een supermarkt.')
  }

  if (ingredienten.value.some((ingredient) => ingredient.naam.trim().length === 0)) {
    meldingen.push('Elk ingrediënt heeft een naam nodig.')
  }

  if (ingredienten.value.some((ingredient) => !(ingredient.hoeveelheid > 0))) {
    meldingen.push('Elke ingrediënt-hoeveelheid moet groter dan 0 zijn.')
  }

  for (const entry of voedingswaarden.value) {
    if (
      entry.vetten != null &&
      entry.waarvanVerzadigd != null &&
      entry.waarvanVerzadigd > entry.vetten
    ) {
      meldingen.push('Waarvan verzadigd mag niet hoger zijn dan vetten.')
    }

    if (
      entry.koolhydraten != null &&
      entry.waarvanSuikers != null &&
      entry.waarvanSuikers > entry.koolhydraten
    ) {
      meldingen.push('Waarvan suikers mag niet hoger zijn dan koolhydraten.')
    }
  }

  if (!isBewerken.value) {
    if (beoordelingSmaak.value < 1 || beoordelingSmaak.value > 10) {
      meldingen.push('Het cijfer voor smaak moet tussen 1 en 10 liggen.')
    }

    if (beoordelingBereiden.value < 1 || beoordelingBereiden.value > 10) {
      meldingen.push('Het cijfer voor bereiden moet tussen 1 en 10 liggen.')
    }

    if (beoordelingTekst.value.length > 1024) {
      meldingen.push('De toelichting mag maximaal 1024 tekens bevatten.')
    }
  }

  return meldingen
}

function verzenden(): void {
  const meldingen = valideer()
  fouten.value = meldingen

  if (meldingen.length > 0) {
    return
  }

  const euros = Number(prijsInEuros.value.replace(',', '.'))
  const beoordeling: BeoordelingAanmaak | null = isBewerken.value
    ? null
    : {
        cijferSmaak: beoordelingSmaak.value,
        cijferBereiden: beoordelingBereiden.value,
        aanbevolen: beoordelingAanbevolen.value,
        tekst: beoordelingTekst.value.trim().length > 0 ? beoordelingTekst.value.trim() : null,
      }

  emit('opslaan', {
    naam: naam.value.trim(),
    prijsInCenten: Math.round(euros * 100),
    aantalPersonen: aantalPersonen.value,
    supermarktId: supermarktId.value,
    fotos: isBewerken.value ? (fotosGewijzigd.value ? fotos.value : null) : fotos.value,
    ingredienten: ingredienten.value.map((ingredient) => ({
      ...ingredient,
      naam: ingredient.naam.trim(),
    })),
    voedingswaarden: voedingswaarden.value,
    allergenen: allergenen.value,
    beoordeling,
  })
}
</script>

<template>
  <form class="verspakket-form" novalidate @submit.prevent="verzenden">
    <ul v-if="fouten.length > 0" class="foutmelding fouten" role="alert">
      <li v-for="melding in fouten" :key="melding">{{ melding }}</li>
    </ul>

    <p v-if="props.fout" class="foutmelding" role="alert">{{ props.fout }}</p>

    <fieldset class="sectie">
      <legend>Basisgegevens</legend>
      <div class="sectie__velden">
        <div class="veld">
          <label for="form-naam">Naam</label>
          <input id="form-naam" v-model="naam" type="text" maxlength="255" required />
        </div>
        <div class="veld">
          <label for="form-prijs">Prijs in euro’s</label>
          <input
            id="form-prijs"
            v-model="prijsInEuros"
            type="text"
            inputmode="decimal"
            placeholder="7,49"
            required
          />
        </div>
        <div class="veld">
          <label for="form-personen">Aantal personen</label>
          <input
            id="form-personen"
            v-model.number="aantalPersonen"
            type="number"
            min="1"
            max="10"
            step="1"
            required
          />
        </div>
        <div class="veld">
          <label for="form-supermarkt">Supermarkt</label>
          <select id="form-supermarkt" v-model="supermarktId" required>
            <option value="" disabled>Kies een supermarkt</option>
            <option v-for="supermarkt in supermarkten" :key="supermarkt.id" :value="supermarkt.id">
              {{ supermarkt.naam }}
            </option>
          </select>
          <span v-if="supermarktenFout" class="toelichting">{{ supermarktenFout }}</span>
          <span v-else-if="supermarkten.length === 0" class="toelichting">
            Nog geen supermarkten beschikbaar.
            <RouterLink :to="{ name: 'supermarkten' }">Voeg er eerst een toe</RouterLink>.
          </span>
        </div>
      </div>
    </fieldset>

    <fieldset class="sectie">
      <legend>Foto’s</legend>
      <FotoKiezer v-model="fotos" />
    </fieldset>

    <fieldset class="sectie">
      <legend>Ingrediënten</legend>
      <IngredientenKiezer v-model="ingredienten" />
    </fieldset>

    <fieldset class="sectie">
      <legend>Voedingswaarden</legend>
      <VoedingswaardenKiezer v-model="voedingswaarden" />
    </fieldset>

    <fieldset class="sectie">
      <legend>Allergenen</legend>
      <AllergenenKiezer v-model="allergenen" />
    </fieldset>

    <fieldset v-if="!isBewerken" class="sectie">
      <legend>Eerste beoordeling (optioneel)</legend>
      <p class="toelichting">
        Laat de cijfers staan zoals ze zijn als je nog geen beoordeling wilt toevoegen.
      </p>
      <div class="sectie__velden">
        <div class="veld">
          <label for="form-beoordeling-smaak">Cijfer smaak (1–10)</label>
          <input
            id="form-beoordeling-smaak"
            v-model.number="beoordelingSmaak"
            type="number"
            min="1"
            max="10"
            step="1"
          />
        </div>
        <div class="veld">
          <label for="form-beoordeling-bereiden">Cijfer bereiden (1–10)</label>
          <input
            id="form-beoordeling-bereiden"
            v-model.number="beoordelingBereiden"
            type="number"
            min="1"
            max="10"
            step="1"
          />
        </div>
        <div class="veld">
          <label for="form-beoordeling-tekst">Toelichting</label>
          <input
            id="form-beoordeling-tekst"
            v-model="beoordelingTekst"
            type="text"
            maxlength="1024"
          />
        </div>
      </div>
      <label class="aanbevolen">
        <input v-model="beoordelingAanbevolen" type="checkbox" />
        Ik beveel dit verspakket aan
      </label>
    </fieldset>

    <div class="acties">
      <button class="knop knop--primair" type="submit" :disabled="props.bezig">
        {{ props.bezig ? 'Bezig…' : isBewerken ? 'Wijzigingen opslaan' : 'Verspakket toevoegen' }}
      </button>
      <RouterLink class="knop" :to="{ name: 'verspakketten' }">Annuleren</RouterLink>
    </div>
  </form>
</template>

<style scoped>
.verspakket-form {
  display: grid;
  gap: var(--ruimte-5);
}

.sectie {
  display: grid;
  gap: var(--ruimte-4);
  margin: 0;
  padding: var(--ruimte-4);
  border: 1px solid var(--kleur-rand);
  border-radius: var(--straal);
  background-color: var(--kleur-oppervlak);
}

.sectie > legend {
  padding-inline: var(--ruimte-2);
  font-weight: 700;
}

.sectie__velden {
  display: grid;
  gap: var(--ruimte-4);
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
}

.fouten {
  display: grid;
  gap: var(--ruimte-1);
  margin: 0;
  padding-left: 1.5rem;
}

.aanbevolen {
  display: inline-flex;
  align-items: center;
  gap: var(--ruimte-2);
}

.acties {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ruimte-3);
}

.toelichting :deep(a) {
  color: var(--kleur-primair-donker);
}
</style>
