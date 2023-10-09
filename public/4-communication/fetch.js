async function fetchJson (fileUrl) {
  const response = await fetch(fileUrl)
  if (!response.ok) {
    throw new Error(`Error: ${response.status} - ${response.statusText}`)
  }

  const json = await response.json()
  return json
}

export async function fetchData (fileAddresses) {
  try {
    const results = await Promise.allSettled(
      fileAddresses.map(fileUrl => fetchJson(fileUrl))
    )

    return results.map((result, i) => ({
      url: fileAddresses[i],
      ...result
    }))
  } catch (error) {
    console.error('ERROR', error)
  }
}
