import React from "react";

const ChatIndex: React.FC = () => {
  return (
    <div className="grid w-full h-full place-items-center">
      <div className="p-4 flex flex-col items-center justify-center gap-4 text-center text-gray-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-32 w-32"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
        <h1 className="text-gray-500 text-5xl font-bold">Chat</h1>
        <p className="text-2xl">Use the sidebar on the left</p>
      </div>
    </div>
  );
};

export default ChatIndex;
