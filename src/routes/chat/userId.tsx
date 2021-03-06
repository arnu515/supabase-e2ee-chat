import { useStore } from "@nanostores/react";
import { useLiveQuery } from "dexie-react-hooks";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { decodeBase64, encodeBase64 } from "tweetnacl-util";
import Loading from "../../lib/components/Loading";
import { chat } from "../../lib/db";
import { encryptJSON, genKeys, genNonce } from "../../lib/e2e";
import { friends as friendsStore } from "../../lib/stores/friends";
import {
  user as userStore,
  profile as profileStore,
} from "../../lib/stores/user";
import supabase from "../../lib/supabase";
import c from "classnames";
import { chats as chatsStore, refreshChatsStore } from "../../lib/stores/chat";

const ChatUserId: React.FC = () => {
  const [checkingFriend, setCheckingFriend] = React.useState(true);
  const [loading, setLoading] = React.useState(true);
  const user = useStore(userStore);
  const profile = useStore(profileStore);
  const params = useParams();
  const key = useLiveQuery(async () =>
    chat.keys.where("user_id").equals(params.userId!).first()
  );
  const friends = useStore(friendsStore);
  const [friend, setFriend] = React.useState<typeof friends[0] | null>();
  const [friendProfile, setFriendProfile] = React.useState<
    typeof friends[0]["from_profile"] | null
  >();
  const [message, setMessage] = React.useState("");
  const chats = useStore(chatsStore);
  const navigate = useNavigate();

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
  });

  React.useEffect(() => {
    if (friends?.length) {
      const f = friends.find(
        (f) => f.from_id === params.userId || f.to_id === params.userId
      );
      if (!f) {
        navigate("/chat");
        return;
      }
      setFriend(f);
      setFriendProfile(
        f && (f.from_id === params.userId ? f.from_profile : f.to_profile)
      );
      setCheckingFriend(false);
    }
  }, [navigate, friends, params]);

  React.useEffect(() => {
    if (checkingFriend) return;
    if (!user) return;
    console.log({ key });
    if (!key) {
      console.log("sending event");
      supabase
        .from("events")
        .insert({
          from_id: user.id,
          to_id: params.userId!,
          type: "key_request",
          payload: {
            myKey: localStorage.getItem("publicKey"),
          },
        })
        .then(() => console.log("event sent"));
    } else setLoading(false);
  }, [key, params, user, checkingFriend]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    // get the opposite user's public key
    const oppKey = await chat.keys
      .where("user_id")
      .equals(friendProfile!.id)
      .first();
    console.log({ oppKey });
    if (!oppKey) {
      alert("Keys have changed, refreshing the page");
      window.location.reload();
      return;
    }

    // get this user's secret key
    const myKey = localStorage.getItem("secretKey");
    console.log({ myKey });
    if (!myKey) {
      alert("Keys have changed, refreshing the page");
      window.location.reload();
      return;
    }

    // encrypt the message
    const nonce = genNonce();
    const enc = encryptJSON(
      { type: "text", message: message.trim() },
      {
        publicKey: decodeBase64(oppKey.key),
        secretKey: decodeBase64(myKey),
      },
      nonce
    );

    // send to supabase
    const { error } = await supabase.from("chat_messages").insert({
      from_id: user!.id,
      to_id: friendProfile!.id,
      message: enc,
      nonce: encodeBase64(nonce),
    });
    if (error) alert("An error occured: " + error.message);

    // add to indexeddb
    const messages = await chat.chats
      .where("user_id")
      .equals(friendProfile!.id)
      .first();
    if (messages) {
      await chat.chats.update(messages.id as any, {
        id: messages.id,
        user_id: messages.user_id,
        messages: [
          ...messages.messages,
          { type: "text", message: message.trim(), sent: true },
        ],
      });
    } else {
      await chat.chats.add({
        user_id: friendProfile!.id,
        messages: [{ type: "text", message: message.trim(), sent: true }],
      });
    }
    await refreshChatsStore();

    setMessage("");
  }

  async function removeFriend(id: number) {
    const { error } = await supabase.from("friends").delete().eq("id", id);
    if (error) return alert("An error occured" + error.message);
    window.location.reload();
  }

  if (checkingFriend || loading || !friend || !friendProfile)
    return <Loading />;

  return (
    <div
      className="shadow-lg bg-white border border-transparent rounded-lg h-full w-full flex flex-col justify-between overflow-hidden"
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
          src={friendProfile.avatar_url}
          alt={`Avatar of ${friendProfile.name}`}
          className="rounded-full border border-transparent shadow w-8"
        />
        <span className="font-bold text-xl">{friendProfile.name}</span>
        <div className="flex items-center gap-2 ml-auto">
          <button
            aria-label="Remove friend"
            title="Remove friend"
            className="p-2 rounded-full cursor-pointer hover:bg-red-100 text-red-500 transition-colors duration-200"
            onClick={() => removeFriend(friend.id)}
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="h-full flex flex-col gap-4 overflow-auto">
        {chats
          .find((i) => i.user_id === params!.userId)
          ?.messages.map((message, i) =>
            message.sent ? (
              <div className="flex gap-4 items-start mt-2 mx-4" key={i}>
                <img
                  src={profile!.avatar_url}
                  alt={`Avatar of ${profile!.name}`}
                  className="rounded-full border border-transparent shadow w-8"
                />
                <div className="border-2 border-blue-500 bg-blue-100 w-full px-4 py-2">
                  <p className="text-sm text-blue-500 font-bold mb-2">You</p>
                  <p>{message.message}</p>
                </div>
              </div>
            ) : (
              <div className="flex gap-4 items-start mt-2 mx-4" key={i}>
                <img
                  src={friendProfile!.avatar_url}
                  alt={`Avatar of ${friendProfile!.name}`}
                  className="rounded-full border border-transparent shadow w-8"
                />
                <div className="border-2 border-gray-500 bg-gray-100 w-full px-4 py-2">
                  <p className="text-sm text-gray-500 font-bold mb-2">
                    {friendProfile!.name}
                  </p>
                  <p>{message.message}</p>
                </div>
              </div>
            )
          )}
      </div>
      <form onSubmit={sendMessage} className="flex gap-1 items-center">
        <input
          type="text"
          className="border border-gray-500 outline-none rounded m-2 px-4 py-2 text-lg w-full"
          placeholder="Enter a message and press enter"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-label="Message"
        />
        <button
          aria-label="Send message"
          title="Send message"
          className={c(
            "p-2 rounded-full transition-colors duration-200 mr-2",
            message.trim()
              ? "cursor-pointer bg-blue-500 hover:bg-blue-600 text-white"
              : "text-blue-500"
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            style={{ transform: "rotate(90deg)" }}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatUserId;
