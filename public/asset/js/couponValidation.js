const form = document.getElementById('form');

form.addEventListener('submit',(e)=>{
    e.preventDefault();
    document.getElementById('error-name').innerText = "";
    document.getElementById('error-discount').innerText = "";
    document.getElementById('error-criteria').innerText = "";
    document.getElementById('error-activationDate').innerText = "";
    document.getElementById('error-expiryDate').innerText = "";

    const verified = validateInputs();
    if (verified === false) return;
    form.submit();
})

function validateInputs(){
    let isValid = true;

    const criteriaAmount = document.getElementById('criteriaAmount').value;

    const name = document.getElementById('couponName').value;
    if (name.trim()==="") {
        document.getElementById('error-name').innerText = "Coupon name required!!";
        let isValid = false
    }

    const discount = document.getElementById('discountAmount').value;
    if (discount.trim()==="") {
        document.getElementById('error-discount').innerText = "Discount amount required!!";
        let isValid = false
    } else if (discount >= criteriaAmount) {
      document.getElementById('error-discount').innerText = "Discount amount should be less than criteria!!";
      let isValid = false
    }
    
    if (criteriaAmount.trim()==="") {
        document.getElementById('error-criteria').innerText = "Criteria amount required!!";
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

    if (isValid) {
        try {
          const activationDateObj = new Date(date);
          const expiryDateObj = new Date(expDate);
      
          if (expiryDateObj < activationDateObj) {
            document.getElementById('error-expiryDate').innerText = "Expiry date cannot be before activation date!";
            isValid = false;
          }
        } catch (error) {
          // Handle invalid date format
          document.getElementById('error-expiryDate').innerText = "Invalid date format. Please use YYYY-MM-DD.";
          isValid = false;
        }
      }

    return isValid;
}