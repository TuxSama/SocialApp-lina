window.addEventListener("DOMContentLoaded", () => {
    loadShorts();
  });
  const shortes_container = document.getElementById('shortes');
  async function loadShorts(){
    const {data : shorts , error} = await supabase
    .from('shorts')
    .select("*, profiles(id, username, avatar_url,full_name)")
    .order('created_at', { ascending: false });
  
    console.log(shorts)
    for (const[index , short] of shorts.entries()){
   shortes_container.innerHTML +=`<div class="short-container short" id="short">

      <div class="back-arrow" onclick="history.back()">
        &#8592;
      </div>
      
      <div class="play-button" onclick="play(${index})" id="btn-${index}"></div>

      <video src="${short.media_url}"
      id="short-${index}" class="video" >
    </video>

      <div class="reaction-buttons">
        <button class="btn btn-primary"><img src="./assets/img/like.png" alt="" width="24"></button>
        <button class="btn btn-danger"><img src="./assets/img/dislike.png" alt="" width="24"></button>
      </div>

      <div class="user-info">
        <img src="${short.profiles.avatar_url}" alt="User avatar" />
        <div>
          <div>${short.profiles.full_name}</div>
          <div class="text-secondary">@${short.profiles.username}</div>
        </div>
      </div>
    </div>`;}
   
  }

 
  function play(index){
    const short = document.getElementById(`short-${index}`);
    const btn = document.getElementById(`btn-${index}`);
    short.play()
    btn.style.display="none"
   

    
  }
