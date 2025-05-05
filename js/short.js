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
        
        <div class="pause-button" id="pause-btn-${index}" style="display:none;"></div>
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
  
        <div class="reaction-buttons">
          <button class="btn btn-primary"><img src="./assets/img/like.png" alt="" width="24"></button>
          <button class="btn btn-danger"><img src="./assets/img/dislike.png" alt="" width="24"></button>
        </div>
        <p class="text-light description">${short.content}</p>
        <div class="user-info">
        
          <img src="${short.profiles.avatar_url}" alt="User avatar" />
          <div>
            <div>${short.profiles.full_name}</div>
            <div class="text-secondary">@${short.profiles.username}</div>
          </div>
        </div>
      </div>`;
  }

  // Add event listeners after elements exist
  document.querySelectorAll(".short-container").forEach((container) => {
    container.addEventListener("click", function (e) {
      if (e.target.closest(".back-arrow")) return;
      const video = this.querySelector("video");
      const pauseBtn = this.querySelector(".pause-button");
      togglePlayPause(video, pauseBtn);
    });
  });

  setupIntersectionObserver();
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
