import { runServer } from './service/service.js'

const port = process.env.PORT || 8080

await runServer(port)
