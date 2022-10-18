<script setup>
import { ref, onMounted, onUnmounted, watch, defineProps } from 'vue'
import { createChart } from 'lightweight-charts'
import axios from 'axios'

const props = defineProps({
  chartDataParams: {
    type: Object
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
let connection = null
let pongInterval = null

const chartData = ref({
  kline: [],
  vol: []
})

const chartContainer = ref()

const startGettindData = async (tic, int, lim) => {
  // Get kline from API
  const res = await axios.get(
    `https://fapi.binance.com/fapi/v1/klines?symbol=${tic.toUpperCase()}&interval=${int}&limit=${lim}`
  )

  res.data.forEach((element, index, array) => {
    const date = element[0] / 1000

    // remove last candle to prevent duplicate
    if (index !== array.length - 1) {
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
        color: 'rgba(50, 50, 61, 0.8)'
      }

      chartData.value.kline.push(klineFormatted)
      chartData.value.vol.push(volFormatted)
    }
  })

  // Draw fresh candles from websocket
  const connectionLink = `wss://fstream.binance.com/stream?streams=${tic.toLowerCase()}@kline_${int}`

  connection = new WebSocket(connectionLink)

  connection.onopen = () => {
    pongInterval = setInterval(() => {
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
          color: 'rgba(50, 50, 61, 0.8)',
          time: startTime / 1000
        })
      }
    }
  }
}

const createChartBody = () => {
  chart = createChart(chartContainer.value, props.chartOptions)

  // Add properties
  if (props.priceScaleOptions) {
    chart.priceScale().applyOptions(props.priceScaleOptions)
  }

  if (props.timeScaleOptions) {
    chart.timeScale().applyOptions(props.timeScaleOptions)
  }

  if (props.autosize) {
    window.addEventListener('resize', resizeHandler)
  }
}

const stopData = () => {
  connection.close()
  connection = null
  clearInterval(pongInterval)
  chartData.kline = []
  chartData.vol = []

  chart.removeSeries(series)
  chart.removeSeries(volume)
  console.log('ooo')
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
  series.setData(chartData.value.kline)
  volume = chart.addHistogramSeries(props.volumeOptions)
  volume.setData(chartData.value.vol)
}

onMounted(async () => {
  await createChartBody()
  // Get chart data
  await startGettindData(
    props.chartDataParams.ticker,
    '1m',
    props.chartDataParams.candlesLimit
  )

  addSeriesAndData(props)

  setTimeout(() => stopData(), 4000)
})

onUnmounted(() => {
  connection = null
  pongInterval = null

  if (chart) {
    chart.remove()
    chart = null
  }
  if (series) {
    series = null
  }
  if (volume) {
    volume = null
  }
  window.removeEventListener('resize', resizeHandler)
})

// WARCHERS
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

// watch(
//   () => props.chartDataParams.interval,
//   async (newData) => {
//     await startGettindData(
//       props.chartDataParams.ticker,
//       newData,
//       props.chartDataParams.candlesLimit
//     )

//     updateChartsData()
//   }
// )

// watch(
//   () => props.chartOptions,
//   (newOptions) => {
//     if (!chart) return
//     chart.applyOptions(newOptions)
//   }
// )

// watch(
//   () => props.seriesOptions,
//   (newOptions) => {
//     if (!series) return
//     series.applyOptions(newOptions)
//   }
// )

// watch(
//   () => props.priceScaleOptions,
//   (newOptions) => {
//     if (!chart) return
//     chart.priceScale().applyOptions(newOptions)
//   }
// )

// watch(
//   () => props.timeScaleOptions,
//   (newOptions) => {
//     if (!chart) return
//     chart.timeScale().applyOptions(newOptions)
//   }
// )
</script>

<template>
  <div class="chart" ref="chartContainer"></div>
</template>

<style scoped>
.chart {
  height: 100%;
}
</style>
