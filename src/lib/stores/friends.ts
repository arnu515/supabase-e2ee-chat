import { atom } from "nanostores";
import { Friend } from "../dbtypes";
import supabase from "../supabase";
import { user as userStore } from "./user";

export const friendRequests = atom<Friend[]>();

export async function refreshFriendRequests() {
  const user = userStore.get();
  if (!user) return;
  const { data: requests, error } = await supabase
    .from("friends")
    .select("id,from_id,to_id,created_at,to_profile:to_id(*)")
    .eq("to_id", user.id);
  if (error) return alert("An error occured: " + error.message);
  if (!requests) return;
  console.log({ data: requests });
  friendRequests.set(requests);
}
