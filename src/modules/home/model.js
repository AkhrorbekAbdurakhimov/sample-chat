const { fetch, fetchAll } = require('./../../lib/postgres')

const Message = `
    insert into messages (
        user_id,
        message,
        file_url 
    ) values (
        $1, $2, $3
    ) returning message_id;
`

const GetUsers = `
    select 
        *
    from users;
`

const GetMessages = `
    select 
        u.user_id,
        u.username,
        u.avatar_link,
        m.message,
        m.file_url,
        to_char(m.message_time, 'HH24:MI:SS') as time
    from messages m
    inner join users u on u.user_id = m.user_id
`

const message = (id, message, file_url) => fetch(Message, id, message, file_url)
const getUser = (id) => fetch(GetUser, id)
const getUsers = () => fetchAll(GetUsers)
const getMessages = () => fetchAll(GetMessages)

module.exports = { message, getUsers, getMessages }