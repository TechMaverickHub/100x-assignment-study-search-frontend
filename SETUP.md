# Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   yarn install
   ```

2. **Configure Environment (Optional)**
   Create a `.env` file:
   ```
   VITE_API_BASE_URL=http://localhost:8000
   ```

3. **Start Development Server**
   ```bash
   yarn dev
   ```

4. **Access the Application**
   - Open `http://localhost:3000` in your browser
   - Login with any username
   - Select "User" or "Super Admin" role

## Backend Requirements

Make sure your Django backend is running and accessible at the configured API URL (default: `http://localhost:8000`).

### Required Endpoints
- `POST /api/filesearch/upload/` - PDF upload
- `POST /api/filesearch/query/` - Query documents
- `GET /api/filesearch/stores/list/` - List stores

### Optional Endpoints (for full features)
- Personalization APIs
- Evaluation/RAGAS APIs
- Admin APIs

## Features Overview

### User Dashboard
- Upload PDF documents
- Query uploaded documents
- View answers with citations
- Personalization settings
- RAGAS evaluation

### Super Admin Dashboard
- System metrics overview
- View all document stores
- User management (if backend supports)
- System status monitoring

## Troubleshooting

### CORS Issues
The Vite dev server includes a proxy configuration. If you encounter CORS issues:
1. Check that `vite.config.js` has the correct proxy target
2. Ensure your Django backend allows CORS from `http://localhost:3000`

### API Connection Issues
1. Verify your backend is running
2. Check the API base URL in `.env` or `vite.config.js`
3. Check browser console for detailed error messages

### Build Issues
```bash
yarn build
```
Check the `dist/` folder for built files.

