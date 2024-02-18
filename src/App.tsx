import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { ReloadIcon } from "@radix-ui/react-icons";

const BUILDSHIP_API = "https://j1bm7e.buildship.run/chat-streaming";

function App() {
  const [submitting, setSubmitting] = useState(false);
  const [value, setvalue] = useState("");
  const [streamingEnabled, setStreamingEnabled] = useState(false);

  const generate = async () => {
    setvalue("");
    setSubmitting(true);
    try {
      const response = await fetch(BUILDSHIP_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          streaming: streamingEnabled,
        }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      if (!streamingEnabled) {
        const data = await response.text();
        setvalue(data);
        return;
      }

      const reader = response
        .body!.pipeThrough(new TextDecoderStream())
        .getReader();
      let done: boolean | undefined;
      let value: string | undefined;
      while ((({ done, value } = await reader.read()), !done)) {
        console.log("Received: ", value);
        setvalue((prev) => prev + (value || ""));
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="font-roboto">
      <div className="max-w-3xl mx-auto p-8 border my-10 rounded">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">📖 Story Generator</h1>
          <p className="text-muted-foreground">
            Yet another AI powered short story generator.
          </p>
        </div>
        <div className="max-h-[400px] overflow-scroll">
          <p className="text-muted-foreground pb-2">Your Story:</p>
          <div className="leading-relaxed">{value}</div>
        </div>
        <div className="mt-8">
          <div className="flex space-x-3 mb-4">
            <Switch
              checked={streamingEnabled}
              onCheckedChange={(checked) => setStreamingEnabled(checked)}
            />{" "}
            <p>Streaming</p>
          </div>
          <Button
            variant="outline"
            className="px-14"
            onClick={generate}
            disabled={submitting}
          >
            {submitting ? "Generating" : "Generate Random Story"}
            {submitting && (
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin ml-2" />
            )}
          </Button>
        </div>
      </div>
      <div className="flex space-x-1 mt-8 justify-center">
        <p>Powered by</p>
        <img
          src="https://static-00.iconduck.com/assets.00/openai-icon-2021x2048-4rpe5x7n.png"
          alt=""
          width={25}
        />
        <img
          src="https://framerusercontent.com/images/lQcSTYgP7VzZ0NdMzHsgUL2SpE.png"
          alt=""
          width={25}
        />
      </div>
    </div>
  );
}

export default App;
