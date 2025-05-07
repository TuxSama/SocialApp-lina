window.addEventListener('DOMContentLoaded',()=>{
  
  loadUsers()
})

const params = new URLSearchParams(window.location.search);
const receiverId = params.get('userId');
const senderId = localStorage.getItem("userId");
const receiver_container = document.getElementById('receiver-container');
const username = document.getElementById('username');
const avatar = document.getElementById('avatar');
const chat_Box = document.getElementById('chat-body');
const msgInput = document.getElementById('msgInput')

console.log(receiverId);

if(!receiverId || receiverId == "undefined" ){
  window.location.href= "message.html"
}
async function loadUsers() {

  const {data : user, error} = await supabase
  .from('profiles')
  .select('*')
  .eq('id',receiverId)
  .single()
  
  username.textContent = `@${user.username}`;
  avatar.src = `${user.avatar_url}`
  
  await loadMessages();
}

async function sendMessage() {
  const content = msgInput.value;
  if(!content)return;
  const { error } = await supabase
    .from("messages")
    .insert([{ sender_id: senderId, receiver_id: receiverId, content }]);
  if (error) console.error("Send failed:", error);
  else msgInput.value = "";
}

async function loadMessages() {
  
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`)
    .order("created_at", { ascending: true });
    console.log(data)
  if (error) return console.error("Load error:", error);
     chat_Box.innerHTML = "";
     data.forEach(displayMessage);
}



function displayMessage(msg) {
  const msgDiv = document.createElement("div");
  const timeText = time(msg.created_at);
  if (msg.sender_id === senderId){
    msgDiv.innerHTML =`<div class="message-right">
    <small class="text-muted fst-italic me-1">${timeText}</small>
    <div class="bubble-right">${msg.content} </div> 
  </div>`;
  }
  else{
    msgDiv.innerHTML =`<div class="message-left">
    <img src="${avatar.src} " alt="Dounia" class="profile-img">
    <div class="bubble-left">${msg.content}</div>
    <small class="text-muted fst-italic ms-1">${timeText}</small>
  </div>`;
  }

  chat_Box.appendChild(msgDiv);
 
}
async function loadRecivers(){

  const { data: messages, error } = await supabase
.from('messages')
.select(`
  *,
  receiver:profiles!receiver_id (
    username,
    avatar_url
  ),
  sender:profiles!sender_id (
    username,
    avatar_url
  )
`)
const lastMessages = {};
receiver_container.innerHTML ="";
messages.forEach(msg => {

const conversationKey = [msg.sender_id, msg.receiver_id].sort().join('-');


if (
  !lastMessages[conversationKey] ||
  new Date(msg.created_at) > new Date(lastMessages[conversationKey].created_at)
) {
  lastMessages[conversationKey] = msg;
}
});

console.log(messages);

const currentUserId = senderId;

const result = Object.values(lastMessages).map(msg => {
const isSender = msg.sender_id === currentUserId;
const otherUser = isSender ? msg.receiver : msg.sender;

return {
  message: msg.content,
  time: msg.created_at,
  user: {
    username: otherUser?.username,
    avatar_url: otherUser?.avatar_url
  }
};
});
result.forEach(entry => {
  const newDiv = document.createElement('div');
  newDiv.innerHTML =`<div class="d-flex align-items-center mb-3">
    <img src="${entry.user.avatar_url}" alt="avatar" class="profile-img">
    <div>
    <div>@${entry.user.username}</div>
    <div>${entry.message}</div></div>
  </div>`;
  receiver_container.appendChild(newDiv)
});

}
function time(dateStr) {
  const date = new Date(dateStr);
  return `${date.toLocaleString("fr-FR", { weekday: "short" })} ${date.getHours()}:${date.getMinutes()}`
}


// 👂 Real-time listener
supabase
  .channel("messages-realtime")
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "messages" },
    (payload) => {
      const msg = payload.new;
      // Only show messages from/to current chat
      if (
        (msg.sender_id === senderId && msg.receiver_id === receiverId) ||
        (msg.sender_id === receiverId && msg.receiver_id === senderId)
      ) {
        displayMessage(msg);
      }
    }
  )
  .subscribe();

document.addEventListener('wheel', function(e) {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  }, { passive: false });
  
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '=')) {
      e.preventDefault();
    }
  });
  