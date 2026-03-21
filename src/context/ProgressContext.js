"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthContext";

const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [progress, setProgress] = useState({});
  const [loaded, setLoaded] = useState(false);
  const debounceRef = useRef(null);

  // Load progress: from Supabase if logged in, localStorage if not
  useEffect(() => {
    if (authLoading) return;

    if (user) {
      loadFromSupabase();
    } else {
      // Reset progress on logout (clear localStorage too)
      setProgress({});
      try { localStorage.removeItem("frontend-prep-progress"); } catch {}
      setLoaded(true);
    }
  }, [user, authLoading]);

  const loadFromLocal = () => {
    try {
      const saved = localStorage.getItem("frontend-prep-progress");
      if (saved) setProgress(JSON.parse(saved));
    } catch {}
    setLoaded(true);
  };

  const loadFromSupabase = async () => {
    const { data, error } = await supabase
      .from("user_progress")
      .select("progress")
      .eq("user_id", user.id)
      .single();

    if (data?.progress) {
      setProgress(data.progress);
      // Also keep localStorage in sync as a cache
      try {
        localStorage.setItem("frontend-prep-progress", JSON.stringify(data.progress));
      } catch {}
    } else if (error?.code === "PGRST116") {
      // No row yet — check if there's local progress to migrate
      const localProgress = getLocalProgress();
      if (Object.keys(localProgress).length > 0) {
        // Migrate local progress to Supabase on first login/signup
        await supabase.from("user_progress").insert({
          user_id: user.id,
          progress: localProgress,
          updated_at: new Date().toISOString(),
        });
        setProgress(localProgress);
      } else {
        setProgress({});
      }
    }
    setLoaded(true);
  };

  const getLocalProgress = () => {
    try {
      const saved = localStorage.getItem("frontend-prep-progress");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  };

  // Save to Supabase (debounced) or localStorage
  const saveProgress = useCallback(
    (newProgress) => {
      // Always update localStorage as cache
      try {
        localStorage.setItem("frontend-prep-progress", JSON.stringify(newProgress));
      } catch {}

      if (!user) return;

      // Debounce Supabase writes
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        await supabase
          .from("user_progress")
          .upsert({
            user_id: user.id,
            progress: newProgress,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });
      }, 500);
    },
    [user]
  );

  const markComplete = useCallback((topicId) => {
    setProgress((prev) => {
      const next = { ...prev, [topicId]: true };
      saveProgress(next);
      return next;
    });
  }, [saveProgress]);

  const markIncomplete = useCallback((topicId) => {
    setProgress((prev) => {
      const next = { ...prev };
      delete next[topicId];
      saveProgress(next);
      return next;
    });
  }, [saveProgress]);

  const isComplete = useCallback(
    (topicId) => !!progress[topicId],
    [progress]
  );

  const getDayProgress = useCallback(
    (dayTopicIds) => {
      if (!dayTopicIds.length) return 0;
      const done = dayTopicIds.filter((id) => progress[id]).length;
      return Math.round((done / dayTopicIds.length) * 100);
    },
    [progress]
  );

  const totalCompleted = Object.keys(progress).length;

  return (
    <ProgressContext.Provider
      value={{ progress, markComplete, markIncomplete, isComplete, getDayProgress, totalCompleted, loaded }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be inside ProgressProvider");
  return ctx;
}
