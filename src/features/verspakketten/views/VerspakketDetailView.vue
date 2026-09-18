<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { ApiError, foutmelding } from '@/shared/api/apiError'
import StatusBlok from '@/shared/components/StatusBlok.vue'
import { formatGetal, formatPersonen, formatPrijs } from '@/shared/utils/format'

import { verspakkettenApi } from '../api/verspakkettenApi'
import BeoordelingForm from '../components/BeoordelingForm.vue'
import BeoordelingenLijst from '../components/BeoordelingenLijst.vue'
import FotoWeergave from '../components/FotoWeergave.vue'
import ScoreOverzicht from '../components/ScoreOverzicht.vue'
import VoedingswaardeTabel from '../components/VoedingswaardeTabel.vue'
import {
  ALLERGEEN_LABELS,
  EENHEID_LABELS,
  type Ingredient,
  type Verspakket,
} from '../model/verspakket'

const route = useRoute()

const verspakket = ref<Verspakket | null>(null)
const bezig = ref(true)
const fout = ref<string | null>(null)
const nietGevonden = ref(false)
const actieveFoto = ref(0)

const id = computed(() => String(route.params.id ?? ''))
const fotos = computed(() => verspakket.value?.fotos ?? [])
const allergenen = computed(() =>
  (verspakket.value?.allergenen ?? []).map((allergeen) => ALLERGEEN_LABELS[allergeen]),
)
const inbegrepen = computed(() =>
  (verspakket.value?.ingredienten ?? []).filter((ingredient) => ingredient.inbegrepen),
)
const nietInbegrepen = computed(() =>
  (verspakket.value?.ingredienten ?? []).filter((ingredient) => !ingredient.inbegrepen),
)

function ingredientWeergave(ingredient: Ingredient): string {
  return `${formatGetal(ingredient.hoeveelheid)} ${EENHEID_LABELS[ingredient.eenheid ?? 0]}`
}

async function laden(): Promise<void> {
  bezig.value = true
  fout.value = null
  nietGevonden.value = false

  try {
    const resultaat = await verspakkettenApi.getById(id.value)
    verspakket.value = resultaat.verspakket
    const hoofdFoto = resultaat.verspakket.fotos?.findIndex((foto) => foto.isMainImage) ?? -1
    actieveFoto.value = hoofdFoto >= 0 ? hoofdFoto : 0
  } catch (foutWaarde) {
    if (foutWaarde instanceof ApiError && foutWaarde.status === 404) {
      nietGevonden.value = true
      verspakket.value = null
    } else {
      fout.value = foutmelding(foutWaarde)
    }
  } finally {
    bezig.value = false
  }
}

onMounted(() => {
  void laden()
})
</script>

<template>
  <section>
    <RouterLink class="terug" :to="{ name: 'verspakketten' }">← Terug naar overzicht</RouterLink>

    <StatusBlok v-if="bezig && verspakket === null" soort="laden" />
    <StatusBlok
      v-else-if="nietGevonden"
      soort="leeg"
      bericht="Dit verspakket bestaat niet of is verwijderd."
    />
    <StatusBlok v-else-if="fout" soort="fout" :bericht="fout" @opnieuw="() => void laden()" />
    <template v-else-if="verspakket">
      <div class="kop">
        <div>
          <h1>{{ verspakket.naam }}</h1>
          <p class="kop__supermarkt">{{ verspakket.supermarkt?.naam ?? 'Onbekende supermarkt' }}</p>
        </div>
        <RouterLink
          class="knop"
          :to="{ name: 'verspakket-bewerken', params: { id: verspakket.id } }"
        >
          Bewerken
        </RouterLink>
      </div>

      <div class="detail">
        <div class="detail__galerij">
          <div class="galerij__hoofd kaart">
            <FotoWeergave :foto="fotos[actieveFoto] ?? null" :alt="`Foto van ${verspakket.naam}`" />
          </div>
          <div v-if="fotos.length > 1" class="galerij__miniaturen">
            <button
              v-for="(foto, index) in fotos"
              :key="foto.id"
              type="button"
              class="miniatuur"
              :class="{ 'miniatuur--actief': index === actieveFoto }"
              :aria-pressed="index === actieveFoto"
              @click="actieveFoto = index"
            >
              <FotoWeergave :foto="foto" alt="" />
            </button>
          </div>
        </div>

        <aside class="detail__zijkaart kaart">
          <p class="prijs">{{ formatPrijs(verspakket.prijsInCenten) }}</p>
          <p class="personen">{{ formatPersonen(verspakket.aantalPersonen) }}</p>
          <ScoreOverzicht
            :smaak="verspakket.averageCijferSmaak"
            :bereiden="verspakket.averageCijferBereiden"
          />

          <h2 class="detail__kop">Allergenen</h2>
          <div v-if="allergenen.length > 0" class="allergenen">
            <span v-for="allergeen in allergenen" :key="allergeen" class="badge">
              {{ allergeen }}
            </span>
          </div>
          <p v-else class="melding">Geen allergenen bekend.</p>
        </aside>
      </div>

      <section class="blok">
        <h2>Ingrediënten</h2>
        <div v-if="inbegrepen.length > 0 || nietInbegrepen.length > 0" class="ingredienten">
          <div>
            <h3>In het pakket</h3>
            <ul v-if="inbegrepen.length > 0">
              <li v-for="ingredient in inbegrepen" :key="ingredient.naam">
                {{ ingredient.naam }} — {{ ingredientWeergave(ingredient) }}
              </li>
            </ul>
            <p v-else class="melding">Geen ingrediënten opgegeven.</p>
          </div>
          <div>
            <h3>Zelf toevoegen</h3>
            <ul v-if="nietInbegrepen.length > 0">
              <li v-for="ingredient in nietInbegrepen" :key="ingredient.naam">
                {{ ingredient.naam }} — {{ ingredientWeergave(ingredient) }}
              </li>
            </ul>
            <p v-else class="melding">Niets extra nodig.</p>
          </div>
        </div>
        <p v-else class="melding">Geen ingrediënten bekend.</p>
      </section>

      <section class="blok">
        <h2>Voedingswaarden</h2>
        <VoedingswaardeTabel :voedingswaarden="verspakket.voedingswaarden" />
      </section>

      <section class="blok">
        <h2>Beoordelingen</h2>
        <BeoordelingenLijst :beoordelingen="verspakket.beoordelingen" />
        <BeoordelingForm
          class="beoordeling-form"
          :verspakket-id="verspakket.id"
          @toegevoegd="() => void laden()"
        />
      </section>
    </template>
  </section>
</template>

<style scoped>
.terug {
  display: inline-block;
  margin-bottom: var(--ruimte-4);
  color: var(--kleur-tekst-zacht);
  text-decoration: none;
}

.terug:hover {
  color: var(--kleur-primair-donker);
}

.kop {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--ruimte-4);
  margin-bottom: var(--ruimte-5);
}

.kop__supermarkt {
  margin: 0;
  color: var(--kleur-tekst-zacht);
}

.detail {
  display: grid;
  gap: var(--ruimte-5);
  grid-template-columns: 1fr;
  margin-bottom: var(--ruimte-6);
}

.detail__galerij {
  display: grid;
  gap: var(--ruimte-3);
}

.galerij__hoofd {
  overflow: hidden;
  aspect-ratio: 4 / 3;
}

.galerij__miniaturen {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ruimte-2);
}

.miniatuur {
  width: 5rem;
  height: 5rem;
  padding: 0;
  overflow: hidden;
  border: 2px solid var(--kleur-rand);
  border-radius: var(--straal-klein);
  background: none;
  cursor: pointer;
}

.miniatuur--actief {
  border-color: var(--kleur-primair);
}

.detail__zijkaart {
  align-self: start;
  padding: var(--ruimte-5);
}

.detail__kop {
  margin-top: var(--ruimte-5);
  font-size: 1.1rem;
}

.prijs {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.personen {
  margin: 0 0 var(--ruimte-3);
  color: var(--kleur-tekst-zacht);
}

.allergenen {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ruimte-2);
}

.blok {
  margin-bottom: var(--ruimte-6);
}

.ingredienten {
  display: grid;
  gap: var(--ruimte-5);
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
}

.ingredienten h3 {
  font-size: 1rem;
}

.ingredienten ul {
  margin: 0;
  padding-left: 1.1rem;
}

.beoordeling-form {
  margin-top: var(--ruimte-4);
}

@media (min-width: 900px) {
  .detail {
    grid-template-columns: 2fr 1fr;
  }
}
</style>
