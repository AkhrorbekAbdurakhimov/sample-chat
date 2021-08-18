const fs = require('fs')
const path = require('path')
const { fetch } = require('./../../lib/postgres')

const RegisterUser = `
    insert into users (
        username,
        email,
        password,
        avatar_link
    ) values (
        $1, $2, $3, $4
    ) returning user_id;
`

const register = ({ username, password, email, avatar_link }) => fetch(RegisterUser, username, password, email, avatar_link)


module.exports = { register }