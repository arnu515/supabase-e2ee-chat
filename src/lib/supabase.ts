import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_API_URL!,
  process.env.REACT_APP_SUPABASE_API_KEY!
);

export default supabase;
