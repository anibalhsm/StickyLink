







window.onload = function() {
    // Create a new XMLHttpRequest object
    var xhr = new XMLHttpRequest();

    // Configure the request
    xhr.open('GET', '/get_users', true);

    // Set up what happens when the request is sent
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

    // Send the request
    xhr.send();
};

function deleteUser(username) {
    // Create a new XMLHttpRequest object
    var xhr = new XMLHttpRequest();

    // Configure the request
    xhr.open('DELETE', '/delete_user/' + encodeURIComponent(username), true);

    // Set up what happens when the request is sent
    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log('User deleted successfully');
            // Refresh the page
            location.reload();
        } else {
            console.error('Request failed. Returned status of ' + xhr.status);
        }
    };

    // Send the request
    xhr.send();
}
