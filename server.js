const { Server } = require('node:net')
const { END } = require('./protocol.js')

class MyGreatServer {
  HOST = '0.0.0.0'
  connections = new Map()

  constructor () {
    if (process.argv.length !== 3) this.error(`Usage: node ${__filename} port`)
    let port = process.argv[2]
    if (isNaN(port)) this.error(`Invalid port ${port}`)
    port = Number(port)
    this.listen({ port, host: this.HOST })
  }

  sendMessage (msg, origin) {
    for (const socket of this.connections.keys()) {
      if (socket !== origin) socket.write(msg)
    }
  }

  listen ({ port, host }) {
    const server = new Server()
    // Ports: 2^16 = 16bits = 65536
    server.listen(
      {
        port,
        host //IPv4
      },
      () => console.log(`🚀 Server listening on port ${port}`)
    )

    server.on('connection', socket => {
      const remoteSocket = `${socket.remoteAddress}:${socket.remotePort}`
      console.log(`💞 New connection established from ${remoteSocket}`)
      console.log('📖 Waiting for the username...')

      socket.setEncoding('utf-8')

      socket.on('data', msg => {
        if (!this.connections.has(socket)) {
          console.log(`✔ Username ${msg} set for connection ${remoteSocket}`)
          this.connections.set(socket, msg)
        } else if (msg === END) socket.end()
        else {
          const fullMsg = `[${this.connections.get(socket)}]: ${msg}`
          console.log(`${remoteSocket} -> ${fullMsg}`)
          this.sendMessage(fullMsg, socket)
        }
      })

      socket.on('close', () => {
        console.log(
          `💔 Connection with ${remoteSocket} -> [${this.connections.get(
            socket
          )}] closed`
        )
        this.connections.delete(socket)
      })

      socket.on('error', err => console.log(`❌ Error: ${err.message}`))
    })
  }

  error (msg) {
    console.error(msg)
    process.exit(1)
  }
}

;(() => {
  new MyGreatServer()
})()
