// hooks/useXP.ts
import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { getLevelFromXP } from "../utills/xpUtils";

export function useXP(userId: string) {
const supabase = useSupabaseClient();
  const [xp, setXP] = useState(0);
  const [level, setLevel] = useState(1);

  const fetchXP = async () => {
    const { data, error } = await supabase
      .from("user_xp")
      .select("*")
      .eq("id", userId)
      .single();

    if (data) {
      setXP(data.xp);
      setLevel(data.level);
    } else if (!data && !error) {
      // create new XP entry
      await supabase.from("user_xp").insert({
        id: userId,
        xp: 0,
        level: 1,
      });
    }
  };

  const addXP = async (points: number) => {
    const newXP = xp + points;
    const newLevel = getLevelFromXP(newXP);

    setXP(newXP);
    setLevel(newLevel);

    await supabase
      .from("user_xp")
      .upsert({ id: userId, xp: newXP, level: newLevel });
  };

  useEffect(() => {
    if (userId) fetchXP();
  }, [userId]);

  return { xp, level, addXP };
}
