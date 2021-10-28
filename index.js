const express = require('express')
const app = express()
const port = 3000

const isAuthenticated = (req, res, next) => {
    console.log('middleware')
    next()
}

app.get('/', isAuthenticated, (req, res) => {
    res.send('hello world')
})


app.listen(port, () => {
    console.log(`server running on port ${port}`)
})