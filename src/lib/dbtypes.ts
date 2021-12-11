export interface Profile {
  id: string;
  name: string;
  avatar_url: string;
  created_at: string;
}

export interface Friend {
  id: number;
  from_id: string;
  to_id: string;
  created_at: string;
  to_profile: Profile;
}
