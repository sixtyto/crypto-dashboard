<script lang="ts" setup>
import { useCoinDetails } from '@/composables/useCoinDetails'

const { coinUuid } = defineProps<{
  coinUuid: string
}>()

const { details, isFetching } = useCoinDetails(() => coinUuid)

function formatPrice(price: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(price))
}

function formatCompact(value: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(value))
}

function isPositive(change: string) {
  return Number(change) >= 0
}
</script>

<template>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label">
        Current Price
      </div>
      <div class="stat-value">
        <span v-if="isFetching || !details" class="skeleton" style="width: 100px" />
        <span v-else>{{ formatPrice(details.price) }}</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-label">
        24h Change
      </div>
      <div class="stat-value">
        <span v-if="isFetching || !details" class="skeleton" style="width: 60px" />
        <span
          v-else
          :class="isPositive(details.change) ? 'text-green' : 'text-red'"
        >
          {{ isPositive(details.change) ? '+' : '' }}{{ details.change }}%
        </span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-label">
        Market Cap
      </div>
      <div class="stat-value">
        <span v-if="isFetching || !details" class="skeleton" style="width: 80px" />
        <span v-else>{{ formatCompact(details.marketCap) }}</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-label">
        24h Volume
      </div>
      <div class="stat-value">
        <span v-if="isFetching || !details" class="skeleton" style="width: 80px" />
        <span v-else>{{ formatCompact(details['24hVolume']) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.stat-card {
  background: var(--color-bg-secondary);
  padding: var(--spacing-md);
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
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
