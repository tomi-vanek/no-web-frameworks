export function updateTime (elem, startTime) {
  elem.innerText = `This page was loaded ${startTime.fromNow()}.`
}
