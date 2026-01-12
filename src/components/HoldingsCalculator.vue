<script lang="ts" setup>
import type { CoinSymbol } from '@/constants/coins'
import { computed } from 'vue'
import { useHoldings } from '@/composables/useHoldings'

const props = defineProps<{
  currentPrice: string | undefined
  coinSymbol: CoinSymbol
  isFetching: boolean
}>()

const { holdings, updateHolding } = useHoldings()

const amount = computed({
  get: () => holdings.value[props.coinSymbol]?.amount || null,
  set: (val: number | null) => {
    updateHolding(props.coinSymbol, val)
  },
})

const buyPrice = computed({
get: () => holdings.value[props.coinSymbol]?.buyPrice ?? null,
  set: (val: number | null) => {
    updateHolding(props.coinSymbol, amount.value, val)
  },
})

const totalValue = computed(() => {
  if (!amount.value || !props.currentPrice)
    return 0
  const price = Number(props.currentPrice)
  return amount.value * price
})

const profit = computed(() => {
if (amount.value === null || buyPrice.value === null || !props.currentPrice)
    return null
  const currentVal = totalValue.value
  const costBasis = amount.value * buyPrice.value
  return currentVal - costBasis
})

const profitPercentage = computed(() => {
  if (!buyPrice.value || !props.currentPrice)
    return null
  const currentPrice = Number(props.currentPrice)
  return ((currentPrice - buyPrice.value) / buyPrice.value) * 100
})

function useCurrentPrice() {
  if (props.currentPrice) {
    buyPrice.value = Number(props.currentPrice)
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatPercent(value: number) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}
</script>

<template>
  <div class="calculator-card">
    <div class="header">
      <h3>Holdings Calculator</h3>
    </div>

    <div class="calculator-content">
      <div class="input-row">
        <div class="input-group">
          <label :for="`amount-input-${coinSymbol}`">Amount Owned ({{ coinSymbol }})</label>
          <input
            :id="`amount-input-${coinSymbol}`"
            v-model="amount"
            type="number"
            min="0"
            step="any"
            placeholder="0.00"
            class="styled-input"
          >
        </div>

        <div class="input-group">
          <label :for="`buy-price-input-${coinSymbol}`">Avg. Buy Price (USD)</label>
          <div class="input-with-action">
            <input
              :id="`buy-price-input-${coinSymbol}`"
              v-model="buyPrice"
              type="number"
              min="0"
              step="any"
              placeholder="0.00"
              class="styled-input"
            >
            <button
              v-if="currentPrice"
              class="action-button"
              title="Use current price"
              @click="useCurrentPrice"
            >
              Current
            </button>
          </div>
        </div>
      </div>

      <div class="results-row">
        <div class="result-group">
          <label>Total Value</label>
          <div class="value">
            <span v-if="isFetching && amount !== null" class="skeleton" style="width: 100px" />
            <span v-else>{{ formatCurrency(totalValue) }}</span>
          </div>
        </div>

        <div v-if="profit !== null" class="result-group">
          <label>Profit / Loss</label>
          <div class="value" :class="profit >= 0 ? 'text-green' : 'text-red'">
            {{ formatCurrency(profit) }}
            <span class="percentage">({{ formatPercent(profitPercentage || 0) }})</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calculator-card {
  background: var(--color-bg-secondary);
  padding: var(--spacing-md);
  border-radius: 12px;
  border: 1px solid var(--color-border);
  margin-bottom: var(--spacing-lg);
}

.header h3 {
  margin: 0 0 var(--spacing-md) 0;
  font-size: 1.1rem;
  color: var(--color-text-primary);
}

.calculator-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.input-row, .results-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
}

.input-group, .result-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  flex: 1;
  min-width: 200px;
}

label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.styled-input {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 1rem;
  width: 100%;
}

.styled-input:focus {
  outline: none;
  border-color: var(--color-accent-primary);
}

.input-with-action {
  display: flex;
  gap: var(--spacing-xs);
}

.action-button {
  background: var(--color-accent-primary);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.2s;
}

.action-button:hover {
  opacity: 0.9;
}

.value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  height: 38px;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.percentage {
  font-size: 0.9rem;
  font-weight: 400;
}

.text-green {
  color: #10b981;
}

.text-red {
  color: #ef4444;
}

.skeleton {
  display: inline-block;
  height: 1.25rem;
  background: var(--color-border);
  border-radius: 4px;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}
</style>
