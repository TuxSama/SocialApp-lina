window.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const shortId = urlParams.get('short_id');
  if (shortId) {
    loadShortById(shortId);
  } else {
      loadShorts();  
  }
});

let observer;
const shortes_container = document.getElementById("shortes");
const userId = localStorage.getItem("userId");
async function loadShorts() {
  
  const { data: shorts, error } = await supabase
    .from("shorts")
    .select("*, profiles(id, username, avatar_url, full_name)")
    .order("created_at", { ascending: false });

  
  
  for (const [index, short] of shorts.entries()) {
    const isOwner = short.profiles.id === userId;
    shortes_container.innerHTML += `
      <div class="short-container short" id="short-container-${index}">
        <div class="back-arrow">
          <a href="/accueil.html">
            <i class="bi bi-arrow-left text-light"></i>
          </a>
        </div>
        <div class="pause-button" id="pause-btn-${index}" style="display:none;">
          <img src="/assets/img/playshort.png">
        </div>
        <a href="/poster.html#short"><i class="bi bi-file-plus text-light fs-4" style="display:block; position:absolute; right:70px; top:23px"></i></a>
        ${
          isOwner
            ? `<div style="display:block; position:absolute; right:30px; top:22px">
          <i class="bi bi-trash fs-3 text-danger" id="delete${index}" onclick="deleteshort('${short.id}')"></i>
          </div>`
            : ``
        }
        <video src="${short.media_url}" id="${short.id}" class="video" loop></video>
        <div id="react"><img src="" width="128" alt="react" id="react-sticker-${short.id}" style="display:none;"></div>
        <div class="reaction-buttons">
          <button class="btn btn-primary"><img src="/assets/img/like.png" alt="" width="24" onclick="like('${short.id}')"></button>
          <span id="like-${short.id}" class="reacts  text-primary"></span>
          <button class="btn btn-danger"><img src="/assets/img/dislike.png" alt="" width="24" onclick="dislike('${short.id}')"></button>
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
    await loadShortReactions(short.id);
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

async function loadShortById(shortId) {
  const { data: shorts, error } = await supabase
    .from("shorts")
    .select("*, profiles(id, username, avatar_url, full_name)")
    .eq("id", shortId)
   
  if (error) {
    console.error("Error fetching short:", error.message);
    return;
  }
  for (const [index, short] of shorts.entries())
{  const isOwner = short.profiles.id === userId;
  shortes_container.innerHTML += `
    <div class="short-container short" id="short-container-${index}">
      <div class="back-arrow">
          <i class="bi bi-arrow-left text-light" onclick="goBack()"></i>
      </div>
      <div class="pause-button" id="pause-btn-${index}" style="display:none;">
        <img src="/assets/img/playshort.png">
      </div>
      <a href="/poster.html#short"><i class="bi bi-file-plus text-light fs-4" style="display:block; position:absolute; right:70px; top:23px"></i></a>
      ${
        isOwner
          ? `<div style="display:block; position:absolute; right:30px; top:22px">
        <i class="bi bi-trash fs-3 text-danger" id="delete${index}" onclick="deleteshort('${short.id}')"></i>
        </div>`
          : ``
      }
      <video src="${short.media_url}" id="${short.id}" class="video" loop></video>
      <div id="react"><img src="" width="128" alt="react" id="react-sticker-${short.id}" style="display:none;"></div>
      <div class="reaction-buttons">
        <button class="btn btn-primary"><img src="/assets/img/like.png" alt="" width="24" onclick="like('${short.id}')"></button>
        <span id="like-${short.id}" class="reacts  text-primary"></span>
        <button class="btn btn-danger"><img src="/assets/img/dislike.png" alt="" width="24" onclick="dislike('${short.id}')"></button>
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

  await loadShortReactions(short.id);
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
  await loadShorts();
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
        video.play().then(() => {
          pauseBtn.style.display = "none";
        }).catch(() => {
          pauseBtn.style.display = "flex";
        });
        const shortId = entry.target.id;
        window.history.replaceState(null, '', `?short_id=${shortId}`);
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
    video.play().then(() => {
      pauseBtn.style.display = "none";
    }).catch(() => {
      pauseBtn.style.display = "flex";
    });
  } else {
    video.pause();
    pauseBtn.style.display = "flex";
  }
}

async function like(shortId) {
 
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
 react_sticker.src = '/assets/img/like.png';
 react_sticker.style.display= "block";
 react_sticker.classList.add("shake")
 setTimeout(() => {react_sticker.style.display= "none"},1000)

 await loadShortReactions(shortId)
}

async function dislike(shortId) {
 
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
react_sticker.src = '/assets/img/dislike.png';
react_sticker.style.display= "block";
react_sticker.classList.add("shake")
setTimeout(() => {react_sticker.style.display= "none"},1000)

await loadShortReactions(shortId)
}

async function deleteshort(shortId) {
  if (!confirm("are you sure you want to delete this short ")) return;
  const { error } = await supabase.from("shorts").delete().eq("id", shortId);
  if (error) {
    console.error("Error deleting post:", error.message);
  } else {
    window.location.reload();
  }
}


function goBack() {
  window.history.back(); 
}