<script lang="ts" setup>
import { computed } from 'vue'
import CoinSelector from '../components/CoinSelector.vue'
import CryptoChart from '../components/CryptoChart.vue'
import CryptoStats from '../components/CryptoStats.vue'
import PeriodSelector from '../components/PeriodSelector.vue'
import ThemeToggle from '../components/ThemeToggle.vue'
import { useCoins } from '../composables/useCoins'
import { useQueryParameter } from '../composables/useQueryParameter'
import { PERIOD_OPTIONS } from '../constants/periods'

const coinSymbol = useQueryParameter<string>('coin', 'BTC')
const period = useQueryParameter('period', '7d', (val: string) => PERIOD_OPTIONS.some(o => o.value === val))

const { coins, isFetching } = useCoins()

const selectedCoin = computed(() => {
  return coins.value.find(c => c.symbol === coinSymbol.value)
})

const selectedCoinUuid = computed(() => selectedCoin.value?.uuid || '')
const selectedCoinName = computed(() => selectedCoin.value?.name || coinSymbol.value)
</script>

<template>
  <div class="dashboard-container">
    <div class="dashboard-card">
      <header class="dashboard-header">
        <div class="theme-toggle-wrapper">
          <ThemeToggle />
        </div>

        <h1 class="dashboard-title">
          <span class="text-gradient">Crypto Dashboard</span>
        </h1>

        <p class="dashboard-subtitle">
          Real-time tracking for your digital assets
        </p>
      </header>

      <div class="selectors-wrapper">
        <CoinSelector
          v-if="!isFetching"
          v-model="coinSymbol"
          :coins="coins"
        />
        <div v-else class="loading-selector">
          Loading coins...
        </div>

        <PeriodSelector v-model="period" />
      </div>

      <template v-if="selectedCoinUuid">
        <CryptoStats :coin-uuid="selectedCoinUuid" />

        <CryptoChart
          :coin-uuid="selectedCoinUuid"
          :coin-name="selectedCoinName"
          :period="period"
        />
      </template>
      <div v-else-if="!isFetching" class="error-message">
        Coin not found.
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.dashboard-card {
  background: var(--color-bg-glass);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: var(--spacing-lg);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.dashboard-header {
  margin-bottom: var(--spacing-lg);
  text-align: center;
  position: relative;
}

.theme-toggle-wrapper {
  position: absolute;
  right: 0;
  top: 0;
}

.dashboard-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: var(--spacing-md);
}

.dashboard-subtitle {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.text-gradient {
  background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.selectors-wrapper {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin: 0 auto var(--spacing-lg);
  max-width: 600px;
}

.loading-indicator {
  text-align: center;
  margin-top: 1rem;
  color: var(--color-accent-primary);
}

.loading-selector {
  display: flex;
  align-items: center;
  color: var(--color-text-secondary);
}

.error-message {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-secondary);
}

@media (max-width: 640px) {
  .dashboard-container {
    padding: var(--spacing-sm);
  }

  .dashboard-card {
    padding: var(--spacing-md);
  }

  .dashboard-header {
    display: flex;
    flex-direction: column;
    text-align: center;
    padding-top: var(--spacing-lg);
  }

  .theme-toggle-wrapper {
    position: absolute;
    top: 0;
    right: 0;
  }

  .dashboard-title {
    font-size: 1.25rem;
    margin-top: var(--spacing-sm);
  }

  .dashboard-subtitle {
    font-size: 0.8rem;
  }

  .selectors-wrapper {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}
</style>
