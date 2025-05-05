window.addEventListener("DOMContentLoaded", () => {
  fetchAndAssignProfile();
  loadPostes();
});


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


const nomfield = document.getElementById('name');
const usernamefield = document.getElementById('username');
const avatar = document.getElementById('profile-img');
const fileInput = document.getElementById('profile-photo');
const postes_container = document.getElementById('posts');
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


async function fetchAndAssignProfile() {
  userId = localStorage.getItem("userId");
  
  const { data: users, error1 } = await supabase
    .from("profiles")
    .select("*")
  following.innerText = `${users.length-1}`
  followers.innerText = `${users.length-1}`
  
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error.message);
    return;
  
  }
  if (error1) {
    console.error("Error fetching profile:", error1.message);
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
 
    post_number.innerText = `${postes.length}`
     
    if (error) {
     console.error("Error fetching profile:", error.message);
     return;
   }
   for(const [index ,post] of postes.entries()){
     postes_container.innerHTML += `
      <div class="post-card">
      
        <div class="d-flex align-items-center mb-2">
          <img src="${post.profiles.avatar_url}" class="rounded-circle me-2" alt="user" height="50" width="50">
          <div>
          
            <div class="fw-bold">${post.profiles.full_name}</div>
            <small class="text-muted">@${post.profiles.username}</small>
          </div>
            <div style="" class="ms-auto"><i class="bi bi-trash fs-5 text-danger" style="display:block;" id="delete${index}" onclick="deletepost('${post.id}')"></i></div>
        </div>
        <div>
        ${post.content}
        </div>
        <img src="${post.media_url}" alt="Post Image">
      </div>`;
 }
 
   }
 
  async function deletepost(postId){
   if(!confirm("are you sure you want to delete this post "))return;
    const {error} = await supabase
    .from('posts')
    .delete()
    .eq('id' , postId)
    if (error) {
     console.error("Error deleting post:", error.message);
   } else {
     console.log("Post deleted:", postId);
     location.reload();
   }
  }




