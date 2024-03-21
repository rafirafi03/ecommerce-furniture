
    
        function addToCart(id) {
            
            fetch('/addToCart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: id })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        title: 'Item added to Cart',
                        text: 'Do you want to see cart?',
                        icon: 'success',
                        confirmButtonText: 'Show Cart',
                        confirmButtonColor: '#cc9966',
                        showCancelButton: true,
                        cancelButtonColor: 'black',
                        timer: 2000,
                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.location.href = '/cart'; 
                        } 
                    });
                } else if (data.stock) {
                    Swal.fire({
                        title: 'Out of Stock',
                        text: 'Come again later',
                        icon: 'error',
                        confirmButtonText: 'Ok',
                        confirmButtonColor: '#1e6e2c',
                        timer: 2000,
                    });
                } else if (data.status){
                    Swal.fire({
                        icon: 'warning',
                        title: '<h5 style="color: black;">This product is already added to cart</h5>',
                        textColor: '#000000',
                        confirmButtonText: 'Show cart',
                        confirmButtonColor: '#cc9966',
                        showCancelButton: true,
                        cancelButtonColor: 'black'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            location.href = '/cart'
                        }
                    })

                } else if (data.failed) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Please Login',
                        confirmButtonText: 'Login',
                        confirmButtonColor: '#1e6e2c', // Adjusted color to match the Ajax code
                        showCancelButton: true,
                        cancelButtonColor: 'black'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            location.href = '/login';
                        }
                    })
                }
            })
            .catch(error => console.error('Error:', error))
        }
