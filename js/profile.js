window.addEventListener("DOMContentLoaded", () => {
  fetchAndAssignProfile();
});

const nomfield = document.getElementById('name');
const usernamefield = document.getElementById('username');
const avatar = document.getElementById('profile-img');
const fileInput = document.getElementById('profile-photo');


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
  try {
    // 1. Upload photo if a new file was selected
    if (selectedFile) {
      await uploadProfilePhoto(selectedFile);
      selectedFile = null; // Reset after upload
    }

    // 2. Update username and full name (if modified)
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
    selectedFile = file; // Store the file for later use in save()
    
    // Preview the image
    const reader = new FileReader();
    reader.onload = function(e) {
      avatar.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

async function uploadProfilePhoto(file) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
  
      // 2. Upload image to storage
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('profile-pics')
        .upload(filePath, file);
  
      if (uploadError) throw uploadError;
  
      // 3. Get public URL
      const { data: { publicUrl } } = await supabase.storage
        .from('profile-pics')
        .getPublicUrl(filePath);
  
      // 4. Upsert profile (secure, thanks to RLS!)
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,          // Critical: Matches auth.uid()
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




