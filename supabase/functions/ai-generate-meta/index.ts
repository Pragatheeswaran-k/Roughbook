import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
    // Handle preflight (OPTIONS) request
    if (req.method === "OPTIONS") {
        return new Response("OK", {
            status: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
        });
    }

    try {
        const { content } = await req.json();
        const openaiKey = Deno.env.get("OPENAI_KEY");
        if (!openaiKey) {
          console.error("❌ OPENAI_KEY is missing in environment.");
          return new Response(
              JSON.stringify({
                  error: "OPENAI key missing on server.", // Changed result to error
              }),
              {
                  status: 500, // Changed status to 500 as it's a server config issue
                  headers: {
                      "Content-Type": "application/json",
                      "Access-Control-Allow-Origin": "*",
                  },
              }
          );
      }
      console.log("Received content for AI processing:", content);
        const prompt = `
        You are a helpful assistant that summarizes developer notes and extracts tags.

        Analyze the following content and generate the result in this format:

        ### Title: <short descriptive title>
        ### Summary: <1-2 line summary>
        ### Tags: tag1, tag2, tag3

        Content:
        ${content}
        `;
        const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${openaiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You summarize, generate tags and title for developer notes.",
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                temperature: 0.3,
            }),
        });
        if (!aiResponse.ok) {
          const errorData = await aiResponse.json();
          console.error("❌ OpenAI API Error:", aiResponse.status, errorData);
          return new Response(JSON.stringify({
              error: `OpenAI API Error: ${aiResponse.status} - ${errorData.error?.message || JSON.stringify(errorData)}`
          }), {
              status: aiResponse.status, // Propagate OpenAI's status code
              headers: {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*",
              },
          });
      }

        const data = await aiResponse.json();
        console.log("OpenAI raw response:", data);
        const result = data.choices?.[0]?.message?.content;
        if (!result || result.trim() === "") {
          console.error("❌ OpenAI response content was empty or null.");
          return new Response(JSON.stringify({
              error: "AI did not return a valid summary. Please try again with more content."
          }), {
              status: 500, // Or 400 if you consider it a bad client request for content
              headers: {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*",
              },
          });
      }
        return new Response(JSON.stringify({ result }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*", // Allow frontend
            },
        });
    } catch (err) {
        console.error("Function error:", err);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        });
    }
});