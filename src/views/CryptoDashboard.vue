<script lang="ts" setup>
import CryptoChart from '../components/CryptoChart.vue'
import ThemeToggle from '../components/ThemeToggle.vue'
import { useCoinHistory } from '../composables/useCoinHistory'
import { useQueryParameter } from '../composables/useQueryParameter'

const coin = useQueryParameter('coin', 'BTC')
const period = useQueryParameter('period', '7d')
const { history, isFetching } = useCoinHistory(coin, period)
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

        <div class="select-wrapper">
          <select v-model="period">
            <option value="24h">
              24 Hours
            </option>
            <option value="7d">
              7 Days
            </option>
            <option value="30d">
              30 Days
            </option>
            <option value="3m">
              3 Months
            </option>
            <option value="1y">
              1 Year
            </option>
            <option value="3y">
              3 Years
            </option>
          </select>
        </div>
      </div>

      <CryptoChart
        v-if="history.length > 0"
        :coin-symbol="coin"
        :history="history"
        :period="period"
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

.selectors-wrapper {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin: 0 auto var(--spacing-lg);
  max-width: 600px;
}

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

  .select-wrapper {
    width: 100%;
    max-width: 100%;
  }
}
</style>
