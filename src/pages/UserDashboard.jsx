import { useState, useEffect } from 'react';
import { fileSearchAPI } from '../services/api';
import { Upload, Search, FileText, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const UserDashboard = () => {
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState(null);
  const [citations, setCitations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [queryHistory, setQueryHistory] = useState([]);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      const data = await fileSearchAPI.listStores();
      setStores(data.stores || data || []);
      if (data.stores && data.stores.length > 0) {
        setSelectedStore(data.stores[0].name || data.stores[0].store_name);
      }
    } catch (error) {
      console.error('Error loading stores:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      setUploadStatus({ type: 'error', message: 'Please upload a PDF file' });
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);

    try {
      await fileSearchAPI.uploadPDF(file);
      setUploadStatus({ type: 'success', message: 'PDF uploaded and processed successfully!' });
      await loadStores();
      setTimeout(() => setUploadStatus(null), 5000);
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: error.response?.data?.detail || 'Failed to upload PDF',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleQuery = async (e) => {
    e.preventDefault();
    if (!query.trim() || !selectedStore) return;

    setIsLoading(true);
    setAnswer(null);
    setCitations([]);

    try {
      const response = await fileSearchAPI.query(query, selectedStore);
      
      setAnswer(response.answer || response.response || 'No answer found');
      setCitations(response.citations || response.retrieved_context || []);
      
      // Add to query history
      setQueryHistory((prev) => [
        { query, answer: response.answer || response.response, timestamp: new Date() },
        ...prev.slice(0, 9),
      ]);
    } catch (error) {
      setAnswer('Error: ' + (error.response?.data?.detail || 'Failed to process query'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Dashboard</h1>
        <p className="text-gray-600 mt-2">Upload PDFs and query your lecture materials</p>
      </div>

      {/* Upload Section */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Upload className="h-5 w-5 mr-2" />
          Upload PDF
        </h2>
        <div className="space-y-4">
          <label className="block">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
              id="pdf-upload"
            />
            <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
              {isUploading ? (
                <div className="flex items-center space-x-2 text-primary-600">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Uploading and processing...</span>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <span className="text-gray-600">Click to upload PDF</span>
                </div>
              )}
            </div>
          </label>

          {uploadStatus && (
            <div
              className={`flex items-center space-x-2 p-3 rounded-lg ${
                uploadStatus.type === 'success'
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-800'
              }`}
            >
              {uploadStatus.type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span>{uploadStatus.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stores Selection */}
      {stores.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Select Document
          </h2>
          <select
            value={selectedStore || ''}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="input-field"
          >
            {stores.map((store, idx) => (
              <option key={idx} value={store.name || store.store_name || store}>
                {store.name || store.store_name || store}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Query Section */}
      {selectedStore && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Ask a Question
          </h2>
          <form onSubmit={handleQuery} className="space-y-4">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your question about the document..."
              className="input-field min-h-[100px] resize-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing...
                </span>
              ) : (
                'Search'
              )}
            </button>
          </form>
        </div>
      )}

      {/* Answer Section */}
      {answer && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Answer</h2>
          <div className="prose max-w-none">
            <p className="text-gray-800 whitespace-pre-wrap">{answer}</p>
          </div>

          {/* Citations */}
          {citations.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-3">Sources</h3>
              <div className="space-y-3">
                {citations.map((citation, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                  >
                    <p className="text-sm text-gray-700">
                      {citation.text || citation.content || JSON.stringify(citation)}
                    </p>
                    {citation.page && (
                      <p className="text-xs text-gray-500 mt-2">Page: {citation.page}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Query History */}
      {queryHistory.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Recent Queries</h2>
          <div className="space-y-3">
            {queryHistory.map((item, idx) => (
              <div key={idx} className="border-l-4 border-primary-500 pl-4 py-2">
                <p className="font-medium text-gray-900">{item.query}</p>
                <p className="text-sm text-gray-600 mt-1">{item.answer}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {item.timestamp.toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;

