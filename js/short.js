window.addEventListener("DOMContentLoaded", () => {
  loadShorts();
});

document.addEventListener(
  "wheel",
  function (e) {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  },
  { passive: false }
);

document.addEventListener("keydown", function (e) {
  if (e.ctrlKey && (e.key === "+" || e.key === "-" || e.key === "=")) {
    e.preventDefault();
  }
});

let observer;
const shortes_container = document.getElementById("shortes");

async function loadShorts() {
  userId = localStorage.getItem("userId");
  const { data: shorts, error } = await supabase
    .from("shorts")
    .select("*, profiles(id, username, avatar_url, full_name)")
    .order("created_at", { ascending: false });

  shortes_container.innerHTML = "";

  for (const [index, short] of shorts.entries()) {
    const isOwner = short.profiles.id === userId;
    shortes_container.innerHTML += `
      <div class="short-container short" id="short-container-${index}">
        <div class="back-arrow" onclick="history.back(event)">
          &#8592;
        </div>
       
        <div class="pause-button" id="pause-btn-${index}" style="display:none;"><img src="./assets/img/playshort.png"></div>

       <a href="poster.html"><i class="bi bi-file-plus text-light fs-4" style="display:block; position:absolute; right:70px; top:23px"></i></a>
       ${
         isOwner
           ? `<div style="display:block; position:absolute; right:30px; top:22px">
       <i class="bi bi-trash fs-3 text-danger" id="delete${index}" onclick="deleteshort('${short.id}')"></i>
       </div>`
           : ``
       }

        <video src="${short.media_url}"
          id="short-${index}" 
          class="video" loop></video>
         <div id="react"><img src="" width="128" alt="react" id="react-sticker-${short.id}" style="display:none;"></div>
        <div class="reaction-buttons">
          <button class="btn btn-primary"><img src="./assets/img/like.png" alt="" width="24" onclick="like('${short.id}')"></button>
          <span id="like-${short.id}" class="reacts  text-primary"></span>
          <button class="btn btn-danger"><img src="./assets/img/dislike.png" alt="" width="24" onclick="dislike('${short.id}')" ></button>
          <span id="dislike-${short.id}" class="reacts text-danger"></span>
        </div>
        <p class="text-light description ms-3">${short.content}</p>
        <div class="user-info">
        
          <img src="${short.profiles.avatar_url}" alt="User avatar" class="ms-2" />
          <div>
            <div>${short.profiles.full_name}</div>
            <div class="text-secondary">@${short.profiles.username}</div>
          </div>
           <a href="#" onclick="downloadFile('${short.media_url}', '${short.content.trim().replace(/[^\w\s]/gi, '')}.mp4')" class="ms-5" style="position:absolute; left:170%;">
        <i class="bi bi-download fs-5 text-light"></i>
        </a>
        </div>
      </div>`;
     await loadReactions(short.id);
  }

  document.querySelectorAll(".short-container").forEach((container) => {
    container.addEventListener("click", function (e) {
      if (
        e.target.closest(".back-arrow") ||
        e.target.closest(".reaction-buttons") ||
        e.target.closest(".bi-trash") ||
        e.target.closest(".bi-file-plus") ||
        e.target.closest(".bi-download")
      )
        return;
      const video = this.querySelector("video");
      const pauseBtn = this.querySelector(".pause-button");
      togglePlayPause(video, pauseBtn);
    });
  });

  setupIntersectionObserver();
}

async function downloadFile(videoUrl, fileName) {
  try {
    const response = await fetch(videoUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error("Download failed:", error);
  }
}

function setupIntersectionObserver() {
  const options = {
    root: null,
    rootMargin: "0px",
    threshold: 0.8,
  };

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      const container = video.closest(".short-container");
      const pauseBtn = container.querySelector(".pause-button");

      if (entry.isIntersecting) {
        video
          .play()
          .then(() => {
            pauseBtn.style.display = "none";
          })
          .catch((err) => {
            pauseBtn.style.display = "flex";
          });
      } else {
        video.pause();
        pauseBtn.style.display = "flex";
      }
    });
  }, options);

  document.querySelectorAll(".video").forEach((video) => {
    observer.observe(video);
  });
}

function togglePlayPause(video, pauseBtn) {
  if (video.paused) {
    video
      .play()
      .then(() => {
        pauseBtn.style.display = "none";
      })
      .catch((err) => {
        pauseBtn.style.display = "flex";
      });
  } else {
    video.pause();
    pauseBtn.style.display = "flex";
  }
}

function historyBack(event) {
  event.stopPropagation();
  window.history.back();
}

async function loadReactions(shortId){
  const {data : reactions} = await supabase
  .from('reactions')
  .select('user_id , is_like')
  .eq('short_id',shortId)
   let likes = 0;
   let dislikes = 0;
   const likes_react = document.getElementById(`like-${shortId}`);
   const dislikes_react = document.getElementById(`dislike-${shortId}`);

  for (const react of reactions){
    if(react.is_like){
     likes+=1
    }
    else if(!react.is_like){
     dislikes+=1
    }
  }
  likes_react.innerText = `${likes}`;
  dislikes_react.innerText = `${dislikes}`
 }

async function like(shortId) {
 userId = localStorage.getItem("userId");
 const {error} = await supabase
 .from('reactions')
 .upsert([
   {
     user_id: userId,       
     post_id: null,  
     short_id: shortId,           
     is_like: true               
   }
 ],
 {
   onConflict: ['user_id', 'short_id'] 
 });
 if(error){console.log(error.message)}

 const react_sticker = document.getElementById(`react-sticker-${shortId}`);
 react_sticker.src = './assets/img/like.png';
 react_sticker.style.display= "block";
 react_sticker.classList.add("shake")
 setTimeout(() => {react_sticker.style.display= "none"},1000)

 await loadReactions(shortId)
}

async function dislike(shortId) {
 userId = localStorage.getItem("userId");
 const {error} = await supabase
 .from('reactions')
 .upsert([
  {
    user_id: userId,       
    post_id: null,  
    short_id: shortId,           
    is_like: false              
  }
],
{
  onConflict: ['user_id', 'short_id'] 
});
if(error){console.log(error.message)}

const react_sticker = document.getElementById(`react-sticker-${shortId}`);
react_sticker.src = './assets/img/dislike.png';
react_sticker.style.display= "block";
react_sticker.classList.add("shake")
setTimeout(() => {react_sticker.style.display= "none"},1000)

await loadReactions(shortId)
}

async function deleteshort(shortId) {
  if (!confirm("are you sure you want to delete this short ")) return;
  const { error } = await supabase.from("shorts").delete().eq("id", shortId);
  if (error) {
    console.error("Error deleting post:", error.message);
  } else {
    console.log("Post deleted:", shortId);
    location.reload();
  }
}
