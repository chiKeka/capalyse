import { ArrowLeftIcon, UserIcon } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  sender: 'me' | 'them';
  text: string;
  time: string;
  avatar?: string;
  typing?: boolean;
}

const chatUser = {
  name: 'Jenny Wilson',
  type: 'Angel Investor',
  avatar: '/images/user1.jpg',
  online: true,
};

const initialMessages: Message[] = [
  {
    id: '1',
    sender: 'me',
    text: 'Hi, Mandy',
    time: '09:41 AM',
    avatar: '/images/user1.jpg',
  },
  {
    id: '2',
    sender: 'me',
    text: ",I've tried the app",
    time: '09:41 AM',
    avatar: '/images/user1.jpg',
  },
  {
    id: '3',
    sender: 'them',
    text: 'Really?',
    time: '09:41 AM',
    avatar: '/images/user2.jpg',
  },
  {
    id: '4',
    sender: 'me',
    text: ",Yeah, It's really good!",
    time: '09:41 AM',
    avatar: '/images/user1.jpg',
  },
  {
    id: '5',
    sender: 'them',
    text: '',
    time: '',
    avatar: '/images/user2.jpg',
    typing: true,
  },
];

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend() {
    if (!input.trim()) return;
    setMessages((msgs) => [
      ...msgs.filter((m) => !m.typing),
      {
        id: String(Date.now()),
        sender: 'me',
        text: input,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        avatar: chatUser.avatar,
      },
    ]);
    setInput('');
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b">
        <button
          onClick={() => router.back()}
          aria-label="Back"
          className="text-emerald-700 hover:bg-emerald-50 rounded-full p-1"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        {chatUser.avatar ? (
          <Image
            src={chatUser.avatar}
            alt={chatUser.name}
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="rounded-full bg-muted aspect-square h-10 w-10 flex items-center justify-center">
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
        <div className="flex flex-col ml-2">
          <span className="font-semibold text-base leading-tight">
            {chatUser.name}
          </span>
          <span className="text-xs text-muted-foreground">{chatUser.type}</span>
        </div>
        {chatUser.online && (
          <span
            className="ml-2 mt-1 h-2 w-2 rounded-full bg-green-500 inline-block"
            aria-label="Online"
          />
        )}
      </div>
      {/* Chat body */}
      <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-2">
        <div className="mx-auto my-4 text-xs text-muted-foreground">
          09:41 AM
        </div>
        {messages.map((msg, idx) =>
          msg.typing ? (
            <div key={msg.id} className="flex items-end gap-2 mb-2">
              <div className="flex items-center">
                <Image
                  src={'/images/user2.jpg'}
                  alt="Typing"
                  width={28}
                  height={28}
                  className="rounded-full object-cover"
                />
              </div>
              <div className="bg-muted text-muted-foreground px-4 py-2 rounded-2xl text-sm">
                Typing...
              </div>
            </div>
          ) : msg.sender === 'me' ? (
            <div key={msg.id} className="flex items-end justify-end gap-2 mb-2">
              <div className="flex flex-col items-end">
                <div className="bg-emerald-700 text-white px-4 py-2 rounded-2xl text-sm max-w-xs mb-1">
                  {msg.text}
                </div>
              </div>
              <Image
                src={msg.avatar || ''}
                alt="Me"
                width={28}
                height={28}
                className="rounded-full object-cover"
              />
            </div>
          ) : (
            <div key={msg.id} className="flex items-end gap-2 mb-2">
              <Image
                src={msg.avatar || ''}
                alt={chatUser.name}
                width={28}
                height={28}
                className="rounded-full object-cover"
              />
              <div className="bg-muted text-gray-700 px-4 py-2 rounded-2xl text-sm max-w-xs">
                {msg.text}
              </div>
            </div>
          )
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Input */}
      <form
        className="px-4 py-4 border-t flex items-center gap-2 bg-white"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <input
          type="text"
          className="flex-1 border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
          placeholder="Type your message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Type your message"
        />
        <button
          type="submit"
          className="bg-emerald-700 rounded-xl p-2 text-white hover:bg-emerald-800 transition"
          aria-label="Send message"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 12h14M12 5l7 7-7 7"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}
