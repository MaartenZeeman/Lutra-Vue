<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { foutmelding } from '@/shared/api/apiError'
import StatusBlok from '@/shared/components/StatusBlok.vue'

import { supermarktenApi } from '../api/supermarktenApi'
import type { Supermarkt } from '../model/supermarkt'

const PAGINA_GROOTTE = 50

const supermarkten = ref<Supermarkt[]>([])
const bezig = ref(false)
const fout = ref<string | null>(null)
const heeftMeer = ref(false)

const nieuweNaam = ref('')
const toevoegenBezig = ref(false)
const toevoegenFout = ref<string | null>(null)

const bewerkId = ref<string | null>(null)
const bewerkNaam = ref('')
const bewerkenBezig = ref(false)
const rijFout = ref<string | null>(null)

async function laden(reset: boolean): Promise<void> {
  bezig.value = true
  fout.value = null

  try {
    const resultaat = await supermarktenApi.list({
      skip: reset ? 0 : supermarkten.value.length,
      take: PAGINA_GROOTTE,
    })

    supermarkten.value = reset
      ? resultaat.supermarkten
      : [...supermarkten.value, ...resultaat.supermarkten]
    heeftMeer.value = resultaat.supermarkten.length === PAGINA_GROOTTE
  } catch (foutWaarde) {
    fout.value = foutmelding(foutWaarde)
  } finally {
    bezig.value = false
  }
}

async function toevoegen(): Promise<void> {
  const naam = nieuweNaam.value.trim()
  toevoegenFout.value = null

  if (naam.length === 0 || naam.length > 50) {
    toevoegenFout.value = 'Vul een naam van maximaal 50 tekens in.'
    return
  }

  toevoegenBezig.value = true

  try {
    await supermarktenApi.create({ naam })
    nieuweNaam.value = ''
    await laden(true)
  } catch (foutWaarde) {
    toevoegenFout.value = foutmelding(foutWaarde)
  } finally {
    toevoegenBezig.value = false
  }
}

function startBewerken(supermarkt: Supermarkt): void {
  bewerkId.value = supermarkt.id
  bewerkNaam.value = supermarkt.naam
  rijFout.value = null
}

function annuleren(): void {
  bewerkId.value = null
  bewerkNaam.value = ''
  rijFout.value = null
}

async function opslaan(id: string): Promise<void> {
  const naam = bewerkNaam.value.trim()
  rijFout.value = null

  if (naam.length === 0 || naam.length > 50) {
    rijFout.value = 'Vul een naam van maximaal 50 tekens in.'
    return
  }

  bewerkenBezig.value = true

  try {
    await supermarktenApi.update(id, { naam })
    annuleren()
    await laden(true)
  } catch (foutWaarde) {
    rijFout.value = foutmelding(foutWaarde)
  } finally {
    bewerkenBezig.value = false
  }
}

onMounted(() => {
  void laden(true)
})
</script>

<template>
  <section class="pagina">
    <h1>Supermarkten</h1>
    <p class="intro">Beheer de supermarkten die bij verspakketten gekozen kunnen worden.</p>

    <form class="kaart toevoegen" @submit.prevent="toevoegen">
      <div class="veld">
        <label for="supermarkt-naam">Nieuwe supermarkt</label>
        <input id="supermarkt-naam" v-model="nieuweNaam" type="text" maxlength="50" required />
      </div>
      <div>
        <button class="knop knop--primair" type="submit" :disabled="toevoegenBezig">
          {{ toevoegenBezig ? 'Bezig…' : 'Toevoegen' }}
        </button>
      </div>
    </form>

    <p v-if="toevoegenFout" class="foutmelding" role="alert">{{ toevoegenFout }}</p>

    <StatusBlok v-if="fout" soort="fout" :bericht="fout" @opnieuw="() => void laden(true)" />
    <StatusBlok v-else-if="bezig && supermarkten.length === 0" soort="laden" />
    <StatusBlok
      v-else-if="supermarkten.length === 0"
      soort="leeg"
      bericht="Er zijn nog geen supermarkten."
    />
    <template v-else>
      <ul class="lijst">
        <li v-for="supermarkt in supermarkten" :key="supermarkt.id" class="kaart rij">
          <template v-if="bewerkId === supermarkt.id">
            <div class="veld rij__veld">
              <label class="zichtbaar-voor-lezer" :for="`bewerk-${supermarkt.id}`">
                Naam van {{ supermarkt.naam }}
              </label>
              <input
                :id="`bewerk-${supermarkt.id}`"
                v-model="bewerkNaam"
                type="text"
                maxlength="50"
              />
            </div>
            <div class="rij__acties">
              <button
                class="knop knop--klein knop--primair"
                type="button"
                :disabled="bewerkenBezig"
                @click="opslaan(supermarkt.id)"
              >
                Opslaan
              </button>
              <button class="knop knop--klein" type="button" @click="annuleren">Annuleren</button>
            </div>
            <p v-if="rijFout" class="foutmelding rij__fout" role="alert">{{ rijFout }}</p>
          </template>
          <template v-else>
            <span class="rij__naam">{{ supermarkt.naam }}</span>
            <div class="rij__acties">
              <button class="knop knop--klein" type="button" @click="startBewerken(supermarkt)">
                Bewerken
              </button>
            </div>
          </template>
        </li>
      </ul>

      <div v-if="heeftMeer" class="meer">
        <button class="knop" type="button" :disabled="bezig" @click="() => void laden(false)">
          {{ bezig ? 'Bezig…' : 'Meer laden' }}
        </button>
      </div>
    </template>
  </section>
</template>

<style scoped>
.pagina {
  max-width: 42rem;
}

.intro {
  color: var(--kleur-tekst-zacht);
}

.toevoegen {
  display: grid;
  gap: var(--ruimte-3);
  grid-template-columns: 1fr auto;
  align-items: end;
  padding: var(--ruimte-4);
  margin-bottom: var(--ruimte-4);
}

.lijst {
  display: grid;
  gap: var(--ruimte-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.rij {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ruimte-3);
  padding: var(--ruimte-3) var(--ruimte-4);
}

.rij__naam {
  flex: 1;
  font-weight: 600;
}

.rij__veld {
  flex: 1;
}

.rij__acties {
  display: flex;
  gap: var(--ruimte-2);
}

.rij__fout {
  flex-basis: 100%;
}

.meer {
  display: flex;
  justify-content: center;
  margin-top: var(--ruimte-5);
}
</style>
