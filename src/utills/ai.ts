import { supabase } from "../service/supabaseClient";

export async function generateMetaFromContent(content: string): Promise<{
  title: string;
  summary: string;
  tags: string[];
}> {
  const { data, error } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (!token) {
    throw new Error("User is not authenticated");
  }

  const response = await fetch(
    "https://pcffuwnpkcwsobvqyjir.functions.supabase.co/ai-generate-meta",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    }
  );

  const { result } = await response.json();

  if (!result || typeof result !== "string") {
    throw new Error("AI response was empty or invalid.");
  }

  const titleMatch = result.match(/###\s*Title:\s*(.+)/i);
  const summaryMatch = result.match(/###\s*Summary:\s*(.+)/i);
  const tagsMatch = result.match(/###\s*Tags:\s*(.+)/i);

  return {
    title: titleMatch?.[1]?.trim() ?? "Untitled",
    summary: summaryMatch?.[1]?.trim() ?? "",
    tags: tagsMatch?.[1]?.split(",").map((tag) => tag.trim()) ?? [],
  };
}
