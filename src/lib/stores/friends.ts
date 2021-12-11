import { atom } from "nanostores";
import { Friend } from "../dbtypes";
import supabase from "../supabase";
import { user as userStore } from "./user";

export const friendRequests = atom<Friend[]>();
export const friends = atom<Friend[]>();

export async function refreshFriendRequests() {
  const user = userStore.get();
  if (!user) return;
  const { data: requests, error } = await supabase
    .from("friends")
    .select(
      "id,from_id,to_id,created_at,to_profile:to_id(*),from_profile:from_id(*)"
    )
    .eq("to_id", user.id)
    .eq("accepted", false);
  if (error) return alert("An error occured: " + error.message);
  if (!requests) return;
  console.log({ requests });
  friendRequests.set(requests);
}

export async function refreshFriends() {
  const user = userStore.get();
  if (!user) return;
  const { data: f, error } = await supabase
    .from("friends")
    .select(
      "id,from_id,to_id,created_at,to_profile:to_id(*),from_profile:from_id(*)"
    )
    .or(`from_id.eq.${user.id},to_id.eq.${user.id}`)
    .eq("accepted", true);
  if (error) return alert("An error occured: " + error.message);
  if (!f) return;
  console.log({ friends: f });
  friends.set(f);
}
