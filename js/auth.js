const supabaseUrl = "https://qjbzocrygwczpuslbpbh.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqYnpvY3J5Z3djenB1c2xicGJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MjUyMjksImV4cCI6MjA2MTUwMTIyOX0.b2zV3ZT3SMVs6I_wTn4QKgQzY9y3NgqcliIpLp_Ef9I"; 
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

const signup_form = document.getElementById("signup-form");
const login_form = document.getElementById("login-form");
const errorBox = document.getElementById("error");

async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  const currentPage = window.location.pathname.split("/").pop();

  if (!session && currentPage !== "inscription.html" && currentPage !== "se_connecter.html") {
    window.location.href = "se_connecter.html";
  }

  if (session && (currentPage === "se_connecter.html" || currentPage === "inscription.html")) {
    window.location.href = "accueil.html";
  }
  console.log(currentPage)
}



if (signup_form) {
  signup_form.addEventListener("submit", async function (e) {
    e.preventDefault();
    e.stopPropagation();
    clearError();

    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;
    const username = document.getElementById("signup-username").value.trim();
    const name = document.getElementById("signup-name").value.trim();

    const avatar_url = "assets/img/avatar.png";  

 
    if (!email || !password || !username || !name) {
      return showError("All fields are required.");
    }

    try {
    
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username, name },
          emailRedirectTo: window.location.origin + "/se_connecter.html"
        }
      });

      if (error) throw error;

      if (data.user && data.user.identities.length === 0) {
        showSuccess("Confirmation email sent. Please check your inbox.");
        signup_form.reset();
        return;
      }


      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: data.user.id,
          username,
          full_name: name,
          avatar_url: avatar_url,
          updated_at: new Date()
        });

      if (profileError) {
        console.warn("Profile creation issue:", profileError.message);
      }

      showSuccess("Account created successfully!");
      signup_form.reset();
      console.log("Full name:", name);
    

    } catch (error) {
      handleAuthError(error);
    }
  });
}



if (login_form) {
  login_form.addEventListener("submit", async function (e) {
    e.preventDefault();
    clearError();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    if (!email || !password) {
      return showError("Email and password are required.");
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      const userId = data.user.id;
      localStorage.setItem("userId", userId);

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("username, full_name")
        .eq("id", userId)
        .single();

      if (profileData) {
        localStorage.setItem("name", profileData.full_name);
        localStorage.setItem("username", profileData.username);
      }

      window.location.href = "accueil.html";

    } catch (error) {
      handleAuthError(error);
    }
  });
}



  checkAuth(); 



function showError(message) {
  errorBox.textContent = message;
  errorBox.className = 'alert alert-danger';
  errorBox.style.display = 'block';
}

function showSuccess(message) {
  errorBox.textContent = message;
  errorBox.className = 'alert alert-success';
  errorBox.style.display = 'block';
}

function clearError() {
  errorBox.textContent = '';
  errorBox.className = 'alert';
  errorBox.style.display = 'none';
}

function handleAuthError(error) {
  let message = error.message;

  if (message.includes("User already registered")) {
    message = "An account with this email already exists.";
  } else if (message.includes("Password should be at least")) {
    message = "Password must be at least 6 characters.";
  } else if (message.includes("Invalid login credentials")) {
    message = "Incorrect email or password, or email not confirmed.";
  }

  showError(message);
  console.error("Auth error:", error);

}

async function logout() {
    await supabase.auth.signOut();
    localStorage.removeItem("userId");
    window.location.href = "se_connecter.html";

  } 