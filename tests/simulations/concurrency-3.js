// Start server

// const server = require('../../server')

// const defaults = require('../../defaults')

// const DEFAULT_HOST = defaults.DEFAULT_HOST
// const DEFAULT_PORT = defaults.DEFAULT_PORT

// server.listen(DEFAULT_PORT, DEFAULT_HOST)
// console.log(`Serving on ${DEFAULT_HOST}:${DEFAULT_PORT}`)

// Start clients
const client = require('../../client')

var iteration = 0
var onlineCount = 0
const iterationClaims = {}

const startTime = Date.now()

const _generateNode = (nodeName, scope) => {
  return async () => {
    onlineCount++
    while (true) {
      const release = await client.lock(scope)

      if (iteration > 2000) { await release(); break }

      console.log(nodeName, 'working on', scope, 'acquired iteration', iteration)
      iteration++
      iterationClaims[nodeName] = iterationClaims[nodeName] === undefined ? { scope, claimed: 1 } : { scope, claimed: iterationClaims[nodeName].claimed + 1 }

      await release()
    }
    onlineCount--

    // Report if last node
    if (onlineCount === 0) {
      console.log('\nCONCURRENCY TEST: CLAIMING CYCLES FIVE TO FIVE')
      console.log('reporting:', nodeName)
      console.log('cycles:', iteration, '(plus reporting)')
      console.table(iterationClaims)
      console.log('time spent:', Date.now() - startTime, 'ms')
    }
  }
}

for (let nodeNumber = 0; nodeNumber < 5; nodeNumber++) {
  const nodeName = `node_${nodeNumber}`
  _generateNode(nodeName, `RESOURCE_${nodeNumber}`)()
}
