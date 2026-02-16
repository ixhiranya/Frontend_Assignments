document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const pass = document.getElementById("password").value.trim();
  if (email === "" || pass === "") {
    alert("Please enter email and password");
    return;
  }
  if (!email.includes("@") || !email.includes(".") || email.indexOf("@") > email.lastIndexOf(".") || email.startsWith("@") || email.endsWith("@") || email.startsWith(".") || email.endsWith(".") || email.includes(" ")) {
    alert("Enter valid email");
    return;
  }
  if (pass.length < 4 || pass.length > 20 ) {
    alert("Password too short");
    return;
  }
  alert("Login successful");
});
