const express = require('express')
const jwt = require('jsonwebtoken');
const app = express()
const port = 3000
const secret_phrase = "ThisIsMySecretPhrase"

function generateAccessToken(payload) {
    // creates a new token valid for 1800 seconds (30min)
    return jwt.sign(payload, secret_phrase, { expiresIn: 1800 })
}

const isAuthenticated = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];
        jwt.verify(token, secret_phrase, function (err, decoded) {
            if (!err) {
                console.log(decoded);
                req.isAuthenticated = true;
                next()
            } else {
                res.status(401).json({ "error": "Invallid token" })
            }
        })
    }
    catch {
        res.status(401).json({ "error": "Authentication token not provided" })
    }
}

app.get('/', isAuthenticated, (req, res) => {
    let response = { "test": "hello world" }
    res.json(response)
})

app.get('/login', (req, res) => {
    payload = { "email": "c@c.com" }
    token = generateAccessToken(payload)
    res.status(200)
    res.json({ token });
})


app.listen(port, () => {
    console.log(`server running on port ${port}`)
})