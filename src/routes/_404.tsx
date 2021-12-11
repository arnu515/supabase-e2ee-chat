import React from "react";
import { Link, useNavigate } from "react-router-dom";

const _404: React.FC = () => {
  const navigate = useNavigate();

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
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <h1 className="text-gray-500 text-5xl font-bold">404 Not Found</h1>
        <p className="text-2xl">
          Oops! This page does not exist, or you don't have permission to chat
          with this person.
        </p>
        <p className="flex gap-4">
          <button
            onClick={() => navigate(-1)}
            className="block bg-blue-500 rounded text-white px-4 py-2"
          >
            Go back
          </button>
          <Link
            to="/"
            className="block bg-gray-500 rounded text-white px-4 py-2"
          >
            Homepage
          </Link>
        </p>
      </div>
    </div>
  );
};

export default _404;
