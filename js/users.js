window.addEventListener('DOMContentLoaded' ,function(){
    loadUsers();
} )

const search = document.getElementById('search-input');
const users_container = document.getElementById('user-container');
let usersList = null;

async function loadUsers() {
    const {data : users, error} = await supabase
    .from('profiles')
    .select('*')

    usersList = users;
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

async function chat(userId) {
    window.location.href = `chat.html?userId=${userId}`;
}

async function recivers(){
//     usersList
//     const { data, error } = await supabase
//     .from("messages")
//     .select("*")
//     .order("created_at", { ascending: true });
//     console.log(data)
//   if (error) return console.error("Load error:", error);

  const { data: messages, error } = await supabase
  .from('messages')
  .select('*');

const lastMessages = {};
messages.forEach(msg => {
  const r = msg.receiver_id;
  if (!lastMessages[r] || new Date(msg.timestamp) > new Date(lastMessages[r].timestamp)) {
    lastMessages[r] = msg;
  }
});

const result = Object.values(lastMessages);
console.log(result);

}
recivers();