const express = require('express')
const fs = require('fs')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = express()
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());
// Parse JSON bodies (as sent by API clients)
app.use(express.json());

const port = 3000
const secret_phrase = "ThisIsMySecretPhrase"
const userFilePath = "./storage/users.json"


class User {
    constructor(email, password) {
        this.email = email
        this.hash = bcrypt.hashSync(password, 10)
    }

    updatePassowrd(password) {
        this.hash = bcrypt.hashSync(password, 10)
    }

    checkPassword(password) {
        return bcrypt.compareSync(password, this.hash)
    }

    checkAlreadyExists() {
        let users = readUsersFromDatabase()
        return users.some(user => user.email == this.email)
    }
}


function generateAccessToken(payload) {
    // creates a new token valid for 1800 seconds (30min)
    return jwt.sign(payload, secret_phrase, { expiresIn: 1800 })
}

function readUsersFromDatabase() {
    return JSON.parse(fs.readFileSync(userFilePath))
}

function addUserToDatabase(user) {
    let users = readUsersFromDatabase()
    users.push(user)
    fs.writeFileSync(userFilePath, JSON.stringify(users))
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
                res.status(401).json({ "error": "Invalid token" })
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

app.post('/register', (req, res) => {
    let email, password;
    // the POST request needs to be check before processing the data
    try {
        email = req.body.email;
        password = req.body.password;
    }
    catch {
        res.status(401).json({ "error": "Invalid argument" })
    }

    const user = new User(email, password)

    if (user.checkAlreadyExists()) {
        res.status(401).json({ "error": "email already exists" })
    }
    else {
        addUserToDatabase(user)
        res.json(user)
    }
})


app.listen(port, () => {
    console.log(`server running on port ${port}`)
})