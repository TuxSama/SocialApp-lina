const supabaseUrl = "https://qjbzocrygwczpuslbpbh.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqYnpvY3J5Z3djenB1c2xicGJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MjUyMjksImV4cCI6MjA2MTUwMTIyOX0.b2zV3ZT3SMVs6I_wTn4QKgQzY9y3NgqcliIpLp_Ef9I"; 
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// async function checkAuth() {
//   const { data: { session } } = await supabase.auth.getSession();
//   const currentPage = window.location.pathname.split("/").pop();

//   if (!session && currentPage !== "inscription.html" && currentPage !== "se_connecter.html") {
//     window.location.href = "se_connecter.html";
//   }

//   if (session && (currentPage === "se_connecter.html" || currentPage === "inscription.html")) {
//     window.location.href = "accueil.html";
//   }
//   console.log(currentPage)
// }
// checkAuth(); 

async function logout() {
    await supabase.auth.signOut();
    localStorage.removeItem("userId");
    window.location.href = "se_connecter.html";

  } 

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
  
  async function getDaysAgo(posttamp) {
    const date = new Date(posttamp);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? "today" : `${diffDays} days ago`;
  }

  async function loadPostReactions(postId){
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

   async function downloadFile(fileUrl, fileName) {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
  
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
  
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("Download failed:", error);
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
   async function loadShortReactions(shortId){
    const {data : reactions} = await supabase
    .from('reactions')
    .select('user_id , is_like')
    .eq('short_id',shortId)
     let likes = 0;
     let dislikes = 0;
     const likes_react = document.getElementById(`like-${shortId}`);
     const dislikes_react = document.getElementById(`dislike-${shortId}`); 
     const react = document.getElementById(`react-${shortId}`)
    for (const react of reactions){
      if(react.is_like){
       likes+=1
      }
      else if(!react.is_like){
       dislikes+=1
      }
    }
   
   if(react){react.innerHTML = `<small class="text-primary">${likes} Likes</small> <small class="text-danger" >${dislikes} Dislike</small>`
   }  
   if(dislikes_react && likes_react ){ likes_react.innerText = `${likes}`;
    dislikes_react.innerText = `${dislikes}`;
   }}

   function showLoader() {
    document.getElementById('loader').classList.remove('hidden');
  }
  function hideLoader() {
    document.getElementById('loader').classList.add('hidden');
  }
  
  function goBack() {
    window.history.back(); 
  }