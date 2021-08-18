const path = require('path')
const Joi = require('joi')
const uniqueId = require('./../../lib/mhid')
const { register } = require('./model')
const { sign } = require('./../../lib/jwt')

const userSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().required(),
    email: Joi.string().email({minDomainSegments: 2, tlds: {allow: ['com', 'net']}}).required(),
    avatar_link: Joi.string().required()
})

const GET = (req, res) => {
    res.sendFile(path.join(process.cwd(), 'src', 'views', 'register.html'))
}

const POST = (req, res) => {
    let file = req.files.file
    let fileName = uniqueId(5) + file.name.replace(/\s/g, "_").trim()
    file.mv(path.join(process.cwd(), 'src', 'uploads', 'images', fileName), (err) => {
        if (err) console.log(err)
    })
    req.body.avatar_link = fileName
    const {error, value} = userSchema.validate(req.body)
    if (error) 
        return res.send({
            status: 400,
            message: "Bad request",
            error: error.details[0].message
        })
    
    register(value)
        .then(({user_id}) => {
            res.send({
                status: 201,
                message: "The user has registered succussfully",
                token: sign({ id: user_id })
            })
        })
        .catch((err) => {
            return res.send({ 
                status: 500, 
                message: "Internal server error" 
            })
        })
}

module.exports = { GET, POST }