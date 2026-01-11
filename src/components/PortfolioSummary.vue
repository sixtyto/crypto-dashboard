<script lang="ts" setup>
import type { Coin } from '@/composables/useCoins'
import { computed } from 'vue'
import { useHoldings } from '@/composables/useHoldings'

const props = defineProps<{
  coins: Coin[]
}>()

const { holdings } = useHoldings()

const portfolioAssets = computed(() => {
  return Object.entries(holdings.value).map(([symbol, holding]) => {
    const coin = props.coins.find(c => c.symbol === symbol)
    const currentPrice = coin ? Number(coin.price) : 0
    const currentValue = holding.amount * currentPrice
    const costBasis = holding.buyPrice ? holding.amount * holding.buyPrice : 0
    const profit = holding.buyPrice ? currentValue - costBasis : null
    const profitPercentage = (holding.buyPrice && holding.buyPrice > 0)
      ? ((currentPrice - holding.buyPrice) / holding.buyPrice) * 100
      : null

    return {
      symbol,
      name: coin?.name || symbol,
      amount: holding.amount,
      price: currentPrice,
      value: currentValue,
      profit,
      profitPercentage,
      iconUrl: coin?.iconUrl,
    }
  }).filter(a => a.amount > 0).sort((a, b) => b.value - a.value)
})

const totalPortfolioValue = computed(() => {
  return portfolioAssets.value.reduce((sum, asset) => sum + asset.value, 0)
})

const totalProfit = computed(() => {
  return portfolioAssets.value.reduce((sum, asset) => sum + (asset.profit || 0), 0)
})

const totalCostBasis = computed(() => {
  return Object.entries(holdings.value).reduce((sum, [_symbol, holding]) => {
    if (holding.buyPrice) {
      return sum + (holding.amount * holding.buyPrice)
    }
    return sum
  }, 0)
})

const totalProfitPercentage = computed(() => {
  if (totalCostBasis.value === 0)
    return 0
  return (totalProfit.value / totalCostBasis.value) * 100
})

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatCrypto(value: number) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 8,
  }).format(value)
}

function formatPercent(value: number) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}
</script>

<template>
  <div v-if="portfolioAssets.length > 0" class="portfolio-card">
    <div class="header">
      <div class="summary-info">
        <h3>Portfolio Summary</h3>
        <div v-if="totalCostBasis > 0" class="total-profit" :class="totalProfit >= 0 ? 'text-green' : 'text-red'">
          {{ formatPercent(totalProfitPercentage) }} ({{ formatCurrency(totalProfit) }})
        </div>
      </div>
      <div class="total-value">
        {{ formatCurrency(totalPortfolioValue) }}
      </div>
    </div>

    <div class="assets-list">
      <div v-for="asset in portfolioAssets" :key="asset.symbol" class="asset-row">
        <div class="asset-info">
          <img v-if="asset.iconUrl" :src="asset.iconUrl" class="coin-icon" alt="">
          <div v-else class="coin-placeholder" />
          <div class="asset-details">
            <span class="symbol">{{ asset.symbol }}</span>
            <span class="amount">{{ formatCrypto(asset.amount) }} units</span>
          </div>
        </div>
        <div class="asset-performance">
          <div class="asset-value">
            {{ formatCurrency(asset.value) }}
          </div>
          <div
            v-if="asset.profit !== null"
            class="asset-profit"
            :class="asset.profit >= 0 ? 'text-green' : 'text-red'"
          >
            {{ formatPercent(asset.profitPercentage || 0) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.portfolio-card {
  background: var(--color-bg-secondary);
  padding: var(--spacing-md);
  border-radius: 12px;
  border: 1px solid var(--color-border);
  margin-top: var(--spacing-lg);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--spacing-sm);
}

.summary-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--color-text-primary);
}

.total-profit {
  font-size: 0.85rem;
  font-weight: 600;
}

.total-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-accent-primary);
}

.assets-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.asset-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xs) 0;
}

.asset-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.coin-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.coin-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-border);
}

.asset-details {
  display: flex;
  flex-direction: column;
}

.symbol {
  font-weight: 600;
  color: var(--color-text-primary);
}

.amount {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.asset-performance {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.asset-value {
  font-weight: 600;
  color: var(--color-text-primary);
}

.asset-profit {
  font-size: 0.75rem;
  font-weight: 600;
}

.text-green {
  color: #10b981;
}

.text-red {
  color: #ef4444;
}
</style>
