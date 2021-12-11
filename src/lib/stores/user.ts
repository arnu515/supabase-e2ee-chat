import { atom } from "nanostores";
import type { Session, User } from "@supabase/supabase-js";
import { Profile } from "../dbtypes";
import supabase from "../supabase";

export const session = atom<Session | null>(null);
export const user = atom<User | null>(null);
export const profile = atom<Profile | null>(null);

export async function fetchProfile() {
  if (user.get()) {
    if (profile.get()) return;
    // fetch the user's profile
    const { data, error } = await supabase
      .from("profiles")
      .select()
      .eq("id", user.get()!.id);
    if (error) return alert("An error occured: " + error.message);
    profile.set(data?.[0]);
  }
}
