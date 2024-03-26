window.onload = function() {
    // Create a new XMLHttpRequest object
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
};

function updateUserRole() {
    var form = document.getElementById('userForm');
    var username = form.elements['username'].value;
    var role = form.elements['role'].value;

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/change_role', true); // Change PUT to POST

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

function resetPassword(username) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/reset_password/' + encodeURIComponent(username), true);

    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log('Password reset successfully');
            // Optionally, display a message to the user indicating success
        } else {
            console.error('Password reset failed. Returned status of ' + xhr.status);
            // Optionally, display an error message to the user
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
    event.preventDefault(); // Prevent default form submission
    updateUserRole(); // Call function to update user role
});