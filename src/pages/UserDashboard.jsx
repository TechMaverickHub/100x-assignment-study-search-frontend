import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fileSearchAPI } from '../services/api';
import { Upload, Send, FileText, Loader2, Plus, Menu, X, Settings, MessageSquare, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentOptions, setDocumentOptions] = useState([]);
  const [documentFilter, setDocumentFilter] = useState('');
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [selectedDocumentTitle, setSelectedDocumentTitle] = useState(null);
  const [documentDetails, setDocumentDetails] = useState(null);
  const [isLoadingDocumentDetails, setIsLoadingDocumentDetails] = useState(false);
  const [conversations, setConversations] = useState([]);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    loadDocumentOptions();
  }, [documentFilter]);

  useEffect(() => {
    if (selectedDocumentId) {
      loadDocumentDetails();
    }
  }, [selectedDocumentId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadDocumentOptions = async () => {
    setIsLoadingDocuments(true);
    try {
      const data = await fileSearchAPI.listStoresFiltered(1, 5, documentFilter);
      const documents = data.results || [];
      setDocumentOptions(documents);
      
      if (documents.length > 0 && !selectedDocumentId) {
        setSelectedDocumentId(documents[0].id);
        setSelectedDocumentTitle(documents[0].title);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocumentOptions([]);
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const loadDocumentDetails = async (documentId = null) => {
    const docId = documentId || selectedDocumentId;
    if (!docId) return;
    
    setIsLoadingDocumentDetails(true);
    try {
      const data = await fileSearchAPI.getDocumentDetails(docId);
      const details = data.results || data;
      setDocumentDetails(details);
      // Update title if available
      if (details.title && !selectedDocumentTitle) {
        setSelectedDocumentTitle(details.title);
      }
    } catch (error) {
      console.error('Error loading document details:', error);
      setDocumentDetails(null);
    } finally {
      setIsLoadingDocumentDetails(false);
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
        message: response.message || 'PDF uploaded successfully!' 
      });
      setUploadTitle('');
      e.target.value = '';
      setShowUploadModal(false);
      await loadDocumentOptions();
      setTimeout(() => setUploadStatus(null), 3000);
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

    const userMessage = query.trim();
    setQuery('');
    
    // Add user message
    const newUserMessage = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const response = await fileSearchAPI.query(userMessage, selectedDocumentId);
      const responseData = response.results || response;
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: responseData.response_text || responseData.answer || responseData.response || 'No answer found',
        citations: responseData.grounding_chunks || responseData.citations || [],
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      
      // Save to conversations
      const conversation = {
        id: Date.now(),
        title: userMessage.substring(0, 50),
        messages: [newUserMessage, assistantMessage],
        documentId: selectedDocumentId,
        documentTitle: selectedDocumentTitle,
        timestamp: new Date(),
      };
      setConversations((prev) => [conversation, ...prev.slice(0, 19)]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Error: ' + (error.response?.data?.detail || error.response?.data?.message || 'Failed to process query'),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setQuery('');
  };

  const loadConversation = (conversation) => {
    setMessages(conversation.messages);
    setSelectedDocumentId(conversation.documentId);
    setSelectedDocumentTitle(conversation.documentTitle);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && query.trim() && selectedDocumentId) {
        handleQuery(e);
      }
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  return (
    <div className="flex h-screen bg-[#343541] overflow-hidden">
      {/* Sidebar */}
      <div className={`${showSidebar ? 'w-64' : 'w-0'} transition-all duration-300 bg-[#202123] border-r border-[#565869] flex flex-col overflow-hidden`}>
        <div className="p-3 border-b border-[#565869]">
          <button
            onClick={startNewConversation}
            className="w-full flex items-center space-x-2 px-3 py-2.5 bg-[#565869] hover:bg-[#4a4c5a] rounded-lg text-white transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => loadConversation(conv)}
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[#2a2b32] text-gray-300 text-sm truncate transition-colors"
            >
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{conv.title}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Document Selector */}
        <div className="p-3 border-t border-[#565869] space-y-2">
          <div className="text-xs text-gray-400 mb-2 px-2">Current Document</div>
          {selectedDocumentTitle ? (
            <button
              onClick={() => setShowDocumentModal(true)}
              className="w-full px-3 py-2 bg-[#2a2b32] hover:bg-[#343541] rounded-lg text-sm text-gray-300 flex items-center space-x-2 transition-colors"
            >
              <FileText className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{selectedDocumentTitle}</span>
            </button>
          ) : (
            <button
              onClick={() => setShowDocumentModal(true)}
              className="w-full px-3 py-2 bg-[#2a2b32] hover:bg-[#343541] rounded-lg text-sm text-gray-500 transition-colors"
            >
              Select Document
            </button>
          )}

          {/* Document Details */}
          {selectedDocumentId && documentDetails && (
            <div className="mt-3 p-3 bg-[#2a2b32] rounded-lg text-xs space-y-2">
              {isLoadingDocumentDetails ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-[#10a37f]" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className={`font-medium ${
                      documentDetails.status === 'READY' 
                        ? 'text-green-400' 
                        : documentDetails.status === 'UPLOADING'
                        ? 'text-yellow-400'
                        : 'text-red-400'
                    }`}>
                      {documentDetails.status}
                    </span>
                  </div>
                  {documentDetails.file && (
                    <div className="pt-2 border-t border-[#565869]">
                      <a
                        href={documentDetails.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#10a37f] hover:underline truncate block"
                        title={documentDetails.file}
                      >
                        View PDF
                      </a>
                    </div>
                  )}
                  {documentDetails.created && (
                    <div className="text-gray-500">
                      Created: {new Date(documentDetails.created).toLocaleDateString()}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <button
            onClick={() => setShowUploadModal(true)}
            className="w-full flex items-center space-x-2 px-3 py-2 bg-[#565869] hover:bg-[#4a4c5a] rounded-lg text-white text-sm transition-colors"
          >
            <Upload className="h-4 w-4" />
            <span>Upload PDF</span>
          </button>
        </div>

        {/* User Info */}
        <div className="p-3 border-t border-[#565869] space-y-2">
          <div className="flex items-center space-x-2 px-2 py-1.5 text-sm text-gray-400">
            <div className="h-6 w-6 rounded-full bg-[#10a37f] flex items-center justify-center text-white text-xs font-medium">
              {user?.firstName?.[0] || user?.email?.[0] || 'U'}
            </div>
            <span className="truncate">{user?.fullName || user?.firstName || user?.email || 'User'}</span>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center space-x-2 px-3 py-2 bg-[#565869] hover:bg-[#4a4c5a] rounded-lg text-white text-sm transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Header */}
        <div className="h-12 bg-[#343541] border-b border-[#565869] flex items-center px-4">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 hover:bg-[#40414f] rounded-lg transition-colors"
          >
            {showSidebar ? <X className="h-5 w-5 text-gray-400" /> : <Menu className="h-5 w-5 text-gray-400" />}
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-2xl px-4">
                <h1 className="text-4xl font-semibold text-gray-200 mb-4">StudySearch</h1>
                <p className="text-gray-400 text-lg mb-8">
                  Ask questions about your uploaded documents. Select a document from the sidebar to get started.
                </p>
                {!selectedDocumentId && (
                  <div className="bg-[#40414f] rounded-lg p-4 text-left">
                    <p className="text-gray-300 mb-2">No document selected</p>
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="text-[#10a37f] hover:underline"
                    >
                      Upload a PDF to get started
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-6 py-8 pl-8">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message-${message.role} py-6`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' ? 'bg-[#10a37f]' : 'bg-[#19c37d]'
                    }`}>
                      {message.role === 'user' ? (
                        <span className="text-white text-sm font-medium leading-none">
                          {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                        </span>
                      ) : (
                        <span className="text-white text-sm font-semibold leading-none">AI</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="prose prose-invert max-w-none">
                        <div className="text-gray-100 whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </div>
                      </div>
                      {message.citations && message.citations.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <div className="text-xs text-gray-400 mb-2">Sources:</div>
                          {message.citations.slice(0, 3).map((citation, idx) => (
                            <div
                              key={idx}
                              className="bg-[#40414f] p-3 rounded-lg text-sm text-gray-300 border border-[#565869]"
                            >
                              <p className="whitespace-pre-wrap line-clamp-3">
                                {typeof citation === 'string' ? citation : citation.text || citation.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="message-assistant py-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#19c37d] flex items-center justify-center">
                      <span className="text-white text-sm font-semibold leading-none">AI</span>
                    </div>
                    <div className="flex-1 flex items-center">
                      <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-[#565869] bg-[#343541]">
          <div className="max-w-3xl mx-auto p-4">
            {!selectedDocumentId && (
              <div className="mb-3 p-3 bg-[#40414f] rounded-lg text-sm text-gray-300">
                Please select a document from the sidebar to start chatting.
              </div>
            )}
            <form onSubmit={handleQuery} className="relative flex items-end">
              <textarea
                ref={textareaRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  adjustTextareaHeight();
                }}
                onKeyDown={handleKeyDown}
                placeholder={selectedDocumentId ? "Message StudySearch..." : "Select a document first..."}
                className="w-full px-4 py-3 pr-14 bg-[#40414f] border border-[#565869] rounded-lg text-gray-100 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-[#10a37f] focus:border-transparent max-h-[200px]"
                disabled={isLoading || !selectedDocumentId}
                rows={1}
              />
              <button
                type="submit"
                disabled={isLoading || !query.trim() || !selectedDocumentId}
                className="absolute right-2 bottom-2.5 p-2 bg-[#10a37f] hover:bg-[#0d8f6e] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                ) : (
                  <Send className="h-5 w-5 text-white" />
                )}
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-2 text-center">
              StudySearch can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#40414f] rounded-lg p-6 max-w-md w-full mx-4 border border-[#565869]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-100">Upload PDF</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadStatus(null);
                }}
                className="text-gray-400 hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Document Title (optional)
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Enter a title..."
                  className="input-field"
                  disabled={isUploading}
                />
              </div>

              <label className="block">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                  id="pdf-upload"
                />
                <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-[#565869] rounded-lg cursor-pointer hover:border-[#10a37f] transition-colors">
                  {isUploading ? (
                    <div className="flex items-center space-x-2 text-[#10a37f]">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <span className="text-gray-300">Click to upload PDF</span>
                    </div>
                  )}
                </div>
              </label>

              {uploadStatus && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    uploadStatus.type === 'success'
                      ? 'bg-green-900/30 text-green-300'
                      : 'bg-red-900/30 text-red-300'
                  }`}
                >
                  {uploadStatus.message}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Document Selector Modal */}
      {showDocumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#40414f] rounded-lg p-6 max-w-md w-full mx-4 border border-[#565869] max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-100">Select Document</h2>
              <button
                onClick={() => setShowDocumentModal(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3">
              <div>
                <input
                  type="text"
                  value={documentFilter}
                  onChange={(e) => setDocumentFilter(e.target.value)}
                  placeholder="Filter documents by title..."
                  className="input-field text-sm"
                  disabled={isLoadingDocuments}
                />
              </div>

              {isLoadingDocuments ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-[#10a37f]" />
                  <span className="ml-2 text-gray-300">Loading documents...</span>
                </div>
              ) : documentOptions.length > 0 ? (
                <div className="space-y-2">
                  {documentOptions.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={async () => {
                        setSelectedDocumentId(doc.id);
                        setSelectedDocumentTitle(doc.title);
                        setShowDocumentModal(false);
                        setDocumentFilter('');
                        // Load document details with the selected document ID
                        await loadDocumentDetails(doc.id);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                        selectedDocumentId === doc.id
                          ? 'bg-[#10a37f] text-white'
                          : 'bg-[#2a2b32] text-gray-300 hover:bg-[#343541]'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 flex-shrink-0" />
                        <span className="truncate">{doc.title}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-500" />
                  <p>
                    {documentFilter
                      ? 'No documents found matching your filter.'
                      : 'No documents available. Upload a PDF first.'}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-[#565869]">
              <button
                onClick={() => {
                  setShowDocumentModal(false);
                  setShowUploadModal(true);
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-[#565869] hover:bg-[#4a4c5a] rounded-lg text-white transition-colors"
              >
                <Upload className="h-4 w-4" />
                <span>Upload New PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
