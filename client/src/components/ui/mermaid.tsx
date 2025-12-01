import { useState, useEffect, useRef } from "react";
import mermaid from "mermaid";

// Initialize with light theme for Salesforce style
mermaid.initialize({
  startOnLoad: true,
  theme: "default", // Switch to default (light) theme
  securityLevel: "loose",
  themeVariables: {
    darkMode: false,
    background: "#FFFFFF",
    primaryColor: "#0176D3",
    secondaryColor: "#F3F4F6",
    tertiaryColor: "#FFFFFF",
    primaryTextColor: "#080707",
    secondaryTextColor: "#64748b",
    tertiaryTextColor: "#64748b",
    lineColor: "#cbd5e1",
  },
});

interface MermaidProps {
  chart: string;
}

export function Mermaid({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [id] = useState(`mermaid-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (ref.current) {
      // Re-render mermaid when chart changes
      ref.current.innerHTML = '';
      mermaid.render(id, chart).then((result) => {
        ref.current!.innerHTML = result.svg;
      });
    }
  }, [chart, id]);

  return <div key={chart} className="mermaid flex justify-center p-4 w-full" ref={ref} />;
}
