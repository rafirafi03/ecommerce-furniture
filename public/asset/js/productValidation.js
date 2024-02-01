const form = document.getElementById('form');

form.addEventListener('submit',(e)=>{
    e.preventDefault();
    document.getElementById('error-name').innerText = "";
    document.getElementById('error-quantity').innerText = "";
    document.getElementById('error-price').innerText = "";
    document.getElementById('error-category').innerText ="";
    const verified = validateInputs();
    if(verified == false) return;
    form.submit();
});

function validateInputs() {
    let isValid = true;

    const Name = document.getElementById('name').value;
    if(Name.trim()==""){
        document.getElementById('error-name').innerText = "Product Name is required.";
        isValid = false;
    }

    const Quantity = document.getElementById('quantity').value;
    if(Quantity.trim()=="") {
        document.getElementById('error-quantity').innerText = "Quantity required.";
        isValid = false;
    } else if (Quantity <= 0) {
        document.getElementById('error-quantity').innerText = "Quantity should be more than 0.";
        isValid = false;
    }

    const Price = document.getElementById('price').value;
    if(Price.trim()=="") {
        document.getElementById('error-price').innerText = 'Price required';
        isValid = false;
    } else if(Price < 0) {
        document.getElementById('error-price').innerText = 'Price should be more than 0';
        isValid = false;
    }

    const Category = document.getElementById('category').value;
    if(Category.trim()==""){
        document.getElementById('error-category').innerText = "Category required";
        isValid = false;
    }

    return isValid;
}