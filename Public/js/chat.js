const socket = io();
const form = document.getElementById('form');
const input = document.getElementById('text');
const currentTime = new Date().toLocaleTimeString();
const Friend = document.getElementById('messages1');
const searchInput = document.getElementById('search');
const searchButton = document.getElementById('searchButton');
const resultContainer = document.getElementById('messages');

// Function to display error messages
const displayErrorMessage = (message) => {
    const errorMessage = document.createElement('p');
    errorMessage.textContent = message;
    resultContainer.appendChild(errorMessage);
};

const displayUserProfile = (data) => {
    const profileImagePath = data.profileImage;
    const imageUrl = window.location.origin + '/uploads/' + profileImagePath;

    const profileContainer = document.createElement('div');
    profileContainer.classList.add('profile-container');
    profileContainer.innerHTML = `
        <img src="${imageUrl}" alt="${data.username}'s profile" class="profile-image" onerror="this.onerror=null; this.src='placeholder.png';">
        <p class="profile-name">${data.username}</p>
    `;
    resultContainer.appendChild(profileContainer);

    // Event listener for clicking on the profile container
    profileContainer.addEventListener('click', () => {
        localStorage.setItem('UserData', JSON.stringify(data)); // Store user data in local storage

        const avatar = document.querySelector('.avatar');
        avatar.src = imageUrl; // Update user profile image in header when profile container is clicked

        // Directly update the profile name text content
        document.querySelector('.profile-Name').textContent = data.username;
    });
};
// Event listener for search button click
searchButton.addEventListener('click', () => {
    const username = searchInput.value.trim();
    fetch(`/search?username=${username}`)
        .then(response => {
            if (!response.ok) {
                displayErrorMessage('User not found');
                return;
            }
            return response.json();
        })
        .then(data => {
            // Display user profile
            displayUserProfile(data);

            // Store user data in local storage
            let userData = JSON.parse(localStorage.getItem('Users')) || [];
            userData.push(data);
            localStorage.setItem('Users', JSON.stringify(userData));

            // Save data to db.json (Assuming this step is implemented)
            fetch('/saveToDb', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
        })
        .catch(error => {
            console.error('Error searching for user:', error);
            displayErrorMessage('Error searching for user');
        });
});
// checking if the user is found in the local storage
document.addEventListener('DOMContentLoaded', () => {
    const storedUsers = JSON.parse(localStorage.getItem('Users')) || [];
    storedUsers.forEach(user => {
        displayUserProfile(user);
    });
});

// Event listener for form submission
form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat message', input.value);
        input.value = '';
    }
});

// Socket event listeners and handlers
socket.on('chat message', (msg) => {
    // Handle chat message display
});

socket.on('user-connected', name => {
    // Handle user connection event
});

socket.on('userDisconnected', name => {
    // Handle user disconnection event
});

// Additional socket event handlers and functions
// ...

// Handle typing events
input.addEventListener('keyup', handleTyping);

