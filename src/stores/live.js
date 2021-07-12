import { defineStore } from 'pinia'
import _ from 'lodash'
import helpers from '@/helpers'
import axios from 'axios'

let idCounter = 0

function newTab () {
  return _.cloneDeep({
    id: ++idCounter,
    name: 'Tab 0',
    form: {
      debug_mode: false,
      paper_mode: true,
      routes: [],
      extra_routes: []
    },
    results: {
      showResults: false,
      executing: false,
      progressbar: {
        current: 0,
        estimated_remaining_seconds: 0
      },
      routes_info: [],
      metrics: [],
      infoLogs: '',
      errorLogs: '',
      exception: {
        error: '',
        traceback: ''
      },
      charts: {
        equity_curve: []
      }
    }
  })
}

export const useLiveStore = defineStore({
  id: 'live',
  state: () => ({
    tabs: {
      1: newTab()
    }
  }),
  actions: {
    addTab () {
      const tab = newTab()
      this.tabs[tab.id] = tab
      return this.$router.push(`/live/${tab.id}`)
    },
    startInNewTab (id) {
      const tab = newTab()
      tab.form = _.cloneDeep(this.tabs[id].form)
      this.tabs[tab.id] = tab
      this.start(tab.id)
    },
    start (id) {
      this.tabs[id].results.progressbar.current = 0
      this.tabs[id].results.executing = true
      this.tabs[id].results.infoLogs = ''
      this.tabs[id].results.errorLogs = ''
      this.tabs[id].results.exception.traceback = ''
      this.tabs[id].results.exception.error = ''

      axios.post('http://127.0.0.1:8000/live', {
        id,
        routes: this.tabs[id].form.routes,
        extra_routes: this.tabs[id].form.extra_routes,
        debug_mode: this.tabs[id].form.debug_mode,
        paper_mode: this.tabs[id].form.paper_mode,
      }).catch(error => {
        this.notyf.error(`[${error.response.status}]: ${error.response.statusText}`)
        this.tabs[id].results.executing = false
      })
    },
    cancel (id) {
      this.tabs[id].results.executing = false
      axios.delete('http://127.0.0.1:8000/live', {
        headers: {},
        data: {
          id,
          paper_mode: this.tabs[id].form.paper_mode
        }
      }).catch(error => this.notyf.error(`[${error.response.status}]: ${error.response.statusText}`))
    },
    rerun (id) {
      this.tabs[id].results.showResults = false
      this.start(id)
    },
    newLive (id) {
      this.tabs[id].results.showResults = false
    },

    candlesInfoEvent (id, data) {
      this.tabs[id].results.info = [
        ['Period', data.duration],
        [
          'Starting-Ending Date',
          `${helpers.timestampToDate(
            data.starting_time
          )} => ${helpers.timestampToDate(data.finishing_time)}`
        ]
      ]
    },
    routesInfoEvent (id, data) {
      const arr = []
      data.forEach(item => {
        arr.push([
          item.exchange,
          item.symbol,
          item.timeframe,
          item.strategy_name
        ])
      })
      this.tabs[id].results.routes_info = arr
    },
    progressbarEvent (id, data) {
      this.tabs[id].results.progressbar = data
    },
    infoLogEvent (id, data) {
      this.tabs[id].results.infoLogs += `[${helpers.timestampToTime(
        data.time
      )}] ${data.message}\n`
    },
    exceptionEvent (id, data) {
      this.tabs[id].results.exception.error = data.error
      this.tabs[id].results.exception.traceback = data.traceback
    },
    metricsEvent (id, data) {
      this.tabs[id].results.metrics = [
        ['Total Closed Trades', data.total],
        [
          'Total Net Profit',
          `${_.round(data.net_profit, 2)} (${_.round(data.net_profit_percentage, 2)}%)`
        ],
        [
          'Starting => Finishing Balance',
          `${_.round(data.starting_balance, 2)} => ${_.round(data.finishing_balance, 2)}`
        ],
        ['Open Trades', data.total_open_trades],
        ['Total Paid Fees', _.round(data.fee, 2)],
        ['Max Drawdown', _.round(data.max_drawdown, 2)],
        ['Annual Return', `${_.round(data.annual_return, 2)}%`],
        [
          'Expectancy',
          `${_.round(data.expectancy, 2)} (${_.round(data.expectancy_percentage, 2)}%)`
        ],
        [
          'Avg Win | Avg Loss',
          `${_.round(data.average_win, 2)} | ${_.round(data.average_loss, 2)}`
        ],
        ['Ratio Avg Win / Avg Loss', _.round(data.open_pl, 2)],
        ['Win-rate', `${_.round(data.win_rate * 100, 2)}%`],
        [
          'Longs | Shorts',
          `${_.round(data.longs_percentage, 2)}% | ${_.round(data.shorts_percentage, 2)}%`
        ],
        ['Avg Holding Time', data.average_holding_period],
        ['Winning Trades Avg Holding Time', data.average_winning_holding_period],
        ['Losing Trades Avg Holding Time', data.average_losing_holding_period],
        ['Sharpe Ratio', _.round(data.sharpe_ratio, 2)],
        ['Calmar Ratio', _.round(data.calmar_ratio, 2)],
        ['Sortino Ratio', _.round(data.sortino_ratio, 2)],
        ['Omega Ratio', _.round(data.omega_ratio, 2)],
        ['Winning Streak', data.winning_streak],
        ['Losing Streak', data.losing_streak],
        ['Largest Winning Trade', _.round(data.largest_winning_trade, 2)],
        ['Largest Losing Trade', _.round(data.largest_losing_trade, 2)],
        ['Total Winning Trades', data.total_winning_trades],
        ['Total Losing Trades', data.total_losing_trades]
      ]
    },
    equityCurveEvent (id, data) {
      this.tabs[id].results.charts.equity_curve = []
      data.forEach(item => {
        this.tabs[id].results.charts.equity_curve.push({
          value: item.balance,
          time: item.timestamp
        })
      })

      // live is finished, time to show charts:
      this.tabs[id].results.executing = false
      this.tabs[id].results.showResults = true
    }
  }
})
