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
  for(const [index ,post] of postes.entries()){
    const isOwner = post.profiles.id === userId;
    const date = new Date(post.created_at);
    const now = new Date();
    postes_container.innerHTML += `<div class="card mb-4">
    <div class="card-body">
      <div class="d-flex align-items-center">
        <img src="${post.profiles.avatar_url}" alt="User Image" class="profile-img me-3">
        <div>
          <h5 class="mb-1">${post.profiles.full_name}</h5>
          <p class="mb-0 text-muted">@${post.profiles.username}<span class="text-primary"> ${await getDaysAgo(post.created_at)}</span></p>
        </div>
        ${isOwner ? 
        `<div style="position:absolute; right:30px;"><i class="bi bi-trash fs-5 text-danger" style="display:block;" id="delete${index}" onclick="deletepost('${post.id}')"></i></div>
      </div>` : `<div style="position:absolute; right:30px;"><i class="bi bi-trash fs-5 text-danger" style="display:none;" id="delete${index}" onclick="deletepost('${post.id}')"></i></div>
      </div>`}

      <p class="post-content mt-3">
       ${post.content}
      </p>
      
      <img src="${post.media_url}" alt="Post Image" class="post-img mt-3">

      <div id="react"><img src="" width="128" alt="react" id="react-sticker-${post.id}" style="display:none;"></div>
      
      <div class="social-icons mt-3 d-flex justify-content-between w-100">
        <div>
          <button class="btn btn-outline-primary mx-1"><img src="/assets/img/like.png" alt="like" width="24" onclick="like('${post.id}')"></button>
          <button class="btn btn-outline-danger mx-1"><img src="/assets/img/dislike.png" alt="dislike" width="24" onclick="dislike('${post.id}')"></button>
          <span id="react-${post.id}"></span>
        </div>
        
       <a href="#" onclick="downloadFile('${post.media_url}', '${post.content.trim().replace(/[^\w\s]/gi, '')}.jpeg')">
  <i class="bi bi-download fs-5"></i>
</a>
      </div>
    </div>

  </div>
`;
await loadPostReactions(post.id)
  }
}

 async function like(postId) {
  userId = localStorage.getItem("userId");
  const {error} = await supabase
  .from('reactions')
  .upsert([
    {
      user_id: userId,       
      post_id: postId,        
      short_id: null,              
      is_like: true               
    }
  ],
  {
    onConflict: ['user_id', 'post_id'] 
  });
  if(error){console.log(error.message)}

  const react_sticker = document.getElementById(`react-sticker-${postId}`);
  react_sticker.src = '/assets/img/like.png';
  react_sticker.style.display= "block";
  react_sticker.classList.add("shake")
  setTimeout(() => {react_sticker.style.display= "none"},1000)

  await loadPostReactions(postId)
  
 }
 
 async function dislike(postId) {
  userId = localStorage.getItem("userId");
  const {error} = await supabase
  .from('reactions')
  .upsert([
    {
      user_id: userId,       
      post_id: postId,        
      short_id: null,              
      is_like: false               
    }
  ],
  {
    onConflict: ['user_id', 'post_id']
  });
  if(error){console.log(error.message)};

  const react_sticker = document.getElementById(`react-sticker-${postId}`);
  react_sticker.src = '/assets/img/dislike.png';
  react_sticker.style.display= "block";
  react_sticker.classList.add("shake")
  setTimeout(() => {react_sticker.style.display= "none"},1000);

  await loadPostReactions(postId)
 }




