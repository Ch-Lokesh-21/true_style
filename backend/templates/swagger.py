html="""

    <!DOCTYPE html>
    <html>
    <head>
        <link type="text/css" rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
        <link rel="shortcut icon" href="https://fastapi.tiangolo.com/img/favicon.png">
        <title>True Style - FastAPI Backend</title>
    </head>
    <body>
        <div id="swagger-ui"></div>
        <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>

        <script>
        const ui = SwaggerUIBundle({
            url: '/openapi.json',
            dom_id: '#swagger-ui',
            layout: 'BaseLayout',
            deepLinking: true,
            showExtensions: true,
            showCommonExtensions: true,
            presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIBundle.SwaggerUIStandalonePreset
            ],
            onComplete: () => {
                // Wait for DOM to be ready
                const authButton = document.querySelector('.btn.authorize.unlocked');

  
    
    // Wait a short time in case the modal content loads dynamically
    setInterval(() => {
      
      const modal = document.querySelector('.modal-ux'); // or use your modal selector
modal.querySelectorAll('*').forEach(el => {
  el.childNodes.forEach(node => {
    if (node.nodeType === 3) {
      const text = node.textContent.trim();
      if (text.includes('username')) {
        node.textContent = text.replace(/username/gi, 'Email');
      }
      if (text.includes('password')) {
        node.textContent = text.replace(/password/gi, 'Password');
      }
    }  
  });
});
    }, 1000);
                setTimeout(() => {
                    const authWrapper = document.querySelector('.auth-wrapper');
                    if (authWrapper) {
                        const dropdown = document.createElement('select');
                        dropdown.style.marginRight = '10px';
                        dropdown.innerHTML = `
                            <option value="">Show All</option>
                            <option value="Root">Root</option>
                            <option value="Auth">Auth</option>
                            <option value="Users">Users</option>
                            <option value="Content">Content</option>
                            <option value="Utility">Utility</option>
                            <option value="Wishlists">Wishlists</option>
                            <option value="Carts">Carts</option>
                            <option value="Products">Products</option>
                            <option value="Orders">Orders</option>
                            <option value="Returns">Returns</option>
                            <option value="Exchanges">Exchanges</option>
                            <option value="Reviews">Reviews</option>
                            <option value="Ratings">Ratings</option>
                            <option value="Backup">Backup</option>
                            <option value="Restore">Restore</option>
                            <option value="Files">Files</option>
                            <option value="Coupons">Coupons</option>
                            <option value="Payments">Payments</option>
                            <option value="Logs">Logs</option>
                            <option value="Contact Us">Contact Us</option>
                            <option value="Dashboard">Dashboard</option>

                        `;

                        
                        dropdown.style.zIndex = '9999';
                        dropdown.style.padding = '8px';
                        dropdown.style.backgroundColor = '#f5f5f5';
                        dropdown.style.border = '1px solid #ccc';
                        dropdown.style.borderRadius = '4px';
                        dropdown.style.cursor = 'pointer';
                        dropdown.style.marginRight = '10px';


                        dropdown.onchange = function() {
                            const tag = this.value;
                            document.querySelectorAll('.opblock-tag-section').forEach(sec => {
                                const tagName = sec.querySelector('.opblock-tag').textContent.trim();
                                if (!tag || tagName === tag) {
                                    sec.style.display = '';
                                } else {
                                    sec.style.display = 'none';
                                }
                            });
                        };

                        // Insert dropdown before the auth button
                        authWrapper.parentNode.insertBefore(dropdown, authWrapper);
                    }
                }, 100); // Small delay to ensure Swagger UI renders
            }
        });
        </script>
    </body>
    </html>
"""