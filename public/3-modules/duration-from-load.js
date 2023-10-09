import moment from 'moment'
import { updateTime } from './update-time.js'

export function durationFromLoad (elem) {
  moment.relativeTimeThreshold('ss', 3)
  const startTime = moment()

  const oneSecond = 1000 // ms
  updateTime(elem, startTime)
  setInterval(updateTime, oneSecond, elem, startTime)
}
