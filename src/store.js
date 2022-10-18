import { createStore } from 'vuex'

const store = createStore({
  state() {
    return {
      klineBinaF: {
        ADAUSDT: [
          {
            time: '18.10.2022T00:55:00',
            open: 180.34,
            high: 180.99,
            low: 178.57,
            close: 179.85
          },
          {
            time: '18.10.2022T00:56:00',
            open: 180.82,
            high: 181.4,
            low: 177.56,
            close: 178.75
          },
          {
            time: '18.10.2022T00:57:00',
            open: 175.77,
            high: 179.49,
            low: 175.44,
            close: 178.53
          },
          {
            time: '18.10.2022T00:58:00',
            open: 178.58,
            high: 182.37,
            low: 176.31,
            close: 176.97
          }
        ]
      },
      volBinaF: {
        ADAUSDT: [
          {
            time: '18.10.2022T00:55:00',
            value: 19103293.0,
            color: 'rgba(50, 50, 61, 0.5)'
          },
          {
            time: '18.10.2022T00:56:00',
            value: 21737523.0,
            color: 'rgba(50, 50, 61, 0.5)'
          },
          {
            time: '18.10.2022T00:57:00',
            value: 29328713.0,
            color: 'rgba(50, 50, 61, 0.5)'
          },
          {
            time: '18.10.2022T00:58:00',
            value: 37435638.0,
            color: 'rgba(50, 50, 61, 0.5)'
          }
        ]
      }
    }
  }
})

export default store
