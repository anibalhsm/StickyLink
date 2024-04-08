window.onload = function() {
    var xhr = new XMLHttpRequest();

    xhr.open('GET', '/get_users', true);

    xhr.onload = function() {
        if (xhr.status === 200) {
            var userList = document.getElementById('userList');
            var users = JSON.parse(xhr.responseText);
            users.forEach(function(user) {
                var userItem = document.createElement('div');
                userItem.textContent = 'Username: ' + user.username + ', Role: ' + user.role;

                var deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', function() {
                    deleteUser(user.username);
                });

                userItem.appendChild(deleteButton);
                userList.appendChild(userItem);
            });
        } else {
            console.error('Request failed. Returned status of ' + xhr.status);
        }
    };

    xhr.send();


    document.getElementById('checkoutButton').addEventListener('click', function(e) {
        e.preventDefault(); // Prevent form submission which does not include JSON body
        const cartData = extractCartData();
        if (cartData.length > 0) {
            console.log(JSON.stringify({items: cartData}));
            fetch('/checkout', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({items: cartData}),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Checkout failed with status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Checkout successful', data);
                alert('Checkout successful!');
            })
            .catch(error => {
                console.error(error);
                alert('Checkout failed. Please try again.');
            });
        } else {
            alert('Your cart is empty. Please add items before proceeding to checkout.');
        }
    });
    
    function extractCartData() {
        const cartData = [];
        document.querySelectorAll('#shoppingCart li').forEach(item => {
            const productId = item.getAttribute('data-product-id');  // Correctly capturing the product ID
            const quantityInput = item.querySelector('.quantity-input'); // Finding the quantity input for this item
            const quantity = quantityInput ? parseInt(quantityInput.value, 10) : 0; // Parsing its value to an integer, defaulting to 0 if not found
            if (!isNaN(quantity) && quantity > 0) { // Ensure quantity is a valid number greater than 0
                cartData.push({ productId, quantity }); // Pushing an object with productId and quantity
            }
        });
        return cartData;
    }

    function updateUserInfo() {
        var form = document.getElementById('userInfoForm');
        var formData = new FormData(form);
    
        var object = {};
        formData.forEach((value, key) => object[key] = value);
        var json = JSON.stringify(object);
    
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/update_user_info', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
    
        xhr.onload = function() {
            if (xhr.status === 200) {
                console.log('User information updated successfully');
                location.reload();
            } else {
                console.error('Request failed. Returned status of ' + xhr.status);
            }
        };
    
        xhr.send(json);
    }    

function resetPassword(username) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/reset_password/' + encodeURIComponent(username), true);

    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log('Password reset successfully');
        } else {
            console.error('Password reset failed. Returned status of ' + xhr.status);
        }
    };

    xhr.send();
}

function deleteUser(username) {
    var xhr = new XMLHttpRequest();

    xhr.open('DELETE', '/delete_user/' + encodeURIComponent(username), true);

    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log('User deleted successfully');
            location.reload();
        } else {
            console.error('Request failed. Returned status of ' + xhr.status);
        }
    };

    xhr.send();
}

document.getElementById('userForm').addEventListener('submit', function(event) {
    event.preventDefault();
    updateUserRole();
});



document.getElementById('userInfoForm').addEventListener('submit', function(event) {
    event.preventDefault();
    updateUserInfo();
});

}

