<script lang="ts" setup>
import type { CoinSymbol } from '@/constants/coins'
import { COIN_OPTIONS } from '@/constants/coins'

const model = defineModel<CoinSymbol>()
</script>

<template>
  <div class="select-wrapper">
    <select v-model="model">
      <option
        v-for="option in COIN_OPTIONS"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.select-wrapper {
  position: relative;
  width: 200px;
}

select {
  appearance: none;
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: var(--spacing-sm) var(--spacing-md);
  padding-right: 2.5rem;
  width: 100%;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

select:focus {
  outline: none;
  border-color: var(--color-accent-primary);
  box-shadow: 0 0 0 2px var(--color-accent-glow);
}

@media (max-width: 640px) {
  .select-wrapper {
    width: 100%;
    max-width: 100%;
  }
}
</style>
