const form = document.getElementById("form");
const email = document.getElementById("login-email");
const password = document.getElementById("login-password");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  document.getElementById("loginEmailError").innerText = "";
  document.getElementById("loginPasswordError").innerText = "";

  const verified = validateInputs();
  if (verified === false) return;
  form.submit();
});

function validateInputs() {
  let isValid = true;

  const loginEmail = document.getElementById("login-email").value;
  if (loginEmail.trim() === "") {
    document.getElementById("loginEmailError").innerText = "Email is required";
    isValid = false;
  } else if (
    !loginEmail.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
  ) {
    document.getElementById("loginEmailError").innerText =
      "Provide a valid email.";
    isValid = false;
  }

  const loginPassword = document.getElementById("login-password").value;
  if (loginPassword.trim() === "") {
    document.getElementById("loginPasswordError").innerText =
      "Password is required";
    isValid = false;
  } else if (loginPassword.length < 8) {
    document.getElementById("loginPasswordError").innerText =
      "Incorrect password";
    isValid = false;
  }

  return isValid;
}
