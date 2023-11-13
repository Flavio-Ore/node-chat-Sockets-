const Socket = require('node:net').Socket
const { END } = require('./protocol.js')

const readline = require('node:readline').createInterface({
  input: process.stdin,
  output: process.stdout
})

class MyGreatClient {
  username = ''
  constructor () {
    if (process.argv.length !== 4)
      this.error(`Usage: node ${__filename} host port`)

    const host = process.argv[2]
    let port = process.argv[3]
    if (isNaN(port)) this.error(`Invalid port ${port}`)
    port = Number(port)

    console.log(`${host}:${port}`)

    if (module === require.main) this.connect({ host, port })
  }

  connect ({ host, port }) {
    console.log(`📲 Connecting to ${host}:${port}`)
    const socket = new Socket()

    socket.connect({ host, port })
    socket.setEncoding('utf-8')
    socket.on('connect', () => {
      console.log('🤳 Connected')
      readline.question('👤 Please type your username: ', username => {
        this.username = username
        socket.write(username)
        readline.setPrompt(`[${this.username}]: `)
        readline.prompt()
      })

      readline.on('line', msg => {
        readline.setPrompt(`[${this.username}]: `)
        readline.prompt()
        socket.write(msg)
        if (msg === END) socket.end()
      })

      socket.on('data', data => console.log(data))
      socket.on('error', err => this.error(err.message))
    })

    socket.on('close', () => {
      console.log('👋 Bye bye.')
      process.exit(0)
    })
  }

  error (msg) {
    console.error(msg)
    process.exit(1)
  }
}

;(() => {
  new MyGreatClient()
})()
