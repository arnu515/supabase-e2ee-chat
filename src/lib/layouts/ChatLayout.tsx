import { useStore } from "@nanostores/react";
import React from "react";
import { Outlet } from "react-router-dom";
import { refreshFriendRequests } from "../stores/friends";
import { user as userStore } from "../stores/user";
import supabase from "../supabase";
import ChatSidebar from "./ChatSidebar";

const ChatLayout: React.FC = () => {
  const user = useStore(userStore);

  React.useEffect(() => {
    if (!user) return;
    refreshFriendRequests();
    const subscription = supabase
      .from("friends")
      .on("*", (e) => {
        console.log(e);
        switch (e.eventType) {
          case "INSERT":
            if (e.new.to_id !== user.id) return;
            refreshFriendRequests();
            alert("You have a new friend request!");
            break;
          case "DELETE":
            if (e.old.from_id !== user.id) return;
            refreshFriendRequests();
            alert("One of your requests were declined!");
            break;
          case "UPDATE":
            if (e.old.from_id !== user.id) return;
            refreshFriendRequests();
            alert("One of your requests were accepted!");
            break;
        }
      })
      .subscribe();
    return () => {
      supabase.removeSubscription(subscription);
    };
  }, [user]);

  return (
    <div
      className="bg-gray-200 p-4 h-screen w-full grid gap-4"
      style={{ gridTemplateColumns: "400px auto" }}
    >
      <ChatSidebar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default ChatLayout;
