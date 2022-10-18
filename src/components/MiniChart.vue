<script setup>
import {
  ref,
  onMounted,
  onUnmounted,
  watch,
  defineExpose,
  defineProps
} from 'vue'
import { createChart } from 'lightweight-charts'
import axios from 'axios'

const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  vol: {
    type: Array,
    required: true
  },
  autosize: {
    default: true,
    type: Boolean
  },
  chartOptions: {
    type: Object
  },
  seriesOptions: {
    type: Object
  },
  volumeOptions: {
    type: Object
  },
  timeScaleOptions: {
    type: Object
  },
  priceScaleOptions: {
    type: Object
  }
})

let series
let volume
let chart

let kline = []
let vol = []

const chartContainer = ref()

const fitContent = () => {
  if (!chart) return
  chart.timeScale().fitContent()
}

const getChart = () => {
  return chart
}

defineExpose({ fitContent, getChart })

// Get kline from API
const getKline = async () => {
  const res = await axios.get(
    'https://fapi.binance.com/fapi/v1/klines?symbol=ADAUSDT&interval=1m'
  )

  res.data.forEach((element) => {
    const date = element[0] / 1000

    // console.log(dateObject.toLocaleString())

    const klineFormatted = {
      time: date,
      open: element[1],
      high: element[2],
      low: element[3],
      close: element[4]
    }

    const volFormatted = {
      time: date,
      value: element[7],
      color: 'rgba(50, 50, 61, 0.5)'
    }

    kline.push(klineFormatted)
    vol.push(volFormatted)
  })
}

// Auto resizes the chart when the browser window is resized.
const resizeHandler = () => {
  if (!chart || !chartContainer.value) return
  const dimensions = chartContainer.value.getBoundingClientRect()
  chart.resize(dimensions.width, dimensions.height)
}

// Creates the chart series and sets the data.
const addSeriesAndData = (props) => {
  series = chart.addCandlestickSeries(props.seriesOptions)
  series.setData(kline)
  volume = chart.addHistogramSeries(props.volumeOptions)
  volume.setData(vol)
}

onMounted(async () => {
  await getKline()
  // Create the Lightweight Charts Instance using the container ref.
  chart = createChart(chartContainer.value, props.chartOptions)
  addSeriesAndData(props)

  if (props.priceScaleOptions) {
    chart.priceScale().applyOptions(props.priceScaleOptions)
  }

  if (props.timeScaleOptions) {
    chart.timeScale().applyOptions(props.timeScaleOptions)
  }

  // chart.timeScale().fitContent()

  if (props.autosize) {
    window.addEventListener('resize', resizeHandler)
  }
})

onUnmounted(() => {
  if (chart) {
    chart.remove()
    chart = null
  }
  if (series) {
    series = null
  }
  window.removeEventListener('resize', resizeHandler)
})

watch(
  () => props.autosize,
  (enabled) => {
    if (!enabled) {
      window.removeEventListener('resize', resizeHandler)
      return
    }
    window.addEventListener('resize', resizeHandler)
  }
)

watch(
  () => props.type,
  (newType) => {
    if (series && chart) {
      chart.removeSeries(series)
    }
    addSeriesAndData(props)
  }
)

watch(
  () => props.data,
  (newData) => {
    if (!series) return
    series.setData(newData)
  }
)

watch(
  () => props.chartOptions,
  (newOptions) => {
    if (!chart) return
    chart.applyOptions(newOptions)
  }
)

watch(
  () => props.seriesOptions,
  (newOptions) => {
    if (!series) return
    series.applyOptions(newOptions)
  }
)

watch(
  () => props.priceScaleOptions,
  (newOptions) => {
    if (!chart) return
    chart.priceScale().applyOptions(newOptions)
  }
)

watch(
  () => props.timeScaleOptions,
  (newOptions) => {
    if (!chart) return
    chart.timeScale().applyOptions(newOptions)
  }
)
</script>

<template>
  <div class="mini-chart" ref="chartContainer"></div>
</template>

<style scoped>
.mini-chart {
  height: 100%;
}
</style>
