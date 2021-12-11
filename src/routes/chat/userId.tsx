import { useStore } from "@nanostores/react";
import { useLiveQuery } from "dexie-react-hooks";
import React from "react";
import { useParams } from "react-router-dom";
import { encodeBase64 } from "tweetnacl-util";
import Loading from "../../lib/components/Loading";
import { chat } from "../../lib/db";
import { genKeys } from "../../lib/e2e";
import { user as userStore } from "../../lib/stores/user";
import supabase from "../../lib/supabase";

const ChatUserId: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  const user = useStore(userStore);
  const params = useParams();
  const key = useLiveQuery(async () =>
    chat.keys.where("user_id").equals(params.userId!).first()
  );

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
  }, [key, params, user]);

  if (loading) return <Loading />;

  return (
    <div className="shadow-lg bg-white border border-transparent rounded-lg h-full w-full flex gap-4 flex-col p-4"></div>
  );
};

export default ChatUserId;
