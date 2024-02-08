// Validation code for edit products!!!

const editForm = document.getElementById('editForm');

editForm.addEventListener('submit',(e)=> {
    e.preventDefault();

    document.getElementById('error-editName').innerText = "";
    document.getElementById('error-editQuantity').innerText = "";
    document.getElementById('error-editPrice').innerText = '';


    const verified = validateEditInputs();
    if(verified == false) return;
    editForm.submit();
})

function validateEditInputs(){
    let isValid = true;

    const name = document.getElementById('name').value;
    if(name.trim()=== ""){
        document.getElementById('error-editName').innerText = "Name is required.";
        isValid = false;
    }


    const Price = document.getElementById('price').value;
    if (Price.trim()==="") {
        document.getElementById('error-editPrice').innerText = "Price required.";
        isValid = false;
        
    }
    else if (Price <1) {
        document.getElementById('error-editPrice').innerText = "Price should be more than 0";
        isValid = false;  
    }

    const Quantity = document.getElementById('quantity').value;
    if (Quantity.trim()==="") {
        document.getElementById('error-editQuantity').innerText = "Quantity required."
        isValid = false;
        
    }
    else if(Quantity <1) {
        document.getElementById('error-editQuantity').innerText = "Quantity should be more than 0";
        isValid = false;
    }

    return isValid;
}