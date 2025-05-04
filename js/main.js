window.addEventListener("DOMContentLoaded", () => {
    fetchAndAssignProfile();
    loadPostes();
  });


  const avatar = document.getElementById('profile-img');
  const postes_container = document.getElementById('postes');
  let avatarUrl  = null ;

  async function fetchAndAssignProfile(){
    userId = localStorage.getItem("userId");

    const { data: profile, error } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error.message);
    return;
  }

  avatarUrl = profile.avatar_url;
  if (avatar && avatarUrl) avatar.src = avatarUrl;
  }
  


  async function loadPostes(){
   const { data : postes ,error} = await supabase
   .from("posts")
   .select("*, profiles(id, username, avatar_url,full_name)")
   .order('created_at', { ascending: false });

  
    
   if (error) {
    console.error("Error fetching profile:", error.message);
    return;
  }
  for(let post of postes){
    postes_container.innerHTML += `<div class="card mb-4">
    <div class="card-body">
      <div class="d-flex align-items-center">
        <img src="${post.profiles.avatar_url}" alt="User Image" class="profile-img me-3">
        <div>
          <h5 class="mb-1">${post.profiles.full_name}</h5>
          <p class="mb-0 text-muted">@${post.profiles.username}</p>
        </div>
      </div>
      <p class="post-content mt-3">
       ${post.content}
      </p>
      <img src="${post.media_url}" alt="Post Image" class="post-img mt-3">

      <div class="social-icons mt-3 d-flex justify-content-between w-100">
        <div>
          <button class="btn btn-primary mx-1"><img src="./assets/img/like.png" alt="" width="24"></button>
          <button class="btn btn-danger mx-1"><img src="./assets/img/dislike.png" alt="" width="24" </button>
        </div>
        <i class="bi bi-download"></i>
      </div>
    </div>
  </div>
`;
}
  
  }