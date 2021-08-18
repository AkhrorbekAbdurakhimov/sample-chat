const profileAvatar = document.querySelector('.profile-avatar'),
    profileName     = document.querySelector('.profile-name'),
    chatsList       = document.querySelector('.chats-list'),
    chatMain        = document.querySelector('.chat-main'),
    form            = document.querySelector('.chat-footer'),
    textInput       = document.querySelector('#textInput'),
    uploadInput     = document.querySelector('#uploads'),
    uploadedFiles   = document.querySelector('.uploaded-file')

// let currentUserId = data.body.user_id

// profileAvatar.src = `images/${data.body.avatar_link}`
// profileName.textContent = data.body.username

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
            </li>
        `
    })
    chatsList.innerHTML = string

    // messagesRenderer(currentUserId, data)
}
async function messagesRenderer(id, users) {
    let data = await request('/messages', 'GET')
    let string = ""
    let str = ""
    data.map(message => {
        if (message.message) {
            let currentUser = users.find(user => user.user_id == message.user_id)
            string += `
                <div class="msg-wrapper ${(message.user_id == id) ? "msg-from" : ""}">
                    <img src=${'images/' + currentUser.avatar_link} alt="profile-picture" />
                    <div class="msg-text">
                        <p class="msg-author">${currentUser.username}</p>
                        <p class="msg">${message.message}</p>
                        <p class="time">${message.time}</p>
                    </div>
                </div>
            `
        } else {
            let currentUser = users.find(user => user.user_id == message.user_id)
            string += `
                <div class="msg-wrapper ${(message.user_id == id) ? "msg-from" : ""}">
                    <img src=${'images/' + currentUser.avatar_link} alt="profile-picture" />
                    <div class="msg-text">
                        <p class="msg-author">${currentUser.username}</p>
                        <object data=${'files/' + message.file_link} class="msg object-class"></object>
                        <a href="/downloads?fileName=${message.file_link}">
                            <img src="./img/download.png" width="25px" />
                        </a>
                        <p class="time">${message.time}</p>
                    </div>
                </div>
            `
            str += `
                <li class="uploaded-file-item">
                    <a href="${'files/' + message.file_link}">
                        <img src="./img/file.png" alt="file" width="30px">
                        <p>${message.file_link.length > 25 ? message.file_link.slice(5, 25) + '...' +  message.file_link.slice(message.file_link.length - 5, message.file_link.length) : message.file_link.slice(5, message.file_link.length)}</p>
                    </a>
                </li>
            `
        }
    })
    chatMain.innerHTML = string
    uploadedFiles.innerHTML = str
}

groupMembersRender()

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
    groupMembersRender()
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
    groupMembersRender()
}
