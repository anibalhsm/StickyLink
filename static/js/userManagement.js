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
                userList.appendChild(userItem);
            });
        } else {
            console.error('Request failed. Returned status of ' + xhr.status);
        }
    };

    // Send the request
    xhr.send();
};
