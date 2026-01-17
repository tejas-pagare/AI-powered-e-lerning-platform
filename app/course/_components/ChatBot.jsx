"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Loader2, Bot, User } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function ChatBot({ chapterContent, chapterName }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: `Hi! I'm your AI tutor for **${chapterName || 'this chapter'}**. Ask me anything about the material you just learned! 📚`,
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Update welcome message when chapter changes
    useEffect(() => {
        setMessages([
            {
                role: "assistant",
                content: `Hi! I'm your AI tutor for **${chapterName || 'this chapter'}**. Ask me anything about the material you just learned! 📚`,
                timestamp: new Date(),
            },
        ]);
    }, [chapterName]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = {
            role: "user",
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await axios.post("/api/chat", {
                message: userMessage.content,
                chapterContent: chapterContent,
                chapterName: chapterName,
            });

            if (response.data.success) {
                const aiMessage = {
                    role: "assistant",
                    content: response.data.response,
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, aiMessage]);
            } else {
                throw new Error(response.data.error || "Failed to get response");
            }
        } catch (error) {
            console.error("Chat error:", error);
            toast.error("Failed to get response from AI tutor");
            const errorMessage = {
                role: "assistant",
                content: "Sorry, I'm having trouble responding right now. Please try again!",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatMessage = (content) => {
        // Simple markdown formatting
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
            .replace(/\n/g, '<br/>');
    };

    return (
        <>
            {/* Floating Action Button */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 transition-transform hover:scale-110"
                size="icon"
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
            </Button>

            {/* Chat Window */}
            {isOpen && (
                <Card className="fixed bottom-24 right-6 w-[380px] h-[500px] shadow-2xl z-50 flex flex-col md:w-[380px] sm:w-[calc(100vw-3rem)]">
                    <CardHeader className="border-b">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Bot className="h-5 w-5 text-primary" />
                            AI Tutor
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Ask me about {chapterName || 'this chapter'}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"
                                    }`}
                            >
                                <div
                                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.role === "user"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-secondary"
                                        }`}
                                >
                                    {message.role === "user" ? (
                                        <User className="h-4 w-4" />
                                    ) : (
                                        <Bot className="h-4 w-4" />
                                    )}
                                </div>
                                <div
                                    className={`flex-1 rounded-lg p-3 ${message.role === "user"
                                            ? "bg-primary text-primary-foreground ml-12"
                                            : "bg-muted mr-12"
                                        }`}
                                >
                                    <div
                                        className="text-sm"
                                        dangerouslySetInnerHTML={{
                                            __html: formatMessage(message.content),
                                        }}
                                    />
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                                    <Bot className="h-4 w-4" />
                                </div>
                                <div className="flex-1 rounded-lg p-3 bg-muted mr-12">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Thinking...
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </CardContent>

                    <div className="border-t p-4">
                        <div className="flex gap-2">
                            <Input
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask a question..."
                                disabled={isLoading}
                                className="flex-1"
                            />
                            <Button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                size="icon"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                </Card>
            )}
        </>
    );
}
