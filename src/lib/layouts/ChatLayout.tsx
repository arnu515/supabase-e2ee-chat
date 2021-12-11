import { useStore } from "@nanostores/react";
import React from "react";
import { Outlet } from "react-router-dom";
import { encodeBase64 } from "tweetnacl-util";
import { chat } from "../db";
import { genKeys } from "../e2e";
import { refreshFriendRequests, refreshFriends } from "../stores/friends";
import { user as userStore } from "../stores/user";
import supabase from "../supabase";
import ChatSidebar from "./ChatSidebar";

const ChatLayout: React.FC = () => {
  const user = useStore(userStore);

  React.useEffect(() => {
    if (!user) return;
    refreshFriendRequests();
    refreshFriends();
    const freqSub = supabase
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
            refreshFriends();
            break;
        }
      })
      .subscribe();
    const eventsSub = supabase
      .from("events")
      .on("INSERT", async (e) => {
        console.log(e);
        if (e.new.to_id !== user.id) return;
        switch (e.new.type) {
          case "key_request":
            {
              let publicKey = localStorage.getItem("publicKey");
              if (!publicKey) {
                const keys = genKeys();
                localStorage.setItem("publicKey", encodeBase64(keys.publicKey));
                localStorage.setItem("secretKey", encodeBase64(keys.secretKey));
                publicKey = encodeBase64(keys.publicKey);
              }
              await supabase.from("events").insert({
                type: "cb:key_request",
                from_id: user.id,
                to_id: e.new.from_id,
                payload: { myKey: publicKey },
              });
              const oppKey = e.new.payload.myKey;
              await chat.keys.put({ key: oppKey, user_id: e.new.from_id });
            }
            break;
          case "cb:key_request":
            {
              const oppKey = e.new.payload.myKey;
              await chat.keys.put({ key: oppKey, user_id: e.new.from_id });
            }
            break;
        }
        await supabase.from("events").delete().eq("id", e.new.id);
      })
      .subscribe();
    return () => {
      supabase.removeSubscription(freqSub);
      supabase.removeSubscription(eventsSub);
    };
  }, [user]);

  React.useEffect(() => {
    // check if there are keys in localstorage, if not, generate new keys
    if (
      !localStorage.getItem("publicKey") ||
      !localStorage.getItem("secretKey")
    ) {
      const keys = genKeys();
      localStorage.setItem("publicKey", encodeBase64(keys.publicKey));
      localStorage.setItem("secretKey", encodeBase64(keys.secretKey));
    }
  }, []);

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
