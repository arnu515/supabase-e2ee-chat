import { useStore } from "@nanostores/react";
import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { friends as friendsStore } from "../stores/friends";
import { profile as profileStore, user } from "../stores/user";
import c from "classnames";
import { newChats as newChatsStore } from "../stores/chat";

const ChatSidebar: React.FC = () => {
  const profile = useStore(profileStore);
  const friends = useStore(friendsStore);
  const navigate = useNavigate();
  const params = useParams();
  const newChats = useStore(newChatsStore);

  if (!profile) return null;

  return (
    <nav
      className="shadow-lg bg-white border border-transparent rounded-lg overflow-auto"
      style={{ maxHeight: "calc(100vh - 1rem)" }}
    >
      <div
        className="border-b border-gray-300 p-4 flex items-center gap-4"
        style={{
          borderTopLeftRadius: "0.5rem",
          borderTopRightRadius: "0.5rem",
        }}
      >
        <img
          src={profile.avatar_url}
          alt={`Avatar of ${profile.name}`}
          className="rounded-full border border-transparent shadow w-8"
        />
        <span className="font-bold text-xl">{profile.name}</span>
        <div className="ml-auto flex items-center gap-2">
          <Link
            aria-label="Add friend"
            title="Add friend"
            to="/chat/friends"
            className="p-2 rounded-full cursor-pointer hover:bg-gray-100 transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </Link>
          <Link
            aria-label="Settings"
            title="Settings"
            to="/chat/settings"
            className="p-2 rounded-full cursor-pointer hover:bg-gray-100 transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </Link>
        </div>
      </div>
      <ul className="list-none m-0 p-0">
        {friends?.map((friend) => {
          const p =
            friend.to_id === user.get()?.id
              ? { ...friend.from_profile }
              : { ...friend.to_profile };
          return (
            <li
              onClick={() => {
                newChatsStore.set(newChats.filter((i) => i !== p.id));
                params.userId !== p.id && navigate(`/chat/${p.id}`);
              }}
              className={c(
                "mb-2 w-full flex items-center justify-between px-4 py-2 transition-colors duration-200 border-b border-gray-100",
                newChats.find((i) => i === p.id) && "bg-yellow-200",
                params.userId === p.id
                  ? "bg-gray-200"
                  : "hover:bg-gray-200 cursor-pointer"
              )}
              key={p.id}
            >
              <div className="flex items-center gap-4">
                <img
                  src={p.avatar_url}
                  alt={`Avatar of ${p.name}`}
                  className="rounded-full border border-transparent shadow w-8"
                />
                <span>{p.name}</span>
              </div>
              <div className="flex items-center gap-2"></div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default ChatSidebar;
