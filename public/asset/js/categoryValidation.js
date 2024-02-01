const form = document.getElementById('form');

form.addEventListener('submit', (e)=> {
    e.preventDefault();
    document.getElementById("error-name").innerText = "";
    document.getElementById('error-description').innerText = "";
    const verified = validateInputs();
    if(verified === false) return;
    form.submit();
});

function validateInputs() {
    let isValid = true;

    const Name = document.getElementById('name').value;
    if(Name.trim() === "" ) {
        document.getElementById('error-name').innerText = "Category name required.";
        isValid = false;
    }

    const Description = document.getElementById('description').value;
    if (Description.trim()==="") {
        document.getElementById('error-description').innerText = "Description required.";
        isValid = false;
    }

    return isValid;
}