
const supabaseUrl = "https://qjbzocrygwczpuslbpbh.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqYnpvY3J5Z3djenB1c2xicGJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MjUyMjksImV4cCI6MjA2MTUwMTIyOX0.b2zV3ZT3SMVs6I_wTn4QKgQzY9y3NgqcliIpLp_Ef9I";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

const signup_form = document.getElementById("signup-form");
const login_form = document.getElementById("login-form");
const errorBox = document.getElementById("error");

if (signup_form) {
  signup_form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          username: username,
          name: name,
        },
      },
    });

    if (error) {
      errorBox.classList.add("alert", "alert-danger");
      errorBox.textContent = error.message;
    } else {
      errorBox.classList.add("alert", "alert-success");
      errorBox.textContent = "✅ Check your email to confirm registration.";
      signup_form.reset();
    }
  });
}

if (login_form) {
  login_form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value; 
    const password = document.getElementById("password").value;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      errorBox.classList.add("alert", "alert-danger");
      errorBox.textContent = error.message;
      console.log(error.message)
    } else {
      window.location.href = "accueil.html";
      console.log(error.message)
    }
  });
}
else{

    async function checkAuth() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          window.location.href = "se_connecter.html";
        } else {
          document.body.style.display = "block";
        }
      }
      checkAuth();
}