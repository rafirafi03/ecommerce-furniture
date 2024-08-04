const form = document.getElementById("form");
const username = document.getElementById("username");
const email = document.getElementById("email");
const mobile = document.getElementById("mobile");
const password = document.getElementById("password");
const password2 = document.getElementById("password2");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  document.getElementById("errorName").innerText = "";
  document.getElementById("errorEmail").innerText = "";
  document.getElementById("errorMobile").innerText = "";
  document.getElementById("errorPassword").innerText = "";
  document.getElementById("errorConfirmPassword").innerText = "";
  const verified = validateInputs();
  if (verified === false) return;
  form.submit();
});

function validateInputs() {
  let isValid = true;

  const userName = document.getElementById("username").value;
  if (userName.trim() === "") {
    document.getElementById("errorName").innerText = "User name is required.";
    isValid = false;
  } else if(!userName.match(/^[a-zA-Z\s]+$/)) {
    document.getElementById("errorName").innerText = "User name is required.";
    isValid = false;
  }

  const email = document.getElementById("email").value;
  if (email.trim() === "" ) {
    document.getElementById("errorEmail").innerText = "Email is required.";
    isValid = false;
  }else if (!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
    document.getElementById("errorEmail").innerText = "Provide a valid email.";
    isValid = false;
}

  const mobile = document.getElementById("mobile").value;
  if (mobile.trim() === "") {
    document.getElementById("errorMobile").innerText =
      "Mobile number is required.";
    isValid = false;
  } else if (mobile.length < 10 || mobile.length > 10) {
    isValid = false;
    document.getElementById("errorMobile").innerText = "Invalid mobile number.";
  }

  const password = document.getElementById("password").value;
  if (password.trim() === "") {
    document.getElementById("errorPassword").innerText =
      "Password is required.";
    isValid = false;
  } else if (password.length < 8) {
    document.getElementById("errorPassword").innerText =
      "Atleast 8 charecters required.";
    isValid = false;
  }

  const confirmPassword = document.getElementById("confirmPassword").value;
  if (confirmPassword.trim() === "") {
    document.getElementById("errorConfirmPassword").innerText =
      "Confirm password is required.";
    isValid = false;
  } else if (confirmPassword != password) {
    document.getElementById("errorConfirmPassword").innerText =
      "Password doesn't match.";
    isValid = false;
  }
  return isValid;
}
