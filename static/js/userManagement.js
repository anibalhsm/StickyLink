window.onload = function() {
    loadUsers(); 
    setupEventListeners(); 
};

function loadUsers() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/get_users', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            renderUsers(JSON.parse(xhr.responseText));
        } else {
            console.error('Request failed. Returned status of ' + xhr.status);
        }
    };
    xhr.send();
}

function renderUsers(users) {
    var userList = document.getElementById('userList');
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
}

function setupEventListeners() {
    document.getElementById('checkoutButton').addEventListener('click', handleCheckout);
    document.getElementById('userInfoForm').addEventListener('submit', function(event) {
        event.preventDefault();
        updateUserInfo();
    });
}
function extractCartData() {
    const cartData = [];
    document.querySelectorAll('#shoppingCart li').forEach(item => {
        const productId = item.getAttribute('data-product-id');
        const quantityInput = item.querySelector('.quantity-input');
        const quantity = quantityInput ? parseInt(quantityInput.value, 10) : 0;
        if (!isNaN(quantity) && quantity > 0) {
            cartData.push({ productId, quantity });
        }
    });
    
    return cartData;
}


function handleCheckout(e) {
    e.preventDefault(); 
    const cartData = extractCartData();
    if (cartData.length > 0) {
        fetchCheckoutData(cartData);
    } else {
        alert('Your cart is empty. Please add items before proceeding to checkout.');
    }
}

function fetchCheckoutData(cartData) {
    // Debugging: Log the cart data to be sent
    console.log('Sending checkout data:', JSON.stringify({items: cartData}));

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
        console.error('Checkout failed:', error);
        alert('Checkout failed. Please try again.');
    });
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

function updateUserRole() {
    var form = document.getElementById('userForm');
    var username = form.elements['username'].value;
    var role = form.elements['role'].value;

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/change_role', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log('User role updated successfully');
            location.reload();
        } else {
            console.error('Request failed. Returned status of ' + xhr.status);
        }
    };

    xhr.send('username=' + encodeURIComponent(username) + '&role=' + encodeURIComponent(role));
}


document.getElementById('userForm').addEventListener('submit', function(event) {
    event.preventDefault();
    updateUserRole();
});



document.getElementById('userInfoForm').addEventListener('submit', function(event) {
    event.preventDefault();
    updateUserInfo();
});



