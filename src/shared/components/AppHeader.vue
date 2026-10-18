<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import ZoekInvoer from '@/shared/components/ZoekInvoer.vue'

const router = useRouter()
const menuOpen = ref(false)
const zoekterm = ref('')

const navigatie = [
  { naam: 'verspakketten', label: 'Verspakketten' },
  { naam: 'verspakket-toevoegen', label: 'Toevoegen' },
  { naam: 'verspakket-importeren', label: 'Importeren' },
  { naam: 'supermarkten', label: 'Supermarkten' },
] as const

function zoeken(): void {
  const term = zoekterm.value.trim()
  menuOpen.value = false

  void router.push({ name: 'verspakketten', query: term.length > 0 ? { q: term } : {} })
}
</script>

<template>
  <header class="kop">
    <div class="container kop__balk">
      <RouterLink class="merk" :to="{ name: 'home' }" @click="menuOpen = false">
        <span class="merk__teken" aria-hidden="true">L</span>
        <span class="merk__naam">Lutra</span>
      </RouterLink>

      <button
        class="menu-knop"
        type="button"
        :aria-expanded="menuOpen"
        aria-controls="hoofdnavigatie"
        @click="menuOpen = !menuOpen"
      >
        <span class="zichtbaar-voor-lezer">Menu</span>
        <svg v-if="!menuOpen" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path
            d="M4 7h16M4 12h16M4 17h16"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        <svg v-else viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path
            d="M6 6l12 12M18 6L6 18"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </button>

      <nav
        id="hoofdnavigatie"
        class="navigatie"
        :class="{ 'navigatie--open': menuOpen }"
        aria-label="Hoofdnavigatie"
      >
        <RouterLink
          v-for="item in navigatie"
          :key="item.naam"
          :to="{ name: item.naam }"
          @click="menuOpen = false"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <ZoekInvoer v-model="zoekterm" class="kop__zoek" @submit="zoeken" />
    </div>
  </header>
</template>

<style scoped>
.kop {
  position: sticky;
  top: 0;
  z-index: 20;
  border-bottom: 1px solid var(--kleur-rand);
  background-color: var(--kleur-oppervlak);
  box-shadow: 0 1px 8px rgba(32, 48, 40, 0.04);
}

.kop__balk {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-areas:
    'merk menu'
    'zoek zoek'
    'nav nav';
  gap: var(--ruimte-3);
  align-items: center;
  padding-block: var(--ruimte-3);
}

.merk {
  grid-area: merk;
  display: inline-flex;
  align-items: center;
  gap: var(--ruimte-2);
  color: var(--kleur-tekst);
  text-decoration: none;
}

.merk__teken {
  position: relative;
  display: grid;
  place-items: center;
  width: 2.15rem;
  height: 2.15rem;
  border-radius: 65% 35% 62% 38%;
  background-color: var(--kleur-primair);
  color: #ffffff;
  font-weight: 700;
  transform: rotate(-4deg);
}

.merk__teken::after {
  position: absolute;
  top: -0.1rem;
  right: -0.08rem;
  width: 0.48rem;
  height: 0.48rem;
  border: 2px solid var(--kleur-oppervlak);
  border-radius: 50%;
  background-color: var(--kleur-accent-helder);
  content: '';
}

.merk__naam {
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.menu-knop {
  grid-area: menu;
  display: inline-grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid var(--kleur-rand-sterk);
  border-radius: var(--straal-klein);
  background-color: var(--kleur-oppervlak);
  cursor: pointer;
}

.kop__zoek {
  grid-area: zoek;
}

.navigatie {
  grid-area: nav;
  display: none;
  flex-wrap: wrap;
  gap: var(--ruimte-1);
}

.navigatie--open {
  display: flex;
}

.navigatie a {
  padding: 0.45rem 0.65rem;
  border-radius: var(--straal-klein);
  color: var(--kleur-tekst-zacht);
  text-decoration: none;
  font-weight: 600;
}

.navigatie a:hover {
  background-color: var(--kleur-oppervlak-zwak);
  color: var(--kleur-tekst);
}

.navigatie a.router-link-active {
  background-color: var(--kleur-primair-zwak);
  color: var(--kleur-primair-donker);
}

@media (min-width: 880px) {
  .kop__balk {
    grid-template-columns: auto 1fr auto;
    grid-template-areas: 'merk nav zoek';
  }

  .menu-knop {
    display: none;
  }

  .navigatie {
    display: flex;
    justify-self: start;
  }

  .kop__zoek {
    width: min(21rem, 28vw);
  }
}
</style>
