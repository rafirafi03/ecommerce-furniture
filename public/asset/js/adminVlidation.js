const form = document.getElementById('form');
const email = document.getElementById('email');
const password = document.getElementById('password');

form.addEventListener('submit',(e)=> {
    e.preventDefault();

    document.getElementById('errorEmail').innerText = "";
    document.getElementById('errorPassword').innerText = "";

    const verified = validateInputs();
    if(verified === false) return;
    form.submit();
    
})

function validateInputs() {
    let isValid = true;

    const email = document.getElementById("email").value;
    if(email.trim()===""){
        document.getElementById("errorEmail").innerText = "Email is required."
        isValid = false;
    }else if(!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)){
        document.getElementById('errorEmail').innerText = 'Provide valid email.';
        isValid = false;
    }


    const password = document.getElementById('password').value;
    if(password.trim()==="") {
        document.getElementById('errorPassword').innerText = "Password required.";
        isValid = false;
    } else if (password.length < 8 ) {
        document.getElementById('errorPassword').innerText = 'Invalid Password.';
        isValid = false;
    }

    return isValid;
}