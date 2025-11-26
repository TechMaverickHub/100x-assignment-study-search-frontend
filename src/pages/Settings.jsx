import { useState, useEffect } from 'react';
import { personalizationAPI } from '../services/api';
import { Settings as SettingsIcon, Save, User, MessageSquare } from 'lucide-react';

const Settings = () => {
  const [name, setName] = useState('');
  const [tone, setTone] = useState('academic');
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const data = await personalizationAPI.getPreferences();
      if (data) {
        setName(data.name || '');
        setTone(data.tone || 'academic');
      }
    } catch (error) {
      // If API doesn't exist yet, use defaults
      console.log('Preferences API not available, using defaults');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSaveStatus(null);

    try {
      await personalizationAPI.savePreferences(name, tone);
      setSaveStatus({ type: 'success', message: 'Preferences saved successfully!' });
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus({
        type: 'error',
        message: error.response?.data?.detail || 'Failed to save preferences',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Personalize your StudySearch experience</p>
      </div>

      <div className="card max-w-2xl">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <SettingsIcon className="h-5 w-5 mr-2" />
          Personalization
        </h2>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Name Setting */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4 inline mr-2" />
              Your Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name (optional)"
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your name will be used to personalize responses
            </p>
          </div>

          {/* Tone Setting */}
          <div>
            <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="h-4 w-4 inline mr-2" />
              Response Tone
            </label>
            <select
              id="tone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="input-field"
            >
              <option value="academic">Academic - Formal and scholarly</option>
              <option value="friendly">Friendly - Warm and approachable</option>
              <option value="concise">Concise - Brief and to the point</option>
              <option value="detailed">Detailed - Comprehensive explanations</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Choose how you want answers to be formatted
            </p>
          </div>

          {/* Save Status */}
          {saveStatus && (
            <div
              className={`p-3 rounded-lg ${
                saveStatus.type === 'success'
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-800'
              }`}
            >
              {saveStatus.message}
            </div>
          )}

          {/* Save Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="h-5 w-5" />
            <span>{isLoading ? 'Saving...' : 'Save Preferences'}</span>
          </button>
        </form>
      </div>

      {/* Info Section */}
      <div className="card max-w-2xl bg-blue-50 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">About Personalization</h3>
        <p className="text-sm text-blue-800">
          Your personalization settings help StudySearch tailor responses to your preferences.
          These settings are stored locally and will be applied to all future queries.
        </p>
      </div>
    </div>
  );
};

export default Settings;

