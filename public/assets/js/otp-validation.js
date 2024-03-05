
const form = document.getElementById("form");
const otp = document.getElementById("Otp");

form.addEventListener("submit", (e)=> {
    e.preventDefault();
    document.getElementById("otpError").innerText ="";
    const verified = validateInputs();
    if(verified === false) return;
    form.submit();
})

function validateInputs() {
    let isValid = true;

    const otp = document.getElementById("Otp").value;
    if (otp.trim()==="") {
        document.getElementById('otpError').innerText = "OTP is required.";
        isValid = false;
    } else if (otp.length<4){
        document.getElementById('otpError').innerText = 'Invalid OTP.';
        isValid = false;
    }

    return isValid;
}

let timeLeft = 30;
const timerElement = document.getElementById('timer');
const resend = document.getElementById('resend-otp');

function updateTimer() {
    // Add the following code for handling the resend action
resend.addEventListener('click', async () => {
  
    try {
      // Make a request to the server to resend OTP
      const response = await fetch('/resendOtp', { method: 'GET' });
      const data = await response.json();
  
      if (data.status === 'FAILED') {
        // Handle the error (display a message, log, etc.)
        console.error('Resend OTP failed:', data.message);
      } else {
        // Reset the timer and notify the user
        updateTimer();
        alert('OTP resent successfully!');
      }
    } catch (error) {
      console.error('Resend OTP failed:', error);
    }
  });
    if(timeLeft > 0) {
        resend.style.display = 'none';
        timeLeft--;
        timerElement.textContent = timeLeft + " " + 'Seconds' ;
        

    }
        else {
            timerElement.textContent = 'Expired';
            // Optionally, you can hide the OTP after expiration
            resend.style.display = 'block'
          }
    
}



setInterval(updateTimer, 1000);

// Your existing code...

// When sending OTP, store expiration time


// Function to get remaining time
function getRemainingTime() {
  const expirationTime = req.session.otpExpirationTime;
  if (!expirationTime) return 0; // If expiration time is not set, return 0
  return Math.max(0, Math.ceil((expirationTime - Date.now()) / 1000)); // Return remaining time in seconds
}

// When the page loads, check if OTP is still valid
window.addEventListener('load', function() {
  const remainingTime = getRemainingTime();
  if (remainingTime > 0) {
    // Start the timer with remaining time
    timeLeft = remainingTime;
    updateTimer();
  } else {
    // OTP has expired
    timerElement.textContent = 'Expired';
    resend.style.display = 'block';
  }
});
