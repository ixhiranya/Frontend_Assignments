document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const pass = document.getElementById("password").value.trim();
  const remember = document.querySelector('input[type="checkbox"]').checked;
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
  let users=JSON.parse(localStorage.getItem("sv_users")) || [];
  const exisitingUser=users.find(u=>u.email===email);
  if(exisitingUser){
    if(exisitingUser.password===pass){
      alert("Login Successful!!");
      if(remember){
        localStorage.setItem("sv_current_user",email);
      }
    }else{
      alert("Wrong Password");
    }
  }else{
    users.push({email:email,password:pass});
    localStorage.setItem("sv_users",JSON.stringify(users));
    alert("New user registered and logged in..!!");
    if(remember){
      localStorage.setItem("sv_current_user",email);
    }
  }
});
