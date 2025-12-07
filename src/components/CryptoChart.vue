<script lang="ts" setup>
import type { CoinSymbol } from '@/constants/coins'
import {
  CategoryScale,
  Chart,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import { markRaw, nextTick, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import { useCoinHistory } from '../composables/useCoinHistory'
import { useTheme } from '../composables/useTheme'
import { getStyle } from '../utils/getStyle'

const { coin, period } = defineProps<{
  coin: CoinSymbol
  period: string
}>()

const { history, isFetching } = useCoinHistory(() => coin, () => period)

Chart.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, LineController, Filler)

const { theme } = useTheme()
const chartInstance = shallowRef<Chart | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

function renderChart() {
  if (!canvas.value)
    return

  const ctx = canvas.value.getContext('2d')
  if (!ctx)
    return

  if (chartInstance.value) {
    chartInstance.value.destroy()
    chartInstance.value = null
  }

  const accentColor = getStyle('--color-accent-primary')
  const accentGlow = getStyle('--color-accent-glow')
  const textColor = getStyle('--color-text-secondary')
  const borderColor = getStyle('--color-border')

  const gradient = ctx.createLinearGradient(0, 0, 0, 400)
  gradient.addColorStop(0, accentGlow)
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

  const labels = history.value.map((p) => {
    const date = new Date(p.timestamp * 1000)
    if (period === '24h') {
      return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    }
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  })

  const dataPoints = history.value.map(p => Number.parseFloat(p.price))

  chartInstance.value = markRaw(new Chart(canvas.value, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: `${coin} Price`,
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
  }))
}

watch([theme, history], () => nextTick(() => renderChart()))

watch(isFetching, (newValue) => {
  if (!newValue) {
    nextTick(() => renderChart())
  }
})

onUnmounted(() => {
  if (chartInstance.value) {
    chartInstance.value.destroy()
    chartInstance.value = null
  }
})
</script>

<template>
  <div v-if="isFetching" class="loading-indicator">
    Updating live data...
  </div>

  <div v-show="!isFetching" class="chart-wrapper">
    <canvas ref="canvas" />
  </div>
</template>

<style scoped>
.chart-wrapper {
  position: relative;
  height: 400px;
  width: 100%;
}

@media (max-width: 640px) {
  .chart-wrapper {
    height: 250px;
  }
}
</style>
