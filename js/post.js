const fileInput = document.getElementById('file');
const filereview = document.getElementById('review');
const postcontent = document.getElementById('post-content');

let content = null;
let selectedFile = null;

function triggerFileInput(){
    fileInput.click();
}

function previewAndUploadPhoto(event) {
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
function publier(){
    
}