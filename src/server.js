const express = require('express')
const app = express()
const fileUpload = require('express-fileupload')
const path = require('path')

const {host, PORT} = require('./config')

// middlewares
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'uploads')))
app.use(express.json())
app.use(fileUpload({
    limits: 500 * 1024 * 1024
}))

// modules
const modules = require('./modules')
app.use(modules)

// download files
app.get('/downloads', (req, res) => {
    res.download(path.join(__dirname, 'uploads', 'files', req.query.fileName))
})

app.listen(PORT, () => console.log(`server is running on http://${host}:${PORT}`))