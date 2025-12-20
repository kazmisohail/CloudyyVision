import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, X, MessageSquare } from 'lucide-react';

interface ChatInterfaceProps {
    metrics: any;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ metrics }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([
        { role: 'ai', content: "Hello! I'm CloudVision AI. I can analyze the current satellite image metrics for you. Ask me anything about the cloud coverage or solar potential!" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input;
        setInput("");
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:8000/api/chat/', {
                message: userMessage,
                image_metrics: metrics
            });

            setMessages(prev => [...prev, { role: 'ai', content: response.data.reply }]);
        } catch (error) {
            console.error("Chat error", error);
            setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error connecting to the server." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 ${isOpen ? 'bg-red-500 rotate-90' : 'bg-cyan-600 hover:bg-cyan-500 hover:scale-110'}`}
            >
                {isOpen ? <X className="h-6 w-6 text-white" /> : <MessageSquare className="h-6 w-6 text-white" />}
            </button>

            {/* Chat Window */}
            <div className={`fixed bottom-24 right-6 z-40 w-96 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl transition-all duration-300 transform origin-bottom-right flex flex-col ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`} style={{ height: '500px' }}>

                {/* Header */}
                <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-slate-800/50 rounded-t-2xl">
                    <div className="p-2 bg-cyan-500/20 rounded-lg">
                        <Bot className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold">CloudVision AI</h3>
                        <p className="text-xs text-green-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                            Online
                        </p>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-purple-600' : 'bg-cyan-600'}`}>
                                {msg.role === 'user' ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-white" />}
                            </div>
                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-purple-600/20 text-purple-100 rounded-tr-none' : 'bg-slate-800 text-gray-300 rounded-tl-none'}`}>
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center flex-shrink-0">
                                <Bot className="h-4 w-4 text-white" />
                            </div>
                            <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/10 bg-slate-800/30 rounded-b-2xl">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask about weather or solar potential..."
                            className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading}
                            className="p-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChatInterface;
