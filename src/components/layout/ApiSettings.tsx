import { useState } from 'react';
import { X, Key, ExternalLink, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { apiKeyManager, type ApiKeyStatus } from '../../services/apiKeyManager';

interface ApiSettingsProps {
  onClose: () => void;
}

export function ApiSettings({ onClose }: ApiSettingsProps) {
  const [apiStatuses, setApiStatuses] = useState<Record<string, ApiKeyStatus>>(apiKeyManager.getAllStatuses());
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [tempKeyValue, setTempKeyValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSaveKey = (service: string) => {
    const validation = apiKeyManager.validateKeyFormat(service, tempKeyValue);
    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid key format');
      return;
    }

    apiKeyManager.setKey(service, tempKeyValue);
    setApiStatuses(apiKeyManager.getAllStatuses());
    setEditingKey(null);
    setTempKeyValue('');
    setValidationError(null);
  };

  const handleCancelEdit = () => {
    setEditingKey(null);
    setTempKeyValue('');
    setValidationError(null);
  };

  const handleStartEdit = (service: string) => {
    setEditingKey(service);
    setTempKeyValue(apiKeyManager.getKey(service));
    setValidationError(null);
  };

  const hasRequiredKeys = Object.values(apiStatuses).some(s => s.config.required && !s.isValid);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-bbg-panel border border-bbg-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-bbg-border bg-bbg-header-alt">
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5 text-bbg-orange" />
            <h2 className="text-lg font-bold text-bbg-text">API Key Configuration</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-bbg-border rounded transition-colors"
          >
            <X className="w-5 h-5 text-bbg-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Info Banner */}
          <div className="bg-bbg-bg-alt border border-bbg-border rounded p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-bbg-amber flex-shrink-0 mt-0.5" />
              <div className="text-sm text-bbg-text">
                <p className="font-semibold text-bbg-text mb-1">API Keys are Optional</p>
                <p className="text-bbg-muted">
                  This app works in demo mode with realistic mock data. Add API keys to access live market data.
                  All listed APIs have free tiers. Keys are stored locally in your browser.
                </p>
              </div>
            </div>
          </div>

          {/* Required Keys Section */}
          {hasRequiredKeys && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-bbg-orange uppercase tracking-wider">Required Keys</h3>
              <div className="grid gap-3">
                {Object.entries(apiStatuses)
                  .filter(([_, s]) => s.config.required && !s.isValid)
                  .map(([service, status]) => (
                    <ApiKeyCard
                      key={service}
                      service={service}
                      status={status}
                      editingKey={editingKey}
                      tempKeyValue={tempKeyValue}
                      validationError={validationError}
                      onStartEdit={handleStartEdit}
                      onSaveKey={handleSaveKey}
                      onCancelEdit={handleCancelEdit}
                      onSetTempKeyValue={setTempKeyValue}
                      onSetValidationError={setValidationError}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Suggested Keys Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-bbg-amber uppercase tracking-wider">
              Suggested API Keys
            </h3>
            <div className="grid gap-3">
              {Object.entries(apiStatuses).map(([service, status]) => (
                <ApiKeyCard
                  key={service}
                  service={service}
                  status={status}
                  editingKey={editingKey}
                  tempKeyValue={tempKeyValue}
                  validationError={validationError}
                  onStartEdit={handleStartEdit}
                  onSaveKey={handleSaveKey}
                  onCancelEdit={handleCancelEdit}
                  onSetTempKeyValue={setTempKeyValue}
                  onSetValidationError={setValidationError}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-bbg-border bg-bbg-header-alt text-xs text-bbg-muted">
          <p>
            Keys are stored in your browser's localStorage. Clear your browser data to remove stored keys.
          </p>
        </div>
      </div>
    </div>
  );
}

interface ApiKeyCardProps {
  service: string;
  status: ApiKeyStatus;
  editingKey: string | null;
  tempKeyValue: string;
  validationError: string | null;
  onStartEdit: (service: string) => void;
  onSaveKey: (service: string) => void;
  onCancelEdit: () => void;
  onSetTempKeyValue: (value: string) => void;
  onSetValidationError: (error: string | null) => void;
}

function ApiKeyCard({
  service,
  status,
  editingKey,
  tempKeyValue,
  validationError,
  onStartEdit,
  onSaveKey,
  onCancelEdit,
  onSetTempKeyValue,
  onSetValidationError,
}: ApiKeyCardProps) {
  const isEditing = editingKey === service;
  const { config, isValid, isEmpty } = status;

  return (
    <div className={`border rounded p-4 transition-colors ${
      isValid 
        ? 'border-bbg-green/30 bg-bbg-green/5' 
        : isEmpty 
          ? 'border-bbg-border bg-bbg-bg-alt'
          : 'border-bbg-orange/30 bg-bbg-orange/5'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-bold text-bbg-text">{config.name}</h4>
            {isValid ? (
              <CheckCircle className="w-4 h-4 text-bbg-green" />
            ) : isEmpty ? (
              <AlertCircle className="w-4 h-4 text-bbg-muted" />
            ) : (
              <AlertCircle className="w-4 h-4 text-bbg-orange" />
            )}
            <span className={`text-xs px-2 py-0.5 rounded ${
              isValid 
                ? 'bg-bbg-green/20 text-bbg-green' 
                : 'bg-bbg-orange/20 text-bbg-orange'
            }`}>
              {isValid ? 'ACTIVE' : isEmpty ? 'NOT SET' : 'INVALID'}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-bbg-muted mb-2">{config.description}</p>

          {/* Functions enabled */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {config.functions.map(fn => (
              <span
                key={fn}
                className="text-xs px-2 py-1 rounded bg-bbg-border text-bbg-muted"
              >
                {fn}
              </span>
            ))}
          </div>

          {/* Free tier info */}
          <div className="flex items-center gap-4 text-xs text-bbg-muted mb-3">
            <span>Free: <span className="text-bbg-amber">{config.freeTier}</span></span>
            <a
              href={config.signupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-bbg-orange hover:underline"
            >
              Get Key <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Key Input */}
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="password"
                value={tempKeyValue}
                onChange={(e) => {
                  onSetTempKeyValue(e.target.value);
                  onSetValidationError(null);
                }}
                placeholder={`Enter your ${config.name} API key`}
                className="w-full max-w-md px-3 py-2 bg-bbg-bg border border-bbg-border rounded text-bbg-text text-sm font-mono focus:outline-none focus:border-bbg-orange"
                autoFocus
              />
              {validationError && (
                <p className="text-xs text-red-400">{validationError}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => onSaveKey(service)}
                  className="px-3 py-1.5 bg-bbg-orange text-bbg-bg text-sm font-bold rounded hover:bg-bbg-amber transition-colors"
                >
                  Save Key
                </button>
                <button
                  onClick={onCancelEdit}
                  className="px-3 py-1.5 bg-bbg-border text-bbg-text text-sm rounded hover:bg-bbg-muted/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {isValid ? (
                <span className="text-xs font-mono text-bbg-green">
                  Key: ••••••••{apiKeyManager.getKey(service).slice(-4)}
                </span>
              ) : null}
              <button
                onClick={() => onStartEdit(service)}
                className="text-xs px-3 py-1.5 bg-bbg-border text-bbg-text rounded hover:bg-bbg-orange/20 hover:text-bbg-orange transition-colors"
              >
                {isValid ? 'Update Key' : 'Add Key'}
              </button>
              {isValid && (
                <button
                  onClick={() => {
                    apiKeyManager.setKey(service, '');
                    window.location.reload();
                  }}
                  className="text-xs px-3 py-1.5 bg-red-900/30 text-red-400 rounded hover:bg-red-900/50 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
