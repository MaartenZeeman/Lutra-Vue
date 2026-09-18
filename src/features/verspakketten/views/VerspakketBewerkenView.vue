<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { ApiError, foutmelding } from '@/shared/api/apiError'
import StatusBlok from '@/shared/components/StatusBlok.vue'

import { verspakkettenApi } from '../api/verspakkettenApi'
import VerspakketForm from '../components/VerspakketForm.vue'
import type { Verspakket, VerspakketUpdate } from '../model/verspakket'
import type { VerspakketFormUitvoer } from '../model/verspakketForm'

const route = useRoute()
const router = useRouter()

const verspakket = ref<Verspakket | null>(null)
const laden = ref(true)
const laadFout = ref<string | null>(null)
const nietGevonden = ref(false)
const bezig = ref(false)
const fout = ref<string | null>(null)

const id = String(route.params.id ?? '')

async function ladenVerspakket(): Promise<void> {
  laden.value = true
  laadFout.value = null
  nietGevonden.value = false

  try {
    const resultaat = await verspakkettenApi.getById(id)
    verspakket.value = resultaat.verspakket
  } catch (foutWaarde) {
    if (foutWaarde instanceof ApiError && foutWaarde.status === 404) {
      nietGevonden.value = true
    } else {
      laadFout.value = foutmelding(foutWaarde)
    }
  } finally {
    laden.value = false
  }
}

async function opslaan(uitvoer: VerspakketFormUitvoer): Promise<void> {
  bezig.value = true
  fout.value = null

  const aanvraag: VerspakketUpdate = {
    naam: uitvoer.naam,
    prijsInCenten: uitvoer.prijsInCenten,
    aantalPersonen: uitvoer.aantalPersonen,
    supermarktId: uitvoer.supermarktId,
    fotos: uitvoer.fotos,
    ingredienten: uitvoer.ingredienten,
    voedingswaarden: uitvoer.voedingswaarden,
    allergenen: uitvoer.allergenen,
  }

  try {
    await verspakkettenApi.update(id, aanvraag)
    await router.push({ name: 'verspakket-detail', params: { id } })
  } catch (foutWaarde) {
    fout.value = foutmelding(foutWaarde)
  } finally {
    bezig.value = false
  }
}

onMounted(() => {
  void ladenVerspakket()
})
</script>

<template>
  <section class="pagina">
    <h1>Verspakket bewerken</h1>

    <StatusBlok v-if="laden" soort="laden" />
    <StatusBlok
      v-else-if="nietGevonden"
      soort="leeg"
      bericht="Dit verspakket bestaat niet of is verwijderd."
    />
    <StatusBlok
      v-else-if="laadFout"
      soort="fout"
      :bericht="laadFout"
      @opnieuw="() => void ladenVerspakket()"
    />
    <VerspakketForm
      v-else-if="verspakket"
      :verspakket="verspakket"
      :bezig="bezig"
      :fout="fout"
      @opslaan="opslaan"
    />
  </section>
</template>

<style scoped>
.pagina {
  max-width: 56rem;
}
</style>
