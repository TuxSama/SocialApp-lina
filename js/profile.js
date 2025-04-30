// Function to trigger the file input when the pencil icon is clicked
function triggerFileInput() {
    const fileInput = document.getElementById('profile-photo');
    fileInput.click();  // Programmatically trigger the file input click
}

// Function to preview the photo and upload it
async function previewAndUploadPhoto(event) {
    const file = event.target.files[0];  // Get the selected file
    if (file) {
        // Show the image preview immediately on the profile image
        const reader = new FileReader();
        reader.onload = function(e) {
            const profileImage = document.getElementById('profile-img');
            profileImage.src = e.target.result;  // Update the profile image with the selected file
        };
        reader.readAsDataURL(file);  // Read the file as data URL

        // Call the function to upload the photo to Supabase
        await uploadProfilePhoto(file);
    }
}

// Function to upload the selected photo
async function uploadProfilePhoto(file) {
    const userId = localStorage.getItem('userId');  // Get the logged-in user's ID

    if (!userId) {
        alert('User is not logged in!');
        return;
    }

    console.log('Uploading photo for user:', userId);

    // Sanitize the file name to avoid special characters causing issues
    const sanitizedFileName = `${Date.now()}_${userId}_${encodeURIComponent(file.name)}`;

    // Upload the file to Supabase storage
    const { data, error } = await supabase.storage
        .from('profile-pics')  // Ensure the correct bucket name (profile-pics)
        .upload(`${userId}/${sanitizedFileName}`, file);  // Use sanitized file name

    if (error) {
        console.error('Error uploading photo:', error.message);
        alert('Error uploading photo!');
    } else {
        console.log('Uploaded file data:', data);
        
        // Ensure data and path are available before getting the URL
        if (data && data.path) {
            const fileUrl = supabase.storage.from('profile-pics').getPublicUrl(data.path).publicURL;

            // Log the URL before trying to update
            console.log('Generated file URL:', fileUrl);

            // Save the URL in the user's profile in the database (update avatar_url instead of profile_photo)
            const { data: updateData, error: updateError } = await supabase
                .from('users')
                .update({ avatar_url: fileUrl })  // Update the correct column name (avatar_url)
                .eq('id', userId);

            if (updateError) {
                console.error('Error updating profile photo URL:', updateError.message);
                alert('Error updating profile photo!');
            } else {
                // Log the update response to verify if the update was successful
                console.log('Update response:', updateData);
                alert('Profile photo updated successfully!');
            }
        } else {
            console.error('Failed to generate file URL. Uploaded file data or path is missing.');
            alert('Error generating file URL.');
        }
    }
}
