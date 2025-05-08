window.addEventListener('DOMContentLoaded' ,function(){
    loadUsers();
} )

const search = document.getElementById('search-input');
const users_container = document.getElementById('user-container');
const conversations_container = document.getElementById('conversations-container');
const userId = localStorage.getItem('userId')
let usersList = null;


async function loadUsers() {
    const {data : users, error} = await supabase
    .from('profiles')
    .select('*')

    usersList = users;
    if(conversations_container){loadConversations();}
} 
async function searchUser() {
    const val = search.value.trim();
    users_container.innerHTML = "";
    let found =false;
    for(const user of usersList){
        if(val && (user.full_name.includes(val) || user.username.includes(val))){
        users_container.innerHTML += `<div class="user-card">
        <img src="${user.avatar_url}" alt="User Avatar">
        <div class="user-info">
            <h5>${user.full_name}</h5>
            <p>@${user.username}</p>
        </div>
        <button class="btn btn-sm btn-light " onclick="chat('${user.id}')">
            <i class="bi bi-send-fill fs-3"></i>
        </button>
    </div>`;
      found = true 
    }
    }
    if(!found){
    users_container.innerHTML = `<div class="alert alert-danger m-4" >No Utilsateur trouve</div>`
    }
}



async function loadConversations(){

    const { data: messages, error } = await supabase
  .from('messages')
  .select(`
    *,
    receiver:profiles!receiver_id (
      id,
      username,
      avatar_url
    ),
    sender:profiles!sender_id (
      id,
      username,
      avatar_url
    )
  `)

const lastMessages = {};

messages.forEach(msg => {
  
  const conversationKey = [msg.sender_id, msg.receiver_id].sort().join('-');

 
  if (
    !lastMessages[conversationKey] ||
    new Date(msg.created_at) > new Date(lastMessages[conversationKey].created_at)
  ) {
    lastMessages[conversationKey] = msg;
  }
});



const currentUserId = userId;

const result = Object.values(lastMessages).map(msg => {
  const isSender = msg.sender_id === currentUserId;
  const otherUser = isSender ? msg.receiver : msg.sender;

  return {
    message: msg.content,
    time: msg.created_at,
    
    user: {
      id : otherUser?.id,
      username: otherUser?.username,
      avatar_url: otherUser?.avatar_url
    }
  };
});
result.forEach(entry => {
    const newDiv = document.createElement('div');
    newDiv.innerHTML =`<div class="d-flex align-items-center mb-3" onclick="chat('${entry.user.id}')">
      <img src="${entry.user.avatar_url}" alt="avatar" class="profile-img">
      <div>
      <div>@${entry.user.username}</div>
      <div>${entry.message}</div></div>
    </div>`;
    conversations_container.appendChild(newDiv)
  });
  
}

search.addEventListener("keydown",(e)=>{
if(e.key === "Enter"){
  document.getElementById("searchbtn").click();
}
})

async function chat(userId) {
    window.location.href = `chat.html?userId=${userId}`;
}




