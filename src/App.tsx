import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "./routes/index";
import "./app.css";
import supabase from "./lib/supabase";
import {
  session,
  user as userStore,
  profile,
  fetchProfile,
} from "./lib/stores/user";
import Loading from "./lib/components/Loading";
import ChatLayout from "./lib/layouts/ChatLayout";
import ChatIndex from "./routes/chat";
import Chat404 from "./routes/chat/_404";
import ChatFriends from "./routes/chat/friends";
import NotFound from "./routes/_404";
import { useStore } from "@nanostores/react";

const App: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  const user = useStore(userStore);

  React.useEffect(() => {
    userStore.set(supabase.auth.user());
    session.set(supabase.auth.session());

    supabase.auth.onAuthStateChange((event, ssn) => {
      if (event === "SIGNED_IN") {
        if (ssn) {
          session.set(ssn);
          userStore.set(ssn.user);
          if (userStore.get() && !profile.get()) fetchProfile();
        } else {
          session.set(null);
          userStore.set(null);
        }
      }
    });
    if (!supabase.auth.user()) setLoading(false);

    if (userStore.get() && !profile.get())
      fetchProfile().then(() => setLoading(false));
  }, []);

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {user && (
              <Route path="/chat/*" element={<ChatLayout />}>
                <Route index element={<ChatIndex />} />
                <Route path="friends" element={<ChatFriends />} />
                <Route path="*" element={<Chat404 />} />
              </Route>
            )}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      )}
    </>
  );
};

export default App;
