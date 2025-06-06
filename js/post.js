
const fileInput = document.getElementById('file');
const filereview = document.getElementById('review');
const postcontent = document.getElementById('post-content');

let selectedFile = null;

function triggerFileInput(){
    fileInput.click();
}

async function previewAndUploadPhoto(event) {
    const file = event.target.files[0];
    if (file) {
      selectedFile = file; 

      filereview.innerHTML = `<div class="image-thumb">
      <img src="src" alt="img" id="review-img">
      <span class="remove-img" onclick="remove(this)">&times;</span>
    </div>`;

    const img = document.getElementById('review-img'); 
      const reader = new FileReader();
      reader.onload = function(e) {
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }

}


function remove(som) {
    const image = som.closest("div");
    if (image) {
        image.remove();
        selectedFile = null;
    }

}

async function annuler() {
  confirm("discard changes");
  window.location.href = "accueil.html"
}

async function publier() {
  
  if(selectedFile && postcontent.value){
    showLoader();
  try {
    const { data: { user } } = await supabase.auth.getUser();
  
    let mediaUrl = null;
    const newContent = postcontent.value;

    if (selectedFile) {
      mediaUrl = await uploadPostMedia(selectedFile, user.id);
      selectedFile = null;
    }

    const { error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        content: newContent,
        media_url: mediaUrl
      });

    if (error) throw error;
    hideLoader();
    alert("Changes saved!");
     window.location.reload();
  } catch (error) {
    console.error("Error uploading post", error);
    alert("Failed to upload: " + error.message);
  }
  
}
  else{
    alert("fill up all field ")
  }
}


async function uploadPostMedia(file, userId) {
  try {
    const filePath = `${userId}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('posts')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = await supabase.storage
      .from('posts')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading media:", error);
    alert(`Failed to upload media: ${error.message}`);
    return null;
  }
}


const shortInput = document.getElementById('shortfile');
const shortReview = document.getElementById('short-review');
const shortContent = document.getElementById('short-content');


 let selectedShort = null ;

 function triggerShortInput(){
  shortInput.click()
 }

 async function previewShort(even){
  const short = even.target.files[0];
  if (short){
    selectedShort = short;
    shortReview.style.display = "block";
    shortReview.src = URL.createObjectURL(short);
  }
 }

 async function publiershort(){
  if (shortContent.value && selectedShort ){
    showLoader();
  try {
     const {data : {user}} = await supabase.auth.getUser();

     let short_url = null;
     const discription = shortContent.value;

     if(selectedShort){
      short_url = await uploadShort( selectedShort , user.id);
      selectedShort = null ;
     }

     const {error} = await supabase
     .from('shorts')
     .insert({
      user_id : user.id,
      content : discription,
      media_url : short_url
     })
     if (error) throw error;
     hideLoader();
     alert("Changes saved!");
     window.location.reload();
  }
  catch (error){
    console.error("Error uploading post", error);
    alert("Failed to upload: " + error.message);
  }
  }
  else{
    alert("fill up all field ")
  }
 }

 async function uploadShort(file ,userId){
      try {
       const filePath = `${userId}/${Date.now()}_${file.name}`;
       const {error : uploadError} = await supabase.storage
       .from('shorts')
       .upload(filePath , file)

       if (uploadError) throw uploadError;

       const {data : {publicUrl }} = await supabase.storage
       .from('shorts')
       .getPublicUrl(filePath)
       return publicUrl;
      }
      catch (error){
        console.error("Error uploading media:", error);
        alert(`Failed to upload media: ${error.message}`);
        return null;
      }
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


if (window.location.hash === '#short') {
  var shortsTab = new bootstrap.Tab(document.querySelector('#shorts-tab'));
  shortsTab.show();
}

function goBack() {
  window.history.back(); 
}

function showLoader() {
  document.getElementById('loader').classList.remove('hidden');
}
function hideLoader() {
  document.getElementById('loader').classList.add('hidden');
}

async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  const currentPage = window.location.pathname.split("/").pop();

  if (!session && currentPage !== "inscription.html" && currentPage !== "se_connecter.html") {
    window.location.href = "se_connecter.html";
  }
  if (session) {
    if (currentPage === "se_connecter.html") {
      window.location.href = "accueil.html";
    }
  }
}

checkAuth();