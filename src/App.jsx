import React, { useState } from 'react';
import { BedrockAgentRuntimeClient, RetrieveAndGenerateCommand } from '@aws-sdk/client-bedrock-agent-runtime';
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";

// Configure AWS SDK v3 client
const client = new BedrockAgentRuntimeClient({
    region: 'us-east-1', // Replace with your AWS region
    credentials: fromCognitoIdentityPool({
        clientConfig: { region: 'us-east-1' },
        identityPoolId: 'YOUR_IDENTITY_POOL_ID',
    }),
});

function App() {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleQuerySubmit = async () => {
        if (!query.trim()) {
            setError('Please enter a query.');
            return;
        }

        setLoading(true);
        setError('');
        setResponse('');

        try {
            // Prepare the request to Bedrock RetrieveAndGenerate API
            const command = new RetrieveAndGenerateCommand({
                input: {
                    text: query,
                },
                retrieveAndGenerateConfiguration: {
                    type: 'KNOWLEDGE_BASE',
                    knowledgeBaseConfiguration: {
                        knowledgeBaseId: 'YOUR_KNOWLEDGE_BASE_ID', // Replace with your Knowledge Base ID
                        modelArn: 'arn:aws:bedrock:us-east-1::foundation-model/mixtral.mixtral-7b-instruct-v0:2', // Mistral 7B
                        // For Llama 3.1 8B, use: 'arn:aws:bedrock:us-east-1::foundation-model/meta.llama3-1-8b-v1'
                        retrievalConfiguration: {
                            vectorSearchConfiguration: {
                                numberOfResults: 5, // Number of relevant documents to retrieve
                            },
                        },
                    },
                },
            });

            // Call Bedrock RetrieveAndGenerate
            const result = await client.send(command);
            const generatedText = result.output?.text || 'No response generated.';
            setResponse(generatedText);
        } catch (err) {
            console.error(err);
            setError('Error fetching response: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-2xl">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">RAG Query App</h1>
                <p className="text-gray-600 mb-4">
                    Enter a query to retrieve and generate a response using AWS Bedrock RAG model.
                </p>
                <div className="mb-4">
               <textarea
                   className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                   rows="4"
                   placeholder="Enter your query here..."
                   value={query}
                   onChange={(e) => setQuery(e.target.value)}
               />
                </div>
                <button
                    className={`w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={handleQuerySubmit}
                    disabled={loading}
                >
                    {loading ? 'Processing...' : 'Submit Query'}
                </button>
                {error && <p className="mt-4 text-red-600">{error}</p>}
                {response && (
                    <div className="mt-6">
                        <h2 className="text-lg font-semibold text-gray-800">Response:</h2>
                        <p className="mt-2 text-gray-700">{response}</p>
                    </div>
                )}
            </div>
            <p className="mt-4 text-gray-500 text-sm">
                Powered by AWS Bedrock with Mistral 7B Instruct v0.2
            </p>
        </div>
    );
}

export default App;