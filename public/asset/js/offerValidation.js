const form = document.getElementById('form');

form.addEventListener('submit',(e)=>{
    e.preventDefault();
    document.getElementById('error-name').innerText = "";
    document.getElementById('error-discount').innerText = "";
    document.getElementById('error-activationDate').innerText = "";
    document.getElementById('error-expiryDate').innerText = "";

    const verified = validateInputs();
    if (verified === false) return;
    form.submit();
})

function validateInputs(){
    let isValid = true;

    const name = document.getElementById('offerName').value;
    if (name.trim()==="") {
        document.getElementById('error-name').innerText = "Offer name required!!";
        let isValid = false
    }

    const discount = document.getElementById('discountPercentage').value;
    if (discount.trim()==="") {
        document.getElementById('error-discount').innerText = "Discount Percentage required!!";
        let isValid = false
    } else if (discount > 99 || discount <1) {
        document.getElementById('error-discount').innerText = "Percentage should be more than 1 and less than 99 !!";
        let isValid = false
    }

    const date = document.getElementById('activationDate').value;
    if (date.trim()==="") {
        document.getElementById('error-activationDate').innerText = "Date is required!!";
        let isValid = false
    }

    const expDate = document.getElementById('expiryDate').value;
    if (expDate.trim()==="") {
        document.getElementById('error-expiryDate').innerText = "Expiry date is required!!";
        let isValid = false
    }

    return isValid;
}