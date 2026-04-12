import { useState } from "react";
import { Search, Phone, Video, Send, Paperclip, Image, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Conversation {
    id: string;
    name: string;
    avatar: string;
    lastMessage: string;
    time: string;
    unread: number;
    online: boolean;
}

const conversations: Conversation[] = [
    { id: "1", name: "Sarah Johnson", avatar: "S", lastMessage: "Hey! Are we still meeting today?", time: "2m", unread: 2, online: true },
    { id: "2", name: "Mike Chen", avatar: "M", lastMessage: "The location looks great!", time: "1h", unread: 0, online: false },
    { id: "3", name: "Emma Wilson", avatar: "E", lastMessage: "Thanks for the info", time: "3h", unread: 0, online: true },
    { id: "4", name: "David Brown", avatar: "D", lastMessage: "See you tomorrow", time: "Yesterday", unread: 1, online: false },
];

interface Message {
    id: string;
    sender: "me" | "other";
    text: string;
    time: string;
}

const messages: Message[] = [
    { id: "1", sender: "other", text: "Hi there! How are you?", time: "10:30 AM" },
    { id: "2", sender: "me", text: "I'm doing great!", time: "10:32 AM" },
    { id: "3", sender: "other", text: "Want to grab coffee?", time: "10:33 AM" },
    { id: "4", sender: "me", text: "Sure! When?", time: "10:35 AM" },
    { id: "5", sender: "other", text: "How about tomorrow?", time: "10:36 AM" },
];

export const Chat = () => {
    const [selectedId, setSelectedId] = useState("1");
    const [message, setMessage] = useState("");
    const current = conversations.find(c => c.id === selectedId);

    const handleSend = () => {
        if (!message.trim()) return;
        setMessage("");
    };

    return (
        <>
            <div className="w-full md:w-80 border-r border-slate-800/50 flex flex-col bg-slate-900/30">
                <div className="p-4 border-b border-slate-800/50">
                    <h2 className="text-lg font-semibold text-white mb-3">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50 cursor-text"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.map((c) => (
                        <div
                            key={c.id}
                            onClick={() => setSelectedId(c.id)}
                            className={`p-3 border-b border-slate-800/30 cursor-pointer transition-colors ${selectedId === c.id ? "bg-slate-800/50" : "hover:bg-slate-800/30"}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-sm font-medium">
                                        {c.avatar}
                                    </div>
                                    {c.online && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-900 rounded-full" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-white truncate">{c.name}</span>
                                        <span className="text-xs text-slate-500">{c.time}</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-sm text-slate-400 truncate">{c.lastMessage}</span>
                                        {c.unread > 0 && <span className="min-w-[18px] h-[18px] px-1 bg-sky-500 text-white text-xs rounded-full flex items-center justify-center">{c.unread}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex flex-col bg-slate-900/50">
                <div className="h-16 border-b border-slate-800/50 flex items-center justify-between px-4 bg-slate-900/30">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-sm font-medium">
                                {current?.avatar}
                            </div>
                            {current?.online && <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border-2 border-slate-900 rounded-full" />}
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-white">{current?.name}</h3>
                            <p className="text-xs text-green-400">{current?.online ? "Online" : "Offline"}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white cursor-pointer"><Phone className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white cursor-pointer"><Video className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white cursor-pointer"><MoreVertical className="w-4 h-4" /></Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[70%] ${msg.sender === "me" ? "order-2" : "order-1"}`}>
                                <div className={`px-4 py-2 rounded-2xl ${msg.sender === "me" ? "bg-sky-500 text-white rounded-br-md" : "bg-slate-800 text-slate-200 rounded-bl-md"}`}>
                                    <p className="text-sm">{msg.text}</p>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">{msg.time}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-slate-800/50 bg-slate-900/30">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white cursor-pointer shrink-0"><Paperclip className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white cursor-pointer shrink-0"><Image className="w-4 h-4" /></Button>
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-full text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50 cursor-text"
                        />
                        <Button onClick={handleSend} disabled={!message.trim()} size="icon" className="bg-sky-500 hover:bg-sky-600 border-0 cursor-pointer shrink-0">
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};