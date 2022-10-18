<script setup>
import { ref } from 'vue'
import Chart from '../components/Chart.vue'
import store from '../store'

// Chart data params
const chartDataParams = ref({
  ticker: 'BTCUSDT',
  interval: '1m',
  candlesLimit: 100
})

// Chart main settings
const chartOptions = ref({
  layout: {
    backgroundColor: '#1a1b21',
    textColor: '#ccc',
    fontFamily: 'Comfortaa',
    fontSize: 12
  },
  grid: {
    vertLines: {
      color: '#1a1b21'
    },
    horzLines: {
      color: '#1a1b21'
    }
  },
  crosshair: {
    mode: 0
  },

  rightPriceScale: {
    borderColor: '#21222a',
    entireTextOnly: true
  },

  timeScale: {
    borderColor: '#21222a',
    rightOffset: 7,
    timeVisible: true,
    secondsVisible: false
  }
})

// Candles colors
const seriesOptions = ref({
  upColor: '#26A69A',
  borderUpColor: '#26A69A',
  wickUpColor: '#26A69A',
  downColor: '#E75654',
  borderDownColor: '#E75654',
  wickDownColor: '#E75654'
})

// Volume settings
const volumeOptions = ref({
  entireTextOnly: true,
  priceFormat: {
    type: 'volume'
  },
  priceLineVisible: false,
  priceScaleId: '',
  scaleMargins: {
    top: 0.95,
    bottom: 0.01
  }
})

const lwChart = ref()
</script>

<template>
  <div class="chart-container">
    <button @click="chartDataParams.interval = '1m'">1m</button>
    <button @click="chartDataParams.interval = '5m'">5m</button>
    <Chart
      :chartDataParams="chartDataParams"
      :autosize="true"
      :chart-options="chartOptions"
      :series-options="seriesOptions"
      :volume-options="volumeOptions"
      ref="lwChart"
    />
  </div>
</template>

<style scoped>
.chart-container {
  height: 400px;
  width: 50%;
  margin-bottom: 1rem;
}
</style>
