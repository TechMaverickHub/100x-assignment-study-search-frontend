# StudySearch Frontend

StudySearch is a simple, learning-focused Retrieval-Augmented Generation (RAG) application built using **Google Gemini File Search**. The goal of this project is to deeply understand grounded retrieval—ensuring that all answers come strictly from the uploaded documents, with zero hallucinations.

This is the **React Frontend** for StudySearch, featuring separate dashboards for Users and Super Admins.

## 🚀 Features

### User Dashboard
- **Upload PDFs** and ingest them into Gemini File Search
- **Query documents** with full grounding
- **View citations** and source chunks
- **Personalization settings** (name, response tone)
- **RAGAS Evaluation** to assess system quality
- **Query history** for recent searches

### Super Admin Dashboard
- **System overview** with key metrics
- **View all document stores** across users
- **User management** (if backend supports it)
- **System status** monitoring

## 🛠 Tech Stack

- **React 18** with Vite
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API communication
- **Lucide React** for icons

## 📦 Installation

1. Install dependencies:
```bash
yarn install
```

2. Create a `.env` file (optional):
```env
VITE_API_BASE_URL=http://localhost:8000
```

3. Start the development server:
```bash
yarn dev
```

The app will be available at `http://localhost:3000`

## 🔌 API Integration

The frontend expects the following Django REST API endpoints:

### Core APIs
- `POST /api/filesearch/upload/` - Upload PDF
- `POST /api/filesearch/query/` - Query documents
- `GET /api/filesearch/stores/list/` - List user's stores

### Optional APIs (for full functionality)
- `POST /api/personalization/preferences/` - Save user preferences
- `GET /api/personalization/preferences/` - Get user preferences
- `POST /api/evaluation/ragas/` - Run RAGAS evaluation
- `GET /api/admin/stores/` - Get all stores (admin)
- `GET /api/admin/metrics/` - Get system metrics (admin)
- `GET /api/admin/users/` - Get all users (admin)

## 🎨 Project Structure

```
src/
├── components/       # Reusable components
│   ├── Layout.jsx   # Main layout with sidebar
│   └── ProtectedRoute.jsx
├── context/          # React context
│   └── AuthContext.jsx
├── pages/            # Page components
│   ├── Login.jsx
│   ├── UserDashboard.jsx
│   ├── AdminDashboard.jsx
│   ├── Settings.jsx
│   └── Evaluation.jsx
├── services/         # API services
│   └── api.js
├── App.jsx           # Main app component
├── main.jsx          # Entry point
└── index.css         # Global styles
```

## 🔐 Authentication

The app uses a simple demo authentication system. Users can log in with any username and select their role (User or Super Admin). In production, this should be replaced with proper authentication (JWT tokens, OAuth, etc.).

## 🚀 Building for Production

```bash
yarn build
```

The built files will be in the `dist/` directory.

## 📝 Notes

- The frontend includes graceful fallbacks for APIs that may not be implemented yet
- Mock data is shown when admin APIs are unavailable
- The evaluation page shows mock RAGAS results if the backend API isn't ready

## 🔗 Backend Integration

Make sure your Django backend is running on `http://localhost:8000` (or update the proxy in `vite.config.js`).

The frontend uses a proxy configuration to avoid CORS issues during development.

## 📄 License

MIT License

---

Feel free to fork, extend, or critique this project.  
Always open to learning from the community!
