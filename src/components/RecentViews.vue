<script lang="ts" setup>
import type { Coin } from '@/composables/useCoins'
import { computed } from 'vue'
import { useRecentViews } from '@/composables/useRecentViews'

const props = defineProps<{
  coins: Coin[]
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const { recentViews } = useRecentViews()

const coinsMap = computed(() => {
  return new Map(props.coins.map(c => [c.symbol, c]))
})

const recentCoins = computed(() => {
  return recentViews.value.map(symbol => coinsMap.value.get(symbol)).filter(Boolean) as Coin[]
})

function selectCoin(symbol: string) {
  emit('update:modelValue', symbol)
}
</script>

<template>
  <div v-if="recentCoins.length > 0" class="recent-views-container">
    <span class="label">Recent:</span>
    <div class="chips">
      <button
        v-for="coin in recentCoins"
        :key="coin.uuid"
        class="chip"
        :class="{ active: coin.symbol === modelValue }"
        @click="selectCoin(coin.symbol)"
      >
        <img :src="coin.iconUrl" alt="" class="chip-icon">
        <span class="chip-text">{{ coin.symbol }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.recent-views-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin: var(--spacing-sm) auto;
  max-width: 800px;
  justify-content: center;
  flex-wrap: wrap;
}

.label {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.chip {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 4px 10px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--color-text-primary);
  font-size: 0.85rem;
}

.chip:hover {
  background: var(--color-bg-primary);
  border-color: var(--color-accent-primary);
}

.chip.active {
  background: rgba(var(--color-accent-primary-rgb), 0.1);
  border-color: var(--color-accent-primary);
  color: var(--color-accent-primary);
}

.chip-icon {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}
</style>
