window.addEventListener("DOMContentLoaded", () => {
  fetchAndAssignProfile();
  loadPostes();
  loadShorts()
  fetchUsers();
});

const nomfield = document.getElementById('name');
const usernamefield = document.getElementById('username');
const avatar = document.getElementById('profile-img');

const fileInput = document.getElementById('profile-photo');
const postes_container = document.getElementById('posts');
const shorts_container = document.getElementById('shorts-container');
const post_number = document.getElementById('post-number');
const followers = document.getElementById('user-numberA');
const following = document.getElementById('user-numberB');



const profile_name = document.getElementById('name');
const profile_username = document.getElementById('username');


let userId = null;
let username = null;
let fullName = null;
let avatarUrl = null;
let selectedFile = null;

function triggerFileInput() {
  fileInput.click();
}

function triggerNameInput() {
  nomfield.removeAttribute("disabled");
  nomfield.focus();
}

function triggerUsernameInput() {
  usernamefield.removeAttribute("disabled");
  usernamefield.focus();
}

async function fetchUsers(){

  const { data: users, error } = await supabase
  .from("profiles")
  .select("*")
  if(following && followers){
  following.innerText = `${users.length-1}`
  followers.innerText = `${users.length-1}`}

if(error){
  console.log(error.message)
}
}

async function fetchAndAssignProfile() {
  userId = localStorage.getItem("userId");
  
 
  
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error.message);
    return;
  
  }
 
  
  
 
  username = profile.username;
  fullName = profile.full_name;
  avatarUrl = profile.avatar_url;

  

 
  if (usernamefield) usernamefield.value = username || '';
  if (nomfield) nomfield.value = fullName || '';
  if (avatar && avatarUrl) avatar.src = avatarUrl;

 
  if (profile_username) usernamefield.textContent = '@'+username || '';
  if (profile_name) nomfield.textContent = fullName || '';
  
}



async function save() {
  showLoader()
  try {
    if (selectedFile) {
      await uploadProfilePhoto(selectedFile);
      selectedFile = null; 
    }

    const newUsername = usernamefield.value;
    const newFullName = nomfield.value;

    const { error } = await supabase
      .from("profiles")
      .update({
        username: newUsername,
        full_name: newFullName
      })
      .eq("id", userId);

    if (error) throw error;

    hideLoader()
    alert("Changes saved!");

    fetchAndAssignProfile();
  } catch (error) {
    console.error("Error saving profile:", error);
    alert("Failed to save: " + error.message);
  }

  nomfield.setAttribute("disabled", true);
  usernamefield.setAttribute("disabled",true );
}


function previewAndUploadPhoto(event) {
  const file = event.target.files[0];
  if (file) {
    selectedFile = file; 
    
    
    const reader = new FileReader();
    reader.onload = function(e) {
      avatar.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

async function uploadProfilePhoto(file) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('profile-pics')
        .upload(filePath, file);
  
      if (uploadError) throw uploadError;
  
     
      const { data: { publicUrl } } = await supabase.storage
        .from('profile-pics')
        .getPublicUrl(filePath);
  
    
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,          
          avatar_url: publicUrl
        });
  
      if (upsertError) throw upsertError;
      console.log("Avatar saved!");
      return publicUrl;
  
    } catch (error) {
      console.error("Error:", error);
      alert(`Failed: ${error.message}`);
    }
  }

  
  async function loadPostes(){
    const { data : postes ,error} = await supabase
    .from("posts")
    .select("*, profiles(id, username, avatar_url,full_name)")
    .order('created_at', { ascending: false })
    .eq('user_id', userId)
   
   if (post_number)
   { post_number.innerText = `${postes.length}`}
     
    if (error) {
     console.error("Error fetching profile:", error.message);
     return;
   }
   if(!postes || !postes_container)return;
   postes_container.innerHTML = "";

   for(const [index ,post] of postes.entries()){
   
   if(postes_container)
     {
      postes_container.innerHTML += `
      <div class="post-card">
      
        <div class="d-flex align-items-center mb-2">
          <img src="${post.profiles.avatar_url}" class="rounded-circle me-2" alt="user" height="50" width="50">
          <div>
          
            <div class="fw-bold">${post.profiles.full_name}</div>
            <p class="mb-0 text-muted">@${post.profiles.username}<span class="text-primary">  ${await getDaysAgo(post.created_at)}</span></p>
          </div>
            <div style="" class="ms-auto"><i class="bi bi-trash fs-5 text-danger" style="display:block;" id="delete${index}" onclick="deletepost('${post.id}')"></i></div>
        </div>
        <div>
        ${post.content}
        </div>
        <img src="${post.media_url}" alt="Post Image">
        <div class="mt-4" id="react-${post.id}"></div>
      </div>`;
      await loadPostReactions(post.id)
    }
 }
 
   }
  async function loadShorts() {
    userId = localStorage.getItem("userId");
    const { data: shorts, error } = await supabase
      .from("shorts")
      .select("*,reactions(is_like)")
      .order("created_at", { ascending: false })
      .eq('user_id', userId);
      if(!shorts || !shorts_container)return;
      shorts_container.innerHTML="";
    for (const short of shorts) {
      shorts_container.innerHTML += `
       <div><video src="${short.media_url}" muted class="short" onclick=watch('${short.id}')></video>
       <div class="ms-3" id="react-${short.id}"></div>
       </div>
    `;
    await loadShortReactions(short.id)
    }
  }

async function watch(shortId) {
  window.location.href = `shorts.html?short_id=${shortId}`;
}