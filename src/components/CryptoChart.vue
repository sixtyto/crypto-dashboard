<script lang="ts" setup>
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
import { computed, markRaw, nextTick, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import { useCoinHistory } from '../composables/useCoinHistory'
import { useTheme } from '../composables/useTheme'
import { getStyle } from '../utils/getStyle'

const props = defineProps<{
  coinName: string
  coinUuid: string
  period: string
  comparisonCoinName?: string
  comparisonCoinUuid?: string
}>()

const { history: primaryHistory, isFetching: isPrimaryFetching } = useCoinHistory(() => props.coinUuid, () => props.period)
const { history: secondaryHistory, isFetching: isSecondaryFetching } = useCoinHistory(() => props.comparisonCoinUuid || '', () => props.period)

const isFetching = computed(() => isPrimaryFetching.value || (!!props.comparisonCoinUuid && isSecondaryFetching.value))

Chart.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, LineController, Filler)

const { theme } = useTheme()
const chartInstance = shallowRef<Chart | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

function normalizeData(data: { price: string }[]) {
  const firstPoint = data[0]
  if (!firstPoint)
    return []
  const startPrice = Number.parseFloat(firstPoint.price)
  return data.map(p => ((Number.parseFloat(p.price) - startPrice) / startPrice) * 100)
}

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

  const hasComparison = secondaryHistory.value.length > 0
  const accentColor = getStyle('--color-accent-primary')
  const comparisonColor = getStyle('--color-text-primary')
  const accentGlow = getStyle('--color-accent-glow')
  const textColor = getStyle('--color-text-secondary')
  const borderColor = getStyle('--color-border')

  const gradient = ctx.createLinearGradient(0, 0, 0, 400)
  gradient.addColorStop(0, accentGlow)
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

  const labels = primaryHistory.value.map((p) => {
    const date = new Date(p.timestamp * 1000)
    if (props.period === '24h') {
      return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    }
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  })

  let primaryData: number[]
  let secondaryData: number[] = []

  if (hasComparison) {
    primaryData = normalizeData(primaryHistory.value)
    secondaryData = normalizeData(secondaryHistory.value)
  }
  else {
    primaryData = primaryHistory.value.map(p => Number.parseFloat(p.price))
  }

  const datasets = [
    {
      label: props.coinName,
      data: primaryData,
      borderColor: accentColor,
      backgroundColor: hasComparison ? 'transparent' : gradient,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 6,
      pointBackgroundColor: accentColor,
      pointHoverBackgroundColor: accentColor,
      pointHoverBorderColor: '#fff',
      pointHoverBorderWidth: 2,
      fill: !hasComparison,
      tension: 0.4,
    },
  ]

  if (hasComparison) {
    datasets.push({
      label: props.comparisonCoinName || 'Comparison',
      data: secondaryData,
      borderColor: comparisonColor,
      backgroundColor: 'transparent',
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 6,
      pointBackgroundColor: comparisonColor,
      pointHoverBackgroundColor: comparisonColor,
      pointHoverBorderColor: '#fff',
      pointHoverBorderWidth: 2,
      fill: false,
      tension: 0.4,
    })
  }

  chartInstance.value = markRaw(new Chart(canvas.value, {
    type: 'line',
    data: {
      labels,
      datasets,
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
          display: hasComparison,
          labels: {
            color: textColor,
          },
        },
        tooltip: {
          backgroundColor: getStyle('--color-bg-secondary'),
          titleColor: getStyle('--color-text-primary'),
          bodyColor: getStyle('--color-text-secondary'),
          borderColor,
          borderWidth: 1,
          padding: 10,
          displayColors: true,
          callbacks: {
            label: (context) => {
              let label = context.dataset.label || ''
              if (label) {
                label += ': '
              }
              if (context.parsed.y !== null) {
                if (hasComparison) {
                  label += `${context.parsed.y.toFixed(2)}%`
                }
                else {
                  label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y)
                }
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
              if (hasComparison) {
                return `${Number(value).toFixed(2)}%`
              }
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

watch([theme, primaryHistory, secondaryHistory], () => nextTick(() => renderChart()))

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

onMounted(() => {
  renderChart()
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
