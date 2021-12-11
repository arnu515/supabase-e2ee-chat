import React from "react";
import { Formik, Form, Field } from "formik";
import * as yup from "yup";
import c from "classnames";
import {
  friendRequests as friendRequestsStore,
  refreshFriendRequests,
} from "../../lib/stores/friends";
import { useStore } from "@nanostores/react";
import supabase from "../../lib/supabase";
import { user } from "../../lib/stores/user";

const addFriendSchema = yup.object().shape({
  userId: yup.string().required().uuid().notOneOf(["", user.get()?.id]),
});

const ChatFriends: React.FC = () => {
  const reqs = useStore(friendRequestsStore);
  const [isWorking, setWorking] = React.useState(false);

  async function copyId() {
    function legacyCopyId() {
      // copies user.get().id using document.execCommand
      const el = document.createElement("textarea");
      el.value = user.get()?.id || "";
      el.setAttribute("readonly", "");
      el.style.position = "absolute";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }

    try {
      if ("clipboard" in navigator) {
        await navigator.clipboard.writeText(user.get()?.id || "");
      } else {
        legacyCopyId();
      }
    } catch {
      legacyCopyId();
    }

    alert("Copied!");
  }

  async function accept(id: number) {
    if (isWorking) return;
    setWorking(true);
    const { error } = await supabase.rpc("accept_friend_request", {
      req_id: id,
    });
    setWorking(false);
    if (error) return alert("An error occured" + error.message);
    friendRequestsStore.set(
      friendRequestsStore.get().filter((i) => i.id !== id)
    );
  }

  async function decline(id: number) {
    if (isWorking) return;
    setWorking(true);
    const { error } = await supabase.from("friends").delete().eq("id", id);
    setWorking(false);
    if (error) return alert("An error occured" + error.message);
    friendRequestsStore.set(
      friendRequestsStore.get().filter((i) => i.id !== id)
    );
  }

  async function submit(oppId: string) {
    if (isWorking) return;
    setWorking(true);
    const { data: data1, error: error1 } = await supabase
      .from("friends")
      .select()
      .or(`from_id.eq.${user.get()?.id},to_id.eq.${user.get()?.id}`);
    setWorking(false);
    if (error1) return alert("An error occured" + error1.message);
    if (data1?.length)
      return alert(
        "There already is a request between you both, or you both are already friends."
      );
    setWorking(true);
    const { error } = await supabase
      .from("friends")
      .insert({ from_id: user.get()?.id, to_id: oppId });
    setWorking(false);
    if (error) return alert("An error occured" + error.message);
    alert("Sent request");
    await refreshFriendRequests();
  }

  React.useEffect(() => console.log(reqs), [reqs]);

  return (
    <div className="shadow-lg bg-white border border-transparent rounded-lg h-full w-full flex gap-4 flex-col p-4">
      <h1 className="text-5xl font-bold mb-4 flex">Friends</h1>
      <p className="text-3xl mb-4 flex gap-2">
        Your ID:{" "}
        <code className="bg-gray-200 p-1 rounded">{user.get()?.id}</code>
        <button
          onClick={copyId}
          aria-label="Copy ID"
          title="Copy ID"
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
              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
            />
          </svg>
        </button>
      </p>
      <div>
        <h3 className="text-lg mb-2 uppercase text-gray-500 font-semibold">
          Add friend
        </h3>
        <Formik
          initialValues={{ userId: "" }}
          onSubmit={async (
            values,
            { setSubmitting, setTouched, setValues }
          ) => {
            setSubmitting(true);
            await submit(values.userId);
            setTouched({ userId: false });
            setValues({ userId: "" });
          }}
          validationSchema={addFriendSchema}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="flex gap-4 items-baseline">
              <div className="w-full">
                <Field
                  name="userId"
                  type="text"
                  className="w-full rounded shadow bg-gray-50 outline-none px-3 py-2 border border-gray-500"
                  placeholder="User ID"
                  aria-label="Friend's User ID"
                />
                {errors.userId && touched.userId && (
                  <div className="my-1 text-red-500 text-sm">
                    {errors.userId.replace("emailOrId", "This field")}
                  </div>
                )}
              </div>
              <button
                type="submit"
                className={c(
                  "w-max px-4 py-2 border border-transparent rounded font-semibold text-white transition-colors duration-200",
                  !isSubmitting
                    ? "bg-blue-500 cursor-pointer "
                    : "bg-blue-700 cursor-not-allowed"
                )}
                disabled={isSubmitting}
              >
                {isSubmitting ? "..." : "Add"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
      <div>
        <h3 className="text-lg mb-2 uppercase text-gray-500 font-semibold">
          Pending requests
        </h3>
        <ul className="list-none m-0 p-0">
          {reqs?.map((r) => (
            <li
              key={r.id}
              className="mb-2 flex items-center justify-between px-4 py-2"
            >
              <div className="flex items-center gap-4">
                <img
                  src={r.to_profile.avatar_url}
                  alt={`Avatar of ${r.to_profile.name}`}
                  className="rounded-full border border-transparent shadow w-8"
                />
                <strong>{r.to_profile.name}</strong>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => accept(r.id)}
                  aria-label="Accept"
                  title="Accept"
                  className="p-2 rounded-full cursor-pointer hover:bg-green-100 text-green-500 transition-colors duration-200"
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => decline(r.id)}
                  aria-label="Decline"
                  title="Decline"
                  className="p-2 rounded-full cursor-pointer hover:bg-red-100 text-red-500 transition-colors duration-200"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ChatFriends;
