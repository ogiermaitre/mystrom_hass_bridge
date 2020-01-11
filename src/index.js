const express = require('express')
const fetch = require('node-fetch')

const { format, transports, createLogger } = require('winston')

const { combine, printf, colorize } = format


const token = process.env.HASS_TOKEN
const address = process.env.HASS_ADDR


const myFormat = printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
const logger = createLogger({
    format: format.combine(
        format.timestamp(),
        myFormat,
    ),
    transports: [
        new transports.Console({ format: combine(colorize(), myFormat), level: 'info' }),
        // new transports.File({ format: myFormat, filename: logfilePath, level: 'info' }),
    ],
})


// All the get request are described into the gets field and associated to
// the express server with registerGets.
const server = {
    availableYears: [],
    defaultPort: 8080,
    app: express(),
    createServer() {
        const s = server.app.listen(server.defaultPort, () => {
            const { address, port } = s.address()
            logger.info(`Example app listening at http://${address}:${port}`)
        })
        return server
    },
    registerHeaders() {
        const setHeader = (req, res, next) => {
            // Website you wish to allow to connect
            res.setHeader('Access-Control-Allow-Origin', '*')
            // Request methods you wish to allow
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
            // Request headers you wish to allow
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
            // Set to true if you need the website to include cookies in the requests sent
            // to the API (e.g. in case you use sessions)
            res.setHeader('Access-Control-Allow-Credentials', true)
            // finally set the charset
            res.header('Content-Type', 'application/json; charset=utf-8')
            // Pass to next layer of middleware
            next()
        }
        server.app.use(setHeader)
        return server
    },
    registerGets() {
        server.gets.forEach(g => server.app.get(g.name, g.fun))
        return server
    },
    registerPGets() {
        server.pGets.forEach(v => {
            server.app.get(v.name, (req, res, next) => server.tools.sendJSONDataPromise(res, next, v.fun(req, res, next)))
        })
        return server
    },
    registerLogger() {
        server.app.use((error, req, res, next) => {
            logger.log('error', `${req.originalUrl} ${error}`)
            next()
        })
        server.app.use('*', (req, res, next) => {
            if (res.finished) {
                logger.log('info', `request on ${req._parsedUrl.pathname} with parameters ${Object.keys(req.query)}`)
            } else {
                logger.log('warn', `${req.method} on ${req.originalUrl} was not handled`)
                next()
            }
        })
        return server
    },
    launch() {
        server
            .createServer()
            .registerHeaders()
            .registerGets()
            .registerPGets()
            .registerLogger()
    },
    pGets: [
        {
            name: '/config',
            fun() {
                return Promise.resolve('salut la foule')
            }
        },
        {
            name: '/test',
            fun(req) {
                //             curl -X GET \
                // -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJmMjAyM2Y4Mzc0NGI0MGJjYWY2NGE5OWU2YjQ0ODc2YyIsImlhdCI6MTU3ODc0NTk4MiwiZXhwIjoxODk0MTA1OTgyfQ.c0VhvP6pky1itDcGl29itOI2RGCnsCH_StN04Vs87Xs" \
                // -H "Content-Type: application/json" \
                // http://hassio.local:8123/api/mystrom?double=Button1
                const { action, id } = req.query
                const query = `http://${address}:8123/api/mystrom?${action}=Button${id}`
                console.log(query)
                return fetch(query, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        'Content-Type': "application/json"
                    }
                })
                    .then(d => console.log(d))
            }
        }
    ],
    gets: [],
    tools: {
        internalServerErrorCode: 500,
        sendJSONDataPromise(res, next, prom) {
            res.setHeader('Content-Type', 'application/json')
            prom
                .then(d => {
                    res.end(JSON.stringify({ status: 'OK', result: d }))
                    next()
                })
                .catch(e => {
                    console.log(e)
                    res.status(server.tools.internalServerErrorCode).end(JSON.stringify({ status: 'NOK', err: e }))
                    next()
                })
        },
    },
}

server.launch()
