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


  async function getDaysAgo(posttamp) {
    const date = new Date(posttamp);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? "today" : `${diffDays} days ago`;
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

      <div class="social-icons mt-3 d-flex justify-content-between w-100">
        <div>
          <button class="btn btn-primary mx-1"><img src="./assets/img/like.png" alt="" width="24" onclick="like('${post.id}')"></button>
          <button class="btn btn-danger mx-1"><img src="./assets/img/dislike.png" alt="" width="24" onclick="dislike('${post.id}')"></button>
          <span id="react-${post.id}"></span>
        </div>
        <i class="bi bi-download fs-5"></i>
      </div>
    </div>
  </div>
`;
await loadReactions(post.id)
}

}

  async function loadReactions(postId){
   const {data : reactions} = await supabase
   .from('reactions')
   .select('user_id , is_like')
   .eq('post_id',postId)
    let likes = 0;
    let dislikes = 0;
    const react = document.getElementById(`react-${postId}`)
   for (const react of reactions){
     if(react.is_like){
      likes+=1
     }
     else if(!react.is_like){
      dislikes+=1
     }
   }
  react.innerHTML = `<span class="text-primary">${likes} Likes</span> <span class="text-danger" >${dislikes} Dislike</span>`
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
  await loadReactions(postId)
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
  await loadReactions(postId)
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


