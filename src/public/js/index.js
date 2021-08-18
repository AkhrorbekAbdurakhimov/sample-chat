const socket = io()
let token = window.localStorage.getItem('token')
if (!token) window.location = '/login'
if (token) {
    token = JSON.parse(token)
    socket.emit('connecting', {token})
}


const profileAvatar = document.querySelector('.profile-avatar'),
    profileName     = document.querySelector('.profile-name'),
    chatsList       = document.querySelector('.chats-list'),
    chatMain        = document.querySelector('.chat-main'),
    form            = document.querySelector('.chat-footer'),
    textInput       = document.querySelector('#textInput'),
    uploadInput     = document.querySelector('#uploads'),
    uploadedFiles   = document.querySelector('.uploaded-file')

async function groupMembersRender() {
    let token = window.localStorage.getItem('token')
    token = token ? JSON.parse(token) : ''
    let response = await fetch('/users', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'token': token
        }
    })
    let data = await response.json()
    let string = ""
    data.users.map(user => {
        if (user.user_id == data.currentUser.id) {
            profileAvatar.src = `images/${user.avatar_link}`
            profileName.textContent = user.username
        }
        string += `
            <li class="chats-item">
                <img src=${'images/' + user.avatar_link} alt="profile-picture" />
                <p>${user.username}</p>
                <span class="online hide"><span class="text">typing</span><span class="dot"></span></span>
            </li>
        `
    })
    chatsList.innerHTML = string
    const typingStatus = document.querySelector('.online')
    socket.on('typing', () => {
        typingStatus.classList.remove('hide')
    })
    socket.on('stopping', () => {
        typingStatus.classList.add('hide')
	})
}
async function messagesRenderer() {
    let token = window.localStorage.getItem('token')
    token = token ? JSON.parse(token) : ''
    let response = await fetch('/messages', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'token': token
        }
    })
    let data = await response.json()
    let string = ""
    let str = ""
    data.messages.map(message => {
        if (message.message) {
            string += `
                <div class="msg-wrapper ${(message.user_id == data.currentUser.id) ? "msg-from" : ""}">
                    <img src=${'images/' + message.avatar_link} alt="profile-picture" />
                    <div class="msg-text">
                        <p class="msg-author">${message.username}</p>
                        <p class="msg">${message.message}</p>
                        <p class="time">${message.time}</p>
                    </div>
                </div>
            `
        }
        if (message.file_url) {
            string += `
                <div class="msg-wrapper ${(message.user_id == data.currentUser.id) ? "msg-from" : ""}">
                    <img src=${'images/' + message.avatar_link} alt="profile-picture" />
                    <div class="msg-text">
                        <p class="msg-author">${message.username}</p>
                        <object data=${'files/' + message.file_url} class="msg object-class"></object>
                        <a href="/downloads?fileName=${message.file_url}">
                            <img src="./img/download.png" width="25px" />
                        </a>
                        <p class="time">${message.time}</p>
                    </div>
                </div>
            `
            str += `
                <li class="uploaded-file-item">
                    <a href="${'files/' + message.file_url}">
                        <img src="./img/file.png" alt="file" width="30px">
                        <p>${message.file_url.length > 25 ? message.file_url.slice(5, 25) + '...' +  message.file_url.slice(message.file_url.length - 5, message.file_url.length) : message.file_url.slice(5, message.file_url.length)}</p>
                    </a>
                </li>
            `
        }
    })
    chatMain.innerHTML = string
    uploadedFiles.innerHTML = str
}

groupMembersRender()
messagesRenderer()

form.onsubmit = async (event) => {
    event.preventDefault()
    let token = window.localStorage.getItem('token')
    token = token ? JSON.parse(token) : ''
    let response = await fetch('/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'token': token
        },
        body: JSON.stringify({
            message: textInput.value
        })
    })
    response = await response.json()
    textInput.value = null
    messagesRenderer()
    socket.emit('watch', {data: "succes"})
}

socket.on('show', () => {
    messagesRenderer()
})

let timeOutId
function stopTyping () {
    socket.emit('stop typing')
}
textInput.onkeyup = () => {
    socket.emit('start typing')
    if (timeOutId) clearTimeout(timeOutId)

    timeOutId = setTimeout(() => {
        stopTyping()
    }, 1000)
}

uploadInput.onchange = async (event) => {
    event.preventDefault()
    let token = window.localStorage.getItem('token')
    token = token ? JSON.parse(token) : ''

    let formData = new FormData()
    formData.append('file', uploadInput.files[0])
    let response = await fetch('/', {
        method: 'POST',
        headers: {
            'token': token
        },
        body: formData
    })
    response = await response.json()
    textInput.value = null
    messagesRenderer()
    socket.emit('watch')
}
