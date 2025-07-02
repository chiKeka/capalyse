import { UserIcon } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Message } from '../ui/message-sheet';

const initialMessages: Message[] = [
  {
    id: '1',
    sender: 'me',
    text: 'Hi, Mandy',
    time: '09:41 AM',
    avatar: '',
    senderType: 'Angel Investor',
    online: true,
  },
  {
    id: '2',
    sender: 'me',
    text: "I've tried the app",
    time: '09:41 AM',
    avatar: '',
    senderType: 'Angel Investor',
    online: true,
  },
  {
    id: '3',
    sender: 'them',
    text: 'Really?',
    time: '09:41 AM',
    avatar: '',
    senderType: 'Angel Investor',
    online: true,
  },
  {
    id: '4',
    sender: 'me',
    text: "Yeah, It's really good!",
    time: '09:41 AM',
    avatar: '',
    senderType: 'Angel Investor',
    online: true,
  },
  {
    id: '5',
    sender: 'them',
    text: '',
    time: '',
    avatar: '',
    typing: true,
    senderType: 'Angel Investor',
    online: true,
  },
];

export default function ChatPage({
  chatUser,
  setChatOpen,
}: {
  chatUser: Message;
  setChatOpen: (open: boolean) => void;
}) {
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
        senderType: chatUser.senderType,
      },
    ]);
    setInput('');
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}

      {/* Chat body */}
      <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-2">
        <div className="mx-auto my-4 text-xs text-muted-foreground">
          09:41 AM
        </div>
        {messages.map((msg, idx) =>
          msg.typing ? (
            <div key={msg.id} className="flex items-end gap-2 mb-2">
              <div className="flex items-center">
                {msg.avatar ? (
                  <Image
                    src={msg.avatar}
                    alt={msg.sender}
                    width={40}
                    height={40}
                    className="rounded-full object-cover mr-4"
                  />
                ) : (
                  <div className="rounded-full object-cover mr-4 bg-muted aspect-square h-10 w-10 flex items-center justify-center">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
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
              {msg.avatar ? (
                <Image
                  src={msg.avatar}
                  alt={msg.sender}
                  width={40}
                  height={40}
                  className="rounded-full object-cover mr-4"
                />
              ) : (
                <div className="rounded-full object-cover mr-4 bg-muted aspect-square h-10 w-10 flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ) : (
            <div key={msg.id} className="flex items-end gap-2 mb-2">
              {msg.avatar ? (
                <Image
                  src={msg.avatar}
                  alt={msg.sender}
                  width={40}
                  height={40}
                  className="rounded-full object-cover mr-4"
                />
              ) : (
                <div className="rounded-full object-cover mr-4 bg-muted aspect-square h-10 w-10 flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
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
