<script setup>
import { ref } from 'vue'
import MiniChart from '../components/MiniChart.vue'
import store from '../store'

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
  priceFormat: {
    type: 'volume'
  },
  priceScaleId: '',
  scaleMargins: {
    top: 0.95,
    bottom: 0
  },
  autoScale: false
})

// Candlestick data
const data1 = ref(store.state.klineBinaF.ADAUSDT)

const data2 = ref(store.state.volBinaF.ADAUSDT)
const lwChart = ref()
</script>

<template>
  <div class="chart-container">
    <MiniChart
      :data="data1"
      :vol="data2"
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
