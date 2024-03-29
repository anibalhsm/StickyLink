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
};

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

function resetPassword(username) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/reset_password/' + encodeURIComponent(username), true);

    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log('Password reset successfully');
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

function updateUserInfo() {
    var xhr = new XMLHttpRequest();
    var form = document.getElementById('userInfoForm');
    var formData = new FormData(form);

    xhr.open('POST', '/update_user_info', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log('User information updated successfully');
            location.reload(); // Reload the page to reflect changes
        } else {
            console.error('Request failed. Returned status of ' + xhr.status);
        }
    };

    var object = {};
    formData.forEach(function(value, key) {
        object[key] = value;
    });
    var json = JSON.stringify(object);

    xhr.send(json);
}

// Add event listener for the user info form submission
document.getElementById('userInfoForm').addEventListener('submit', function(event) {
    event.preventDefault();
    updateUserInfo();
});