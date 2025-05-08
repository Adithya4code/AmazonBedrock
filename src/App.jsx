import React, { useState } from 'react';
import { Send, Loader2, Database, Bot, RefreshCw } from 'lucide-react';
import './App.css';

// Header Component
const Header = () => (
    <header className="header">
        <div className="header-content">
            <div className="header-title-container">
                <Database className="header-icon" size={24} />
                <h1 className="header-title">Bedrock RAG Query Engine</h1>
            </div>
            <div className="header-info">
                <Bot size={16} className="header-icon" />
                <span>Powered by Mistral 7B Instruct</span>
            </div>
        </div>
    </header>
);

// History Panel Component
const HistoryPanel = ({ history, setQuery, setResponse, handleClearHistory }) => (
    <aside className="history-panel">
        <div className="history-header">
            <h2 className="history-title">Query History</h2>
            <button onClick={handleClearHistory} className="history-clear-btn">
                <RefreshCw size={16} />
            </button>
        </div>
        <div className="history-list-container">
            {history.length === 0 ? (
                <div className="history-empty">No history yet</div>
            ) : (
                <ul className="history-list">
                    {history.map((item, index) => (
                        <li
                            key={index}
                            className="history-item"
                            onClick={() => {
                                setQuery(item.query);
                                setResponse(item.response);
                            }}
                        >
                            {item.query.substring(0, 30)}
                            {item.query.length > 30 ? '...' : ''}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    </aside>
);

// Query Input Component
const QueryInput = ({ query, setQuery, handleSubmit, loading }) => (
    <div className="query-card">
        <div className="query-header">
            <h2 className="query-title">Ask a Question</h2>
            <div className="query-hint">Press Ctrl+Enter to submit</div>
        </div>
        <div className="query-input-container">
      <textarea
          className="query-textarea"
          rows="4"
          placeholder="What would you like to know?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                  handleSubmit();
              }
          }}
      />
            <button
                className="query-submit-btn"
                onClick={handleSubmit}
                disabled={loading || !query.trim()}
            >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
        </div>
    </div>
);

// Response Display Component
const ResponseDisplay = ({ loading, error, response }) => (
    <div className="response-card">
        <h2 className="response-title">Response</h2>
        {error && <div className="response-error">{error}</div>}
        {loading ? (
            <div className="response-loading">
                <Loader2 className="response-loading-icon" size={20} />
                <span>Generating response...</span>
            </div>
        ) : response ? (
            <div className="response-content">
                {response.split('\n').map((line, index) => (
                    <p key={index} className={line.trim().startsWith('-') ? 'response-list-item' : ''}>
                        {line}
                    </p>
                ))}
            </div>
        ) : (
            <div className="response-empty">Submit a query to see results</div>
        )}
    </div>
);

// Footer Component
const Footer = () => (
    <footer className="footer">
        <p>Powered by AWS Bedrock with Mistral 7B Instruct v0.2</p>
    </footer>
);

function App() {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [history, setHistory] = useState([]);

    const handleSubmit = async () => {
        if (!query.trim()) {
            setError('Please enter a query.');
            return;
        }

        setLoading(true);
        setError('');
        setResponse('');

        try {
            const response = await fetch(import.meta.env.VITE_API_GATEWAY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }), // Corrected body structure
            });
            const data = await response.json();
            if (response.ok) {
                setResponse(data.response);
                setHistory((prev) => [...prev, { query, response: data.response }]);
            } else {
                setError(data.error || 'Failed to fetch response');
            }
        } catch (err) {
            console.error(err);
            setError('Error fetching response: ' + err.message);
        } finally {
            setLoading(false);
        }
    };


    const handleClearHistory = () => {
        setHistory([]);
    };

    return (
        <div className="app-container">
            <Header />
            <main className="main-content">
                <HistoryPanel
                    history={history}
                    setQuery={setQuery}
                    setResponse={setResponse}
                    handleClearHistory={handleClearHistory}
                />
                <div className="query-section">
                    <QueryInput
                        query={query}
                        setQuery={setQuery}
                        handleSubmit={handleSubmit}
                        loading={loading}
                    />
                    <ResponseDisplay loading={loading} error={error} response={response} />
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default App;