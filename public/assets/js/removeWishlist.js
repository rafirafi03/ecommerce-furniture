
document.querySelectorAll('.btn-remove').forEach(button => {
    button.addEventListener('click', async (event) => {
        const productId = event.currentTarget.getAttribute('data-product-id');

        Swal.fire({
            title : 'Are you sure?',
            text : 'You are about to remove this product from your wishlist',
            icon : 'warning',
            showCancelButton : true,
            confirmButtonColor : '#d33',
            cancelButtonColor : '#cc9966',
            confirmButtonText : 'Yes, remove it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`/wishlist/remove/${productId}`,{
                        method : 'DELETE',
                        headers : {
                            'Content-Type' : 'application/json'
                        }
                    })
                    if(response.ok) {
                        Swal.fire('Removed!', 'Your product has been removed from wishlist','success').then(()=>{
                            window.location.reload()
                        })
                    } else {
                        Swal.fire('Error!', 'Failed to remove product from wishlist','error')
                    }
                } catch (error) {
                    console.error('Error removing product from wishlist',error);
                    Swal.fire('Error!','Failed to remove product from wishlist', 'error')
                }
            }
        })
    })
})