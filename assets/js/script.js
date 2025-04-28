// Custom JavaScript for Brain Food Society Website

// Ensure the DOM is fully loaded before running scripts
document.addEventListener('DOMContentLoaded', () => {
    console.log('Website script loaded.');

    // --- Blog Loading Script ---
    // This script fetches markdown files listed in posts/posts.json
    // converts them to HTML using marked.js (loaded via CDN in blog.html),
    // and displays them on the blog page.

    const blogPostsContainer = document.getElementById('blog-posts-container');

    // Only run the blog script on the blog page
    if (blogPostsContainer) {
        console.log('Blog page detected. Loading posts...');

        // Function to fetch and parse a single markdown file
        async function loadBlogPost(postFileName) {
            try {
                const response = await fetch(`posts/${postFileName}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const markdownText = await response.text();

                // Using marked.js to convert markdown to HTML
                // Ensure marked.js is loaded via a script tag in blog.html <head>
                const htmlContent = marked.parse(markdownText);

                // Extract title and potentially date from filename (example: YYYY-MM-DD-title.md)
                const fileNameParts = postFileName.replace('.md', '').split('-');
                let postTitle = postFileName.replace('.md', '');
                let postDate = 'No Date';

                if (fileNameParts.length > 3 && /^\d{4}-\d{2}-\d{2}$/.test(fileNameParts.slice(0, 3).join('-'))) {
                    postDate = `${fileNameParts[1]}/${fileNameParts[2]}/${fileNameParts[0]}`; // MM/DD/YYYY format
                    postTitle = fileNameParts.slice(3).join(' '); // Join remaining parts for title
                } else {
                    // If filename doesn't match YYYY-MM-DD format, just use filename as title
                     postTitle = postFileName.replace('.md', '').replace(/-/g, ' '); // Replace hyphens with spaces for title
                }

                return {
                    fileName: postFileName,
                    title: postTitle.charAt(0).toUpperCase() + postTitle.slice(1), // Capitalize first letter
                    date: postDate,
                    html: htmlContent
                };

            } catch (error) {
                console.error(`Could not load or parse post ${postFileName}:`, error);
                return null; // Return null for failed posts
            }
        }

        // Function to load the list of posts and then load each post
        async function loadBlogPosts() {
            try {
                // Fetch the list of posts from posts.json
                const response = await fetch('posts/posts.json');
                 if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const postsConfig = await response.json(); // Expecting { "files": ["post1.md", "post2.md", ...] }

                if (!postsConfig || !Array.isArray(postsConfig.files)) {
                     console.error('Invalid posts.json format. Expected { "files": [...] }');
                     blogPostsContainer.innerHTML = '<p>Error loading blog posts list.</p>';
                     return;
                }

                // Load all posts concurrently
                const postPromises = postsConfig.files.map(loadBlogPost);
                const loadedPosts = (await Promise.all(postPromises)).filter(post => post !== null); // Filter out failed loads

                // Sort posts (example: by date if filename format is YYYY-MM-DD)
                loadedPosts.sort((a, b) => {
                    // Assuming YYYY-MM-DD format allows direct string comparison for sorting
                     if (a.fileName < b.fileName) return 1; // Sort descending by filename (date)
                     if (a.fileName > b.fileName) return -1;
                     return 0;
                });


                // Display loaded posts
                if (loadedPosts.length === 0) {
                    blogPostsContainer.innerHTML = '<p>No blog posts found yet.</p>';
                } else {
                    blogPostsContainer.innerHTML = ''; // Clear loading message/placeholder
                    loadedPosts.forEach(post => {
                        const postElement = document.createElement('article');
                        postElement.classList.add('blog-post'); // Add CSS class for styling
                        postElement.innerHTML = `
                            <h3>${post.title}</h3>
                            <div class="meta">Posted on ${post.date}</div>
                            <div class="post-content">${post.html}</div>
                        `;
                         blogPostsContainer.appendChild(postElement);
                    });
                }

            } catch (error) {
                console.error('Error fetching posts list or loading posts:', error);
                 blogPostsContainer.innerHTML = '<p>Could not load blog posts.</p>';
            }
        }

        // Start loading blog posts when the page loads
        loadBlogPosts();
    }

    // --- Add other general interactions here if needed ---
    // Example: Smooth scrolling for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});
