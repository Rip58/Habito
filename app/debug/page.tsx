"use client";
import React, { useState } from 'react';

export default function DebugPage() {
    const [results, setResults] = useState<any[]>([]);

    const runTest = async (name: string, url: string, method: string = 'GET') => {
        try {
            const start = performance.now();
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: method === 'POST' ? JSON.stringify({ test: true }) : undefined
            });
            const text = await res.text();
            const end = performance.now();

            setResults(prev => [...prev, {
                name,
                url,
                method,
                status: res.status,
                statusText: res.statusText,
                type: res.type,
                headers: Object.fromEntries(res.headers.entries()),
                body: text.slice(0, 500), // First 500 chars
                time: Math.round(end - start) + 'ms'
            }]);
        } catch (e: any) {
            setResults(prev => [...prev, {
                name,
                url,
                method,
                status: 'ERROR',
                body: e.message
            }]);
        }
    };

    return (
        <div className="p-8 bg-gray-900 text-white min-h-screen font-mono text-sm">
            <h1 className="text-2xl font-bold mb-6">API Connectivity Debugger</h1>

            <div className="space-x-4 mb-8">
                <button onClick={() => runTest('GET v1 Logs', '/api/v1/logs')} className="px-4 py-2 bg-blue-600 rounded">GET /api/v1/logs</button>
                <button onClick={() => runTest('POST v1 Logs', '/api/v1/logs', 'POST')} className="px-4 py-2 bg-green-600 rounded">POST /api/v1/logs</button>
                <button onClick={() => runTest('GET Old Logs', '/api/logs')} className="px-4 py-2 bg-gray-600 rounded">GET /api/logs</button>
                <button onClick={() => setResults([])} className="px-4 py-2 bg-red-600 rounded">Clear</button>
            </div>

            <div className="space-y-4">
                {results.map((r, i) => (
                    <div key={i} className="border border-gray-700 p-4 rounded bg-gray-800">
                        <div className="flex justify-between font-bold mb-2">
                            <span>{r.method} {r.url}</span>
                            <span className={r.status === 200 ? 'text-green-400' : 'text-red-400'}>{r.status} {r.statusText} ({r.time})</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-gray-400 mb-1">Headers</h3>
                                <pre className="bg-black p-2 rounded text-xs overflow-auto max-h-40">
                                    {JSON.stringify(r.headers, null, 2)}
                                </pre>
                            </div>
                            <div>
                                <h3 className="text-gray-400 mb-1">Body Preview</h3>
                                <pre className="bg-black p-2 rounded text-xs overflow-auto max-h-40 whitespace-pre-wrap">
                                    {r.body}
                                </pre>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
