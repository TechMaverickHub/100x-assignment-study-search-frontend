import { useState } from 'react';
import { evaluationAPI } from '../services/api';
import { BarChart3, Play, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

const Evaluation = () => {
  const [qaPairs, setQaPairs] = useState([
    { question: '', answer: '' },
  ]);
  const [metrics, setMetrics] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);

  const addQAPair = () => {
    setQaPairs([...qaPairs, { question: '', answer: '' }]);
  };

  const removeQAPair = (index) => {
    setQaPairs(qaPairs.filter((_, i) => i !== index));
  };

  const updateQAPair = (index, field, value) => {
    const updated = [...qaPairs];
    updated[index][field] = value;
    setQaPairs(updated);
  };

  const handleRunEvaluation = async () => {
    // Validate Q&A pairs
    const validPairs = qaPairs.filter(
      (pair) => pair.question.trim() && pair.answer.trim()
    );

    if (validPairs.length === 0) {
      alert('Please add at least one question-answer pair');
      return;
    }

    setIsRunning(true);
    setResults(null);

    try {
      const response = await evaluationAPI.runEvaluation(validPairs);
      setResults(response);
      setMetrics(response.metrics || response);
    } catch (error) {
      // If API doesn't exist, show mock results
      setResults({
        metrics: {
          relevancy: 0.75,
          recall: 0.68,
          faithfulness: 0.82,
          overall: 0.75,
        },
        message: 'Evaluation API not yet implemented. Showing mock results.',
      });
      setMetrics({
        relevancy: 0.75,
        recall: 0.68,
        faithfulness: 0.82,
        overall: 0.75,
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">RAGAS Evaluation</h1>
        <p className="text-gray-600 mt-2">
          Evaluate the quality of your RAG system using RAGAS metrics
        </p>
      </div>

      {/* Q&A Pairs Input */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Question-Answer Pairs</h2>
          <button
            onClick={addQAPair}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            + Add Pair
          </button>
        </div>

        <div className="space-y-4">
          {qaPairs.map((pair, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">
                  Pair {index + 1}
                </span>
                {qaPairs.length > 1 && (
                  <button
                    onClick={() => removeQAPair(index)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question
                  </label>
                  <input
                    type="text"
                    value={pair.question}
                    onChange={(e) => updateQAPair(index, 'question', e.target.value)}
                    placeholder="Enter question..."
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Answer
                  </label>
                  <textarea
                    value={pair.answer}
                    onChange={(e) => updateQAPair(index, 'answer', e.target.value)}
                    placeholder="Enter expected answer..."
                    className="input-field min-h-[80px] resize-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleRunEvaluation}
          disabled={isRunning || qaPairs.length === 0}
          className="btn-primary mt-6 w-full disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {isRunning ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Running Evaluation...</span>
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              <span>Run RAGAS Evaluation</span>
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {results && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Evaluation Results
          </h2>

          {results.message && (
            <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
              {results.message}
            </div>
          )}

          {metrics && (
            <div className="space-y-4">
              {/* Overall Score */}
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Overall Score</p>
                    <p className="text-4xl font-bold text-primary-700 mt-2">
                      {(metrics.overall * 100).toFixed(1)}%
                    </p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-primary-600" />
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-primary-600 h-3 rounded-full transition-all"
                      style={{ width: `${metrics.overall * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Individual Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                  title="Relevancy"
                  value={metrics.relevancy}
                  description="How relevant are the retrieved chunks?"
                />
                <MetricCard
                  title="Recall"
                  value={metrics.recall}
                  description="How much relevant information is retrieved?"
                />
                <MetricCard
                  title="Faithfulness"
                  value={metrics.faithfulness}
                  description="How faithful is the answer to the context?"
                />
              </div>

              {/* Threshold Indicator */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  {metrics.overall >= 0.6 ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        System meets quality threshold (≥60%)
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">
                        System below quality threshold (target: ≥60%)
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Section */}
      <div className="card bg-blue-50 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">About RAGAS</h3>
        <p className="text-sm text-blue-800 mb-2">
          RAGAS (Retrieval-Augmented Generation Assessment) evaluates your RAG system across
          multiple dimensions:
        </p>
        <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
          <li>
            <strong>Relevancy:</strong> Measures how relevant retrieved chunks are to the query
          </li>
          <li>
            <strong>Recall:</strong> Measures how much relevant information is retrieved
          </li>
          <li>
            <strong>Faithfulness:</strong> Measures how faithful the answer is to the context
          </li>
        </ul>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, description }) => {
  const percentage = (value * 100).toFixed(1);
  const isGood = value >= 0.6;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span
          className={`text-lg font-bold ${
            isGood ? 'text-green-600' : 'text-yellow-600'
          }`}
        >
          {percentage}%
        </span>
      </div>
      <p className="text-xs text-gray-600 mb-3">{description}</p>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            isGood ? 'bg-green-500' : 'bg-yellow-500'
          }`}
          style={{ width: `${value * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default Evaluation;

