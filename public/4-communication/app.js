import { fetchData } from './fetch.js'

export async function startApp () {
  const dataAddresses = [
    'data/foo.json',
    'data/nonexistent.json',
    'data/bar.json'
  ]

  const jsons = await fetchData(dataAddresses)

  const formattedResult = jsons
    .map(json => JSON.stringify(json, null, 4))
    .map(text => `<pre>${text}</pre>`)
    .join('<hr />\n')

  const content = document.getElementById('content')
  content.innerHTML = formattedResult
}
