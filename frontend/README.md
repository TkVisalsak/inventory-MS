# Inventory Management System

A comprehensive inventory management system built with HTML, CSS, and JavaScript.

## Features

- 📊 **Dashboard** - Overview of inventory status and key metrics
- 📦 **Products** - Manage product catalog with search and filters
- 🏷️ **Categories** - Organize products by categories
- 📋 **Inventory** - Track stock levels and valuations
- 🔄 **Stock Movements** - Monitor all inventory transactions
- 👥 **Customers** - Manage customer relationships
- 📊 **Analytics** - Business insights and performance metrics
- 📄 **Reports** - Generate comprehensive reports
- 👤 **User Management** - Control user access and permissions
- ⚙️ **Admin Panel** - System configuration and maintenance

## Deployment

### Vercel (Recommended)

1. Fork this repository
2. Connect your GitHub account to Vercel
3. Import the project
4. Deploy automatically

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/inventory-management-system)

### Render

1. Fork this repository
2. Connect your GitHub account to Render
3. Create a new Static Site
4. Set build command: `echo "No build required"`
5. Set publish directory: `.`

### Netlify

1. Fork this repository
2. Connect to Netlify
3. Set build command: `# No build required`
4. Set publish directory: `.`

### Docker

\`\`\`bash
# Build the image
docker build -t inventory-management .

# Run the container
docker run -p 8080:80 inventory-management
\`\`\`

## Local Development

### Option 1: Simple HTTP Server (Python)
\`\`\`bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
\`\`\`

### Option 2: Node.js serve
\`\`\`bash
npm install -g serve
serve -s . -l 3000
\`\`\`

### Option 3: Live Server (VS Code Extension)
Install the "Live Server" extension and right-click on `index.html` → "Open with Live Server"

## File Structure

\`\`\`
inventory-management-system/
├── index.html              # Main application entry point
├── css/
│   ├── style.css          # Base styles and components
│   ├── dashboard.css      # Dashboard-specific styles
│   └── pages.css          # Page-specific styles
├── js/
│   ├── main.js            # Application router and navigation
│   ├── utils.js           # Utility functions
│   ├── modals.js          # Modal management
│   └── pages/             # Page-specific JavaScript modules
│       ├── dashboard.js
│       ├── products.js
│       ├── categories.js
│       └── ...
├── pages/                 # HTML page templates
│   ├── dashboard.html
│   ├── products.html
│   ├── categories.html
│   └── ...
└── deployment files
\`\`\`

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with Flexbox and Grid
- **JavaScript ES6+** - Modern JavaScript features
- **Font Awesome** - Icons
- **No frameworks** - Pure vanilla JavaScript for maximum performance

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
