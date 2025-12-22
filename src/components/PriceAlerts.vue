<script lang="ts" setup>
import type { Coin } from '@/composables/useCoins'
import { computed, ref } from 'vue'
import { usePriceAlerts } from '@/composables/usePriceAlerts'

const props = defineProps<{
  coinSymbol: string
  currentPrice?: string
  coins: Coin[]
}>()

const { alerts, addAlert, removeAlert } = usePriceAlerts()

const targetPrice = ref<number | null>(null)
const condition = ref<'above' | 'below'>('above')

const coinAlerts = computed(() => {
  return alerts.value.filter(a => a.coinSymbol === props.coinSymbol)
})

function handleAddAlert() {
  if (targetPrice.value === null || targetPrice.value <= 0)
    return
  addAlert(props.coinSymbol, targetPrice.value, condition.value)
  targetPrice.value = null
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function isTriggered(alert: any) {
  if (!props.currentPrice)
    return false
  const price = Number(props.currentPrice)
  if (alert.condition === 'above')
    return price >= alert.targetPrice
  return price <= alert.targetPrice
}
</script>

<template>
  <div class="alerts-card">
    <div class="header">
      <h3>Price Alerts ({{ coinSymbol }})</h3>
    </div>

    <div class="add-alert-form">
      <div class="form-group">
        <label>Condition</label>
        <select v-model="condition">
          <option value="above">
            Price goes above
          </option>
          <option value="below">
            Price goes below
          </option>
        </select>
      </div>
      <div class="form-group">
        <label>Target Price ($)</label>
        <input
          v-model="targetPrice"
          type="number"
          step="any"
          placeholder="0.00"
          @keyup.enter="handleAddAlert"
        >
      </div>
      <button class="add-btn" :disabled="!targetPrice" @click="handleAddAlert">
        Add
      </button>
    </div>

    <div v-if="coinAlerts.length > 0" class="alerts-list">
      <div
        v-for="alert in coinAlerts"
        :key="alert.id"
        class="alert-item"
        :class="{ triggered: isTriggered(alert) && alert.isActive }"
      >
        <div class="alert-info">
          <span class="condition-icon">
            {{ alert.condition === 'above' ? '↑' : '↓' }}
          </span>
          <span class="target-price">{{ formatCurrency(alert.targetPrice) }}</span>
          <span v-if="isTriggered(alert) && alert.isActive" class="status-badge">Triggered</span>
        </div>
        <button class="delete-btn" @click="removeAlert(alert.id)">
          &times;
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.alerts-card {
  background: var(--color-bg-secondary);
  padding: var(--spacing-md);
  border-radius: 12px;
  border: 1px solid var(--color-border);
  margin-top: var(--spacing-lg);
}

.header h3 {
  margin: 0 0 var(--spacing-md) 0;
  font-size: 1.1rem;
  color: var(--color-text-primary);
}

.add-alert-form {
  display: flex;
  gap: var(--spacing-sm);
  align-items: flex-end;
  margin-bottom: var(--spacing-md);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

label {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

select, input {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  padding: 8px;
  border-radius: 6px;
  font-size: 0.9rem;
}

.add-btn {
  background: var(--color-accent-primary);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  height: 38px;
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.alert-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--color-bg-primary);
  border-radius: 6px;
  border: 1px solid var(--color-border);
}

.alert-item.triggered {
  border-color: var(--color-accent-primary);
  background: rgba(var(--color-accent-primary-rgb), 0.1);
}

.alert-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.condition-icon {
  font-weight: bold;
  color: var(--color-text-secondary);
}

.target-price {
  font-weight: 600;
  color: var(--color-text-primary);
}

.status-badge {
  font-size: 0.7rem;
  background: var(--color-accent-primary);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
}

.delete-btn {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0 4px;
}

.delete-btn:hover {
  color: #ff4d4f;
}

@media (max-width: 640px) {
  .add-alert-form {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
