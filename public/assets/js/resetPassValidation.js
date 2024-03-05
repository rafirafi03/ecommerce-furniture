const form = document.getElementById('resetPassForm');

form.addEventListener("submit",(e)=> {
    e.preventDefault();
    document.getElementById('currentPassError').innerText = "";
    document.getElementById('newPassError').innerText = "";
    document.getElementById('confirmPassError').innerText = "";

    const verified = validateInputs();

    if(verified == false) return false;

    form.submit();

})

function validateInputs(){
    
    let isValid = true;


    const currPass = document.getElementById('currentPass').value;

    if (currPass.trim()==="") {
        document.getElementById('currentPassError').innerText = 'Current password required!!';
        isValid = false
    } else if(currPass.length < 8 || currPass.length > 8) {
        document.getElementById('currentPassError').innerText = "Invalid Password!!";
        isValid = false;
    }

    const newPass = document.getElementById('newPass').value;

    if (newPass.trim()==="") {
        document.getElementById('newPassError').innerText = "New password required!!";
        isValid = false;
    } else if (newPass.length < 8) {
        document.getElementById('newPassError').innerText = 'Password should include 8 characters!!';
        isValid = false;
    } else if (newPass.length > 12) {
        document.getElementById('newPassError').innerText = 'Password should be less than 12 characters!!';
        isValid = false;
    };
    

    const confirmPass = document.getElementById('confirmPass').value;

    if (confirmPass.trim() === "") {
        document.getElementById('confirmPassError').innerText = 'Confirm password required!!'
        isValid = false;
    } else if (confirmPass !== newPass) {
        document.getElementById('confirmPassError').innerText = "Password doesn't match!!";
        isValid = false;
    };

    return isValid
}