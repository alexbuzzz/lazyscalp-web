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
  ticker: {
    type: String
  },
  interval: {
    type: String
  },
  candlesLimit: {
    type: Number
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

let connection = null

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
    `https://fapi.binance.com/fapi/v1/klines?symbol=${props.ticker.toUpperCase()}&interval=${
      props.interval
    }&limit=${props.candlesLimit}`
  )

  res.data.forEach((element, index, array) => {
    const date = element[0] / 1000

    if (index !== array.length - 1) {
      // remove last candle to prevent duplicate
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
    }
  })
}

// Draw fresh candles from websocket
const getLastCandle = () => {
  const connectionLink = `wss://fstream.binance.com/stream?streams=${props.ticker.toLowerCase()}@kline_${
    props.interval
  }`

  connection = new WebSocket(connectionLink)

  connection.onopen = () => {
    setInterval(() => {
      connection.send('pong')
    }, 1000 * 60)

    connection.onmessage = (data) => {
      const parsedData = JSON.parse(data.data)

      if (parsedData.data !== undefined) {
        const {
          k: {
            T: startTime,
            o: open,
            c: close,
            h: high,
            l: low,
            q: volInCurrency
          }
        } = parsedData.data

        series.update({
          open: parseFloat(open),
          close: parseFloat(close),
          high: parseFloat(high),
          low: parseFloat(low),
          time: startTime / 1000
        })

        volume.update({
          value: parseFloat(volInCurrency),
          color: 'rgba(50, 50, 61, 0.5)',
          time: startTime / 1000
        })
      }
    }
  }
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

  getLastCandle()
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
  connection = null

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
  () => props.ticker,
  (newOptions) => {
    if (!chart) return
    chart.applyOptions(newOptions)
  }
)

watch(
  () => props.interval,
  (newData) => {
    if (!series) return
    series.setData(newData)
  }
)

watch(
  () => props.interval,
  (newData) => {
    if (!volume) return
    volume.setData(newData)
  }
)

watch(
  () => props.candlesLimit,
  (newOptions) => {
    if (!chart) return
    chart.applyOptions(newOptions)
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
  <div class="chart" ref="chartContainer"></div>
</template>

<style scoped>
.chart {
  height: 100%;
}
</style>
