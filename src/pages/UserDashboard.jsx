import { useState, useEffect } from 'react';
import { fileSearchAPI } from '../services/api';
import { Upload, Search, FileText, Loader2, AlertCircle, CheckCircle, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

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
  const [uploadTitle, setUploadTitle] = useState('');
  
  // Pagination and filtering state for stores list
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [titleFilter, setTitleFilter] = useState('');
  const [isLoadingStores, setIsLoadingStores] = useState(false);

  // Document dropdown state (for query selection)
  const [documentOptions, setDocumentOptions] = useState([]);
  const [documentFilter, setDocumentFilter] = useState('');
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);

  useEffect(() => {
    loadStores();
  }, [currentPage, titleFilter]);

  // Load documents for dropdown (separate from stores list)
  useEffect(() => {
    loadDocumentOptions();
  }, [documentFilter]);

  const loadDocumentOptions = async () => {
    setIsLoadingDocuments(true);
    try {
      const data = await fileSearchAPI.listStoresFiltered(1, 5, documentFilter);
      const documents = data.results || [];
      setDocumentOptions(documents);
      
      // Auto-select first document if available and none selected
      if (documents.length > 0 && !selectedDocumentId) {
        setSelectedDocumentId(documents[0].id);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocumentOptions([]);
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const loadStores = async () => {
    setIsLoadingStores(true);
    try {
      const data = await fileSearchAPI.listStoresFiltered(currentPage, pageSize, titleFilter);
      const storesList = data.results || [];
      setStores(storesList);
      setTotalCount(data.count || 0);
      setHasNext(data.next !== null);
      setHasPrevious(data.previous !== null);
      
      // Auto-select first store if available and none selected
      if (storesList.length > 0 && !selectedStore) {
        setSelectedStore(storesList[0].id);
      }
    } catch (error) {
      console.error('Error loading stores:', error);
      setStores([]);
    } finally {
      setIsLoadingStores(false);
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
      const response = await fileSearchAPI.uploadPDF(file, uploadTitle);
      setUploadStatus({ 
        type: 'success', 
        message: response.message || 'PDF uploaded and processed successfully!' 
      });
      setUploadTitle(''); // Reset title after successful upload
      e.target.value = ''; // Reset file input
      // Reset to first page and reload stores
      setCurrentPage(1);
      await loadStores();
      // Also reload document options for dropdown
      await loadDocumentOptions();
      setTimeout(() => setUploadStatus(null), 5000);
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: error.response?.data?.message || error.response?.data?.detail || 'Failed to upload PDF',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleQuery = async (e) => {
    e.preventDefault();
    if (!query.trim() || !selectedDocumentId) return;

    setIsLoading(true);
    setAnswer(null);
    setCitations([]);

    try {
      const response = await fileSearchAPI.query(query, selectedDocumentId);
      
      // Handle new response structure
      const responseData = response.results || response;
      setAnswer(responseData.response_text || responseData.answer || responseData.response || 'No answer found');
      setCitations(responseData.grounding_chunks || responseData.citations || responseData.retrieved_context || []);
      
      // Add to query history
      setQueryHistory((prev) => [
        { 
          query, 
          answer: responseData.response_text || responseData.answer || responseData.response, 
          timestamp: new Date() 
        },
        ...prev.slice(0, 9),
      ]);
    } catch (error) {
      setAnswer('Error: ' + (error.response?.data?.detail || error.response?.data?.message || 'Failed to process query'));
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
          {/* Title Input */}
          <div>
            <label htmlFor="upload-title" className="block text-sm font-medium text-gray-700 mb-2">
              Document Title (optional)
            </label>
            <input
              id="upload-title"
              type="text"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              placeholder="Enter a title for this document..."
              className="input-field"
              disabled={isUploading}
            />
            <p className="text-xs text-gray-500 mt-1">
              If left empty, the filename will be used as the title
            </p>
          </div>

          {/* File Upload */}
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

      {/* Stores Selection with Pagination and Filter */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Documents ({totalCount})
          </h2>
        </div>

        {/* Title Filter */}
        <div className="mb-4">
          <label htmlFor="title-filter" className="block text-sm font-medium text-gray-700 mb-2">
            <Filter className="h-4 w-4 inline mr-1" />
            Filter by Title
          </label>
          <div className="flex space-x-2">
            <input
              id="title-filter"
              type="text"
              value={titleFilter}
              onChange={(e) => {
                setTitleFilter(e.target.value);
                setCurrentPage(1); // Reset to first page when filtering
              }}
              placeholder="Search by title..."
              className="input-field flex-1"
            />
            {titleFilter && (
              <button
                onClick={() => {
                  setTitleFilter('');
                  setCurrentPage(1);
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoadingStores ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary-600 mr-2" />
            <span className="text-gray-600">Loading documents...</span>
          </div>
        ) : stores.length > 0 ? (
          <>
            {/* Stores List */}
            <div className="space-y-2 mb-4">
              {stores.map((store) => (
                <div
                  key={store.id}
                  onClick={() => setSelectedStore(store.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedStore === store.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{store.title}</p>
                        <p className="text-xs text-gray-500">ID: {store.id}</p>
                      </div>
                    </div>
                    {selectedStore === store.id && (
                      <CheckCircle className="h-5 w-5 text-primary-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {stores.length} of {totalCount} documents
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={!hasPrevious || isLoadingStores}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  Page {currentPage}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={!hasNext || isLoadingStores}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>{titleFilter ? 'No documents found matching your filter.' : 'No documents uploaded yet.'}</p>
          </div>
        )}
      </div>

      {/* Query Section */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Search className="h-5 w-5 mr-2" />
          Ask a Question
        </h2>
        <form onSubmit={handleQuery} className="space-y-4">
          {/* Document Selection Dropdown with Filter */}
          <div>
            <label htmlFor="document-select" className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="h-4 w-4 inline mr-1" />
              Select Document
            </label>
            
            {/* Document Filter Input */}
            <div className="mb-2">
              <input
                type="text"
                value={documentFilter}
                onChange={(e) => setDocumentFilter(e.target.value)}
                placeholder="Filter documents by title..."
                className="input-field text-sm"
                disabled={isLoadingDocuments}
              />
            </div>

            {/* Document Dropdown */}
            {isLoadingDocuments ? (
              <div className="flex items-center space-x-2 py-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
                <span className="text-sm text-gray-600">Loading documents...</span>
              </div>
            ) : (
              <select
                id="document-select"
                value={selectedDocumentId || ''}
                onChange={(e) => setSelectedDocumentId(Number(e.target.value))}
                className="input-field"
                disabled={isLoading || documentOptions.length === 0}
              >
                <option value="">Select a document...</option>
                {documentOptions.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.title}
                  </option>
                ))}
              </select>
            )}
            
            {documentOptions.length === 0 && !isLoadingDocuments && (
              <p className="text-xs text-gray-500 mt-1">
                {documentFilter ? 'No documents found matching your filter.' : 'No documents available. Upload a PDF first.'}
              </p>
            )}
          </div>

          {/* Query Input */}
          <div>
            <label htmlFor="query-input" className="block text-sm font-medium text-gray-700 mb-2">
              Your Question
            </label>
            <textarea
              id="query-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your question about the document..."
              className="input-field min-h-[100px] resize-none"
              disabled={isLoading || !selectedDocumentId}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !query.trim() || !selectedDocumentId}
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
              <h3 className="text-lg font-semibold mb-3">Grounding Chunks</h3>
              <div className="space-y-3">
                {citations.map((citation, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                  >
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {typeof citation === 'string' 
                        ? citation 
                        : citation.text || citation.content || JSON.stringify(citation)}
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

