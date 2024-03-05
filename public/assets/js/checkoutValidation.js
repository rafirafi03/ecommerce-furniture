const addressForm = document.getElementById('checkoutAddress');

addressForm.addEventListener('submit',(e)=> {
    e.preventDefault();
    document.getElementById('fullnameError').innerText = '';
    document.getElementById('addressError').innerText = '';
    document.getElementById('emailError').innerText = '';
    document.getElementById('mobileError').innerText = '';
    document.getElementById('countryError').innerText = '';
    document.getElementById('stateError').innerText = '';
    document.getElementById('districtError').innerText = '';
    document.getElementById('pincodeError').innerText = '';

    const verified = validateInputs();

    if (verified === true) return;
    addressForm.submit();

})

function validateInputs() {
    let isValid = true;
    
    const fullName = document.getElementById('fullName').value;
    if (fullName.trim()==='') {
        document.getElementById('fullnameError').innerText = 'Fullname is required!!';
        isValid = false;
    } else if (fullName.length < 3) {
        document.getElementById('fullnameError').innerText = 'Atleast 3 characters required!!';
        isValid = false;
    }

    const address = document.getElementById('address').value;
    if (address.trim()==='') {
        document.getElementById('addressError').innerText = 'Address required!!';
        isValid = false;
    } else if (address.length < 6) {
        document.getElementById('addressError').innerText = 'Atleast 6 characters needed!!'
        isValid = false
    }

    const email = document.getElementById('email').value;
    if (email.trim()==='') {
        document.getElementById('emailError').innerText = 'Email is required!!';
        isValid = false;
    } else if (!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
        document.getElementById("emailError").innerText =
          "Provide a valid email.";
        isValid = false;
      }

    const mobile = document.getElementById('mobile').value;
    if (mobile.trim()==='') {
        document.getElementById('mobileError').innerText = 'Mobile required!!';
        isValid = false;
    } else if (mobile.length < 10 && mobile.length > 10) {
        document.getElementById('addressError').innerText = 'Invalid mobile !!'
        isValid = false
    }

    const country = document.getElementById('country').value;
    if (country.trim()==='') {
        document.getElementById('countryError').innerText = 'country Name is required!!';
        isValid = false;
    }

    const state = document.getElementById('state').value;
    if (state.trim()==='') {
        document.getElementById('stateError').innerText = 'State name required!!';
        isValid = false;
    }

    const district = document.getElementById('district').value;
    if (district.trim()==='') {
        document.getElementById('districtError').innerText = 'District name is required!!';
        isValid = false;
    }

    const pincode = document.getElementById('pincode').value;
    if (pincode.trim()==='') {
        document.getElementById('pincodeError').innerText = 'Pincode required!!';
        isValid = false;
    }

    return isValid;
}