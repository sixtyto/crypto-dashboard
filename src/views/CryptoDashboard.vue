<script setup lang="ts">
import { CategoryScale, Chart, Filler, Legend, LinearScale, LineController, LineElement, PointElement, Tooltip } from 'chart.js'
import { onMounted, ref, watch } from 'vue'
import ThemeToggle from '../components/ThemeToggle.vue'
import { useCoinHistory } from '../composables/useCoinHistory'
import { useQueryParameter } from '../composables/useQueryParameter'
import { useTheme } from '../composables/useTheme'

Chart.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, LineController, Filler)

const coin = useQueryParameter('coin', 'BTC')
const { history, isFetching } = useCoinHistory(coin)
const { theme } = useTheme()

const chartInstance = ref<Chart | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

function getStyle(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function renderChart() {
  if (!canvas.value)
    return

  const ctx = canvas.value.getContext('2d')
  if (!ctx)
    return

  if (chartInstance.value) {
    chartInstance.value.destroy()
  }

  const accentColor = getStyle('--color-accent-primary') || '#38bdf8'
  const accentGlow = getStyle('--color-accent-glow') || 'rgba(56, 189, 248, 0.5)'
  const textColor = getStyle('--color-text-secondary') || '#94a3b8'
  const borderColor = getStyle('--color-border') || 'rgba(255, 255, 255, 0.1)'

  const gradient = ctx.createLinearGradient(0, 0, 0, 400)
  gradient.addColorStop(0, accentGlow)
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

  const labels = history.value.map((p) => {
    const date = new Date(p.timestamp * 1000)
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  })

  const dataPoints = history.value.map(p => Number.parseFloat(p.price))

  chartInstance.value = new Chart(canvas.value, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: `${coin.value} Price`,
          data: dataPoints,
          borderColor: accentColor,
          backgroundColor: gradient,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointBackgroundColor: accentColor,
          pointHoverBackgroundColor: accentColor,
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: getStyle('--color-bg-secondary'),
          titleColor: getStyle('--color-text-primary'),
          bodyColor: getStyle('--color-text-secondary'),
          borderColor,
          borderWidth: 1,
          padding: 10,
          displayColors: false,
          callbacks: {
            label: (context) => {
              let label = context.dataset.label || ''
              if (label) {
                label += ': '
              }
              if (context.parsed.y !== null) {
                label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y)
              }
              return label
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
            drawTicks: false,
          },
          ticks: {
            color: textColor,
            maxTicksLimit: 7,
          },
          border: {
            display: false,
          },
        },
        y: {
          grid: {
            color: borderColor,
          },
          ticks: {
            color: textColor,
            callback: (value) => {
              return `$${Number(value).toLocaleString()}`
            },
          },
          border: {
            display: false,
            dash: [4, 4],
          },
        },
      },
    },
  })
}

watch(history, () => renderChart())
watch(theme, () => setTimeout(() => renderChart(), 50))

onMounted(() => {
  if (history.value.length > 0) {
    renderChart()
  }
})
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

      <div class="chart-wrapper">
        <canvas ref="canvas" />
      </div>

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

.chart-wrapper {
  position: relative;
  height: 400px;
  width: 100%;
}

.loading-indicator {
  text-align: center;
  margin-top: 1rem;
  color: var(--color-accent-primary);
}
</style>
