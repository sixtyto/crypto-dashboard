<script lang="ts" setup>
import CryptoChart from '../components/CryptoChart.vue'
import ThemeToggle from '../components/ThemeToggle.vue'
import { useCoinHistory } from '../composables/useCoinHistory'
import { useQueryParameter } from '../composables/useQueryParameter'

const coin = useQueryParameter('coin', 'BTC')
const { history, isFetching } = useCoinHistory(coin)
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

      <div class="select-wrapper">
        <select v-model="coin">
          <option value="BTC">
            Bitcoin (BTC)
          </option>

          <option value="ETH">
            Ethereum (ETH)
          </option>

          <option value="SOL">
            Solana (SOL)
          </option>
        </select>
      </div>

      <CryptoChart
        v-if="history.length > 0"
        :coin-symbol="coin"
        :history="history"
      />

      <div v-if="isFetching" class="loading-indicator">
        Updating live data...
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

.select-wrapper {
  position: relative;
  max-width: 300px;
  margin: 0 auto var(--spacing-lg);
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

.loading-indicator {
  text-align: center;
  margin-top: 1rem;
  color: var(--color-accent-primary);
}
</style>
