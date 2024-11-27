document.addEventListener('DOMContentLoaded', () => {
  fetch('http://localhost:3000/posts')
    .then(response => response.json())
    .then(posts => {
      const postsContainer = document.getElementById('posts-container');
      if (postsContainer) {
        posts.forEach(post => {

          // Append post with updated column info
          postsContainer.innerHTML += `
            <div class="post" data-id="${post.id}">
              <div class="status-box">${post.status}</div>
              
              <h3>${post.title}</h3>
              <p>${post.description}</p>
              
              <small class="location-contact">Location: ${post.location} | Contact: ${post.contact_info}</small>
              
              <button class="delete-btn" data-id="${post.id}">Delete</button>
            </div>
          `;
        });

        // Attach event listeners for delete buttons
        const deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach(button => {
          button.addEventListener('click', (e) => {
            const postId = e.target.dataset.id;
            deletePost(postId);
          });
        });
      }
    });
});

// Function to delete a post
// Function to delete a post
function deletePost(postId) {
  console.log(`Sending DELETE request for post ID: ${postId}`); // Log the ID you're sending
  fetch(`http://localhost:3000/posts/${postId}`, {
    method: 'DELETE',
  })
    .then(response => {
      console.log('Response Status:', response.status); // Log the response status
      if (response.ok) {
        alert('Post deleted successfully!');
        // Remove the post from the UI
        const postElement = document.querySelector(`.post[data-id="${postId}"]`);
        if (postElement) {
          postElement.remove();  // Remove the post element from the DOM
        }
      } else {
        alert('Error deleting post. Please try again.');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error deleting post.');
    });
}

// Handle form submission in add-post.html
document.getElementById('postForm')?.addEventListener('submit', function (e) {
  e.preventDefault();

  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const location = document.getElementById('location').value;
  const contact_info = document.getElementById('contact_info').value;
  const status= document.getElementById('status').value;

  fetch('http://localhost:3000/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, location, contact_info,status }),
  })
    .then(response => response.json())
    .then(post => alert('Post added successfully!'))
    .catch(() => alert('Error adding post.'));
});
