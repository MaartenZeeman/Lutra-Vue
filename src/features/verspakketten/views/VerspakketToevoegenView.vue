<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { foutmelding } from '@/shared/api/apiError'

import { verspakkettenApi } from '../api/verspakkettenApi'
import VerspakketForm from '../components/VerspakketForm.vue'
import type { VerspakketAanmaak } from '../model/verspakket'
import type { VerspakketFormUitvoer } from '../model/verspakketForm'

const router = useRouter()

const bezig = ref(false)
const fout = ref<string | null>(null)

async function opslaan(uitvoer: VerspakketFormUitvoer): Promise<void> {
  bezig.value = true
  fout.value = null

  const aanvraag: VerspakketAanmaak = {
    naam: uitvoer.naam,
    prijsInCenten: uitvoer.prijsInCenten,
    aantalPersonen: uitvoer.aantalPersonen,
    supermarktId: uitvoer.supermarktId,
    fotos: uitvoer.fotos,
    ingredienten: uitvoer.ingredienten,
    voedingswaarden: uitvoer.voedingswaarden,
    allergenen: uitvoer.allergenen,
    beoordeling: uitvoer.beoordeling,
  }

  try {
    const resultaat = await verspakkettenApi.create(aanvraag)
    await router.push({ name: 'verspakket-detail', params: { id: resultaat.id } })
  } catch (foutWaarde) {
    fout.value = foutmelding(foutWaarde)
  } finally {
    bezig.value = false
  }
}
</script>

<template>
  <section class="pagina">
    <h1>Verspakket toevoegen</h1>
    <p class="intro">
      Vul de gegevens in die je op de verpakking vindt. Je kunt het verspakket later aanvullen.
    </p>

    <VerspakketForm :bezig="bezig" :fout="fout" @opslaan="opslaan" />
  </section>
</template>

<style scoped>
.pagina {
  max-width: 56rem;
}

.intro {
  max-width: 42rem;
  color: var(--kleur-tekst-zacht);
}
</style>
