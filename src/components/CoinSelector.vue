<script lang="ts" setup>
import type { Coin } from '@/composables/useCoins'
import { computed } from 'vue'
import BaseCombobox from './BaseCombobox.vue'

const props = defineProps<{
  coins: Coin[]
}>()

const model = defineModel<string>()

const selectedCoin = computed({
  get: () => props.coins.find(c => c.symbol === model.value),
  set: (val) => {
    if (val) {
      model.value = val.symbol
    }
  },
})

function filterCoin(coin: Coin, query: string) {
  return coin.name.toLowerCase().includes(query)
    || coin.symbol.toLowerCase().includes(query)
}
</script>

<template>
  <div class="selector-wrapper">
    <BaseCombobox
      v-model="selectedCoin"
      :options="coins"
      :filter-function="filterCoin"
      placeholder="Select Coin"
    >
      <template #selected="{ option }">
        <img :src="option.iconUrl" class="coin-icon" alt="">
        {{ option.name }} ({{ option.symbol }})
      </template>

      <template #option="{ option }">
        <img :src="option.iconUrl" class="coin-icon" alt="">
        <span class="coin-name">{{ option.name }}</span>
        <span class="coin-symbol">{{ option.symbol }}</span>
      </template>
    </BaseCombobox>
  </div>
</template>

<style scoped>
.selector-wrapper {
  width: 250px;
}

.coin-icon {
  width: 20px;
  height: 20px;
}

.coin-name {
  flex: 1;
}

.coin-symbol {
  color: var(--color-text-secondary);
  font-size: 0.9em;
}

@media (max-width: 640px) {
  .selector-wrapper {
    width: 100%;
  }
}
</style>
