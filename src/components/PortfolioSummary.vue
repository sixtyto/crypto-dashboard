<script lang="ts" setup>
import type { Coin } from '@/composables/useCoins'
import { ArcElement, Chart, Legend, PieController, Tooltip } from 'chart.js'
import { computed, markRaw, nextTick, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import { useHoldings } from '@/composables/useHoldings'
import { useTheme } from '@/composables/useTheme'
import { getStyle } from '@/utils/getStyle'

const props = defineProps<{
  coins: Coin[]
}>()

const { holdings } = useHoldings()
const { theme } = useTheme()

const FALLBACK_COLORS = ['#F7931A', '#627EEA', '#26A17B', '#2775CA', '#F3BA2F', '#00A67E', '#D1C4E9', '#FFAB91']

const coinsMap = computed(() => {
  return new Map(props.coins.map(c => [c.symbol, c]))
})

const portfolioAssets = computed(() => {
  return Object.entries(holdings.value).map(([symbol, amount]) => {
    const coin = coinsMap.value.get(symbol)
    const price = coin ? Number(coin.price) : 0
    const value = amount * price
    return {
      symbol,
      name: coin?.name || symbol,
      amount,
      price,
      value,
      iconUrl: coin?.iconUrl,
      color: coin?.color,
    }
  }).filter(a => a.amount > 0).sort((a, b) => b.value - a.value)
})

const totalPortfolioValue = computed(() => {
  return portfolioAssets.value.reduce((sum, asset) => sum + asset.value, 0)
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

// Chart Logic
Chart.register(PieController, ArcElement, Tooltip, Legend)

const chartInstance = shallowRef<Chart | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

function renderChart() {
  if (!canvas.value || portfolioAssets.value.length === 0)
    return

  const ctx = canvas.value.getContext('2d')
  if (!ctx)
    return

  const textColor = getStyle('--color-text-secondary')
  const bgSecondary = getStyle('--color-bg-secondary')
  const textPrimary = getStyle('--color-text-primary')
  const borderColor = getStyle('--color-border')

  const labels = portfolioAssets.value.map(a => a.symbol)
  const data = portfolioAssets.value.map(a => a.value)
  const backgroundColors = portfolioAssets.value.map((a, i) => {
    if (a.color)
      return a.color
    return FALLBACK_COLORS[i % FALLBACK_COLORS.length]
  })

  if (chartInstance.value) {
    chartInstance.value.data.labels = labels
    chartInstance.value.data.datasets[0].data = data
    chartInstance.value.data.datasets[0].backgroundColor = backgroundColors
    chartInstance.value.data.datasets[0].borderColor = bgSecondary

    if (chartInstance.value.options.plugins?.legend?.labels) {
       chartInstance.value.options.plugins.legend.labels.color = textColor
    }
     if (chartInstance.value.options.plugins?.tooltip) {
       chartInstance.value.options.plugins.tooltip.backgroundColor = bgSecondary
       chartInstance.value.options.plugins.tooltip.titleColor = textPrimary
       chartInstance.value.options.plugins.tooltip.bodyColor = textColor
       chartInstance.value.options.plugins.tooltip.borderColor = borderColor
    }

    chartInstance.value.update()
    return
  }

  chartInstance.value = markRaw(new Chart(canvas.value, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: backgroundColors,
        borderColor: bgSecondary,
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: textColor,
            padding: 15,
            usePointStyle: true,
          },
        },
        tooltip: {
          backgroundColor: bgSecondary,
          titleColor: textPrimary,
          bodyColor: textColor,
          borderColor,
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: (context) => {
              const value = context.parsed
              const total = context.dataset.data.reduce((a, b) => (a as number) + (b as number), 0) as number
              const percentage = ((value / total) * 100).toFixed(1)
              const label = context.label || ''
              return `${label}: ${formatCurrency(value)} (${percentage}%)`
            },
          },
        },
      },
    },
  }))
}

watch([theme, portfolioAssets], () => nextTick(() => renderChart()))

onUnmounted(() => {
  if (chartInstance.value) {
    chartInstance.value.destroy()
    chartInstance.value = null
  }
})

onMounted(() => {
  renderChart()
})
</script>

<template>
  <div v-if="portfolioAssets.length > 0" class="portfolio-card">
    <div class="header">
      <h3>Portfolio Summary</h3>
      <div class="total-value">
        {{ formatCurrency(totalPortfolioValue) }}
      </div>
    </div>

    <div class="content-wrapper">
      <div class="chart-container">
        <canvas ref="canvas" />
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
          <div class="asset-value">
            {{ formatCurrency(asset.value) }}
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
  align-items: center;
  margin-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--spacing-sm);
}

.header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--color-text-primary);
}

.total-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-accent-primary);
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

@media (min-width: 768px) {
  .content-wrapper {
    flex-direction: row;
    align-items: flex-start;
  }

  .chart-container {
    flex: 1;
    height: 300px; /* Limit height */
  }

  .assets-list {
    flex: 1;
    max-height: 300px;
    overflow-y: auto;
    padding-right: var(--spacing-sm);
  }
}

.chart-container {
  position: relative;
  height: 250px;
  width: 100%;
  display: flex;
  justify-content: center;
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

.asset-value {
  font-weight: 600;
  color: var(--color-text-primary);
}
</style>
