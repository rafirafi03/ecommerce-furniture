
function addToWishlist(id) {

    fetch('/addToWishlist', {
        method: 'POST',
        headers : {
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify({id:id})
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            Swal.fire({
                title : 'Item added to wishlist',
                text : 'Do you want to see wishlist',
                icon : 'success',
                confirmButtonText : 'Show Wishlist',
                confirmButtonColor : '#cc9966',
                showCancelButton : true,
                cancelButtonColor : 'black',
                timer : 2000
            }).then((result)=>{
                if (result.isConfirmed) {
                    window.location.href = '/wishlist'
                }
            });
        } else if (data.status) {
            Swal.fire({
                icon : 'warning',
                title : '<h5 style="color: black;"> This product is already added to wishlist </h5>',
                confirmButtonText : 'show wishlist',
                confirmButtonColor : '#cc9966',
                showCancelButton : true ,
                cancelButtonColor : 'black'
            }).then((result)=> {
                if(result.isConfirmed) {
                    location.href = '/wishlist'
                }
            })
        } else if (data.failed) {
            Swal.fire({
                icon : 'warning',
                title : 'Please login',
                confirmButtonText : 'Login',
                confirmButtonColor : '#cc9966',
                showCancelButton : true,
                cancelButtonColor : 'black'
            }).then((result)=> {
                if(result.isConfirmed) {
                    location.href = '/login'
                }
            })
        }
    })
    .catch(error => console.error('Error:', error))
}