window.addEventListener("DOMContentLoaded", () => {
    fetchAndAssignProfile();
  });


  const avatar = document.getElementById('profile-img');

  let avatarUrl ;
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
  