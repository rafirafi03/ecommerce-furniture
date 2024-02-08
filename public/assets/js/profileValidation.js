const form = document.getElementById('editForm');

form.addEventListener('submit', (e)=> {
    e.preventDefault();
    document.getElementById('error-name').innerText = "";
    document.getElementById('error-mobile').innerText = "";
    const verified = validateInputs();
    if (verified === false) return;
    form.submit();
        
});

function validateInputs() {
    let isValid = true;

    const name = document.getElementById('userName').value;
    if (name.trim()==="") {
        document.getElementById('error-name').innerText = "Username is required.";
        isValid = false;
        
    }

    const mobile = document.getElementById('userMobile').value;
    if(mobile.trim()===""){
        document.getElementById('error-mobile').innerText = "Mobile is required.";
        isValid = false;
    }else if (mobile.length < 10 || mobile.length > 10) {
        isValid = false;
        document.getElementById("error-mobile").innerText = "Invalid mobile number.";
      }

    return isValid;
}