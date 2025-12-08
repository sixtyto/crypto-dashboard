<script lang="ts" setup>
import type { CoinSymbol } from '@/constants/coins'
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  currentPrice: string | undefined
  coinSymbol: CoinSymbol
  isFetching: boolean
}>()

const amount = ref<number | null>(null)

watch(() => props.coinSymbol, (newSymbol) => {
  const saved = localStorage.getItem(`crypto-holdings-${newSymbol}`)
  if (saved) {
    const parsed = parseFloat(saved)
    if (!isNaN(parsed)) {
      amount.value = parsed
      return
    }
  }
  amount.value = null
}, { immediate: true })

watch(amount, (newAmount) => {
  if (newAmount !== null && newAmount !== undefined && newAmount !== 0) {
    localStorage.setItem(`crypto-holdings-${props.coinSymbol}`, newAmount.toString())
  }
  else {
    localStorage.removeItem(`crypto-holdings-${props.coinSymbol}`)
  }
})

const totalValue = computed(() => {
  if (!amount.value || !props.currentPrice)
    return 0
  const price = Number(props.currentPrice)
  return amount.value * price
})

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}
</script>

<template>
  <div class="calculator-card">
    <div class="header">
      <h3>Holdings Calculator</h3>
    </div>

    <div class="calculator-content">
      <div class="input-group">
        <label :for="`amount-input-${coinSymbol}`">Amount Owned ({{ coinSymbol }})</label>
        <input
          :id="`amount-input-${coinSymbol}`"
          v-model="amount"
          type="number"
          min="0"
          step="any"
          placeholder="0.00"
          class="amount-input"
        >
      </div>

      <div class="result-group">
        <label>Total Value</label>
        <div class="value">
          <span v-if="isFetching && amount !== null" class="skeleton" style="width: 100px" />
          <span v-else>{{ formatCurrency(totalValue) }}</span>
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
  flex-wrap: wrap;
  gap: var(--spacing-lg);
  align-items: flex-end;
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

.amount-input {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 1rem;
  width: 100%;
}

.amount-input:focus {
  outline: none;
  border-color: var(--color-accent-primary);
}

.value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  height: 38px; /* Match input height roughly */
  display: flex;
  align-items: center;
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
