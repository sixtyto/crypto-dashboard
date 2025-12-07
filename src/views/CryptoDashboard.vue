<script lang="ts" setup>
import type { CoinSymbol } from '../constants/coins'
import CoinSelector from '../components/CoinSelector.vue'
import CryptoChart from '../components/CryptoChart.vue'
import CryptoStats from '../components/CryptoStats.vue'
import PeriodSelector from '../components/PeriodSelector.vue'
import ThemeToggle from '../components/ThemeToggle.vue'
import { useQueryParameter } from '../composables/useQueryParameter'
import { PERIOD_OPTIONS } from '../constants/periods'

const coin = useQueryParameter<CoinSymbol>('coin', 'BTC')
const period = useQueryParameter('period', '7d', (val: string) => PERIOD_OPTIONS.some(o => o.value === val))
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
        <CoinSelector v-model="coin" />

        <PeriodSelector v-model="period" />
      </div>

      <CryptoStats :coin="coin" />

      <CryptoChart
        :coin="coin"
        :period="period"
      />
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
