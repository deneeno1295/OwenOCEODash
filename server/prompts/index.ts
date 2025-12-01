/**
 * Prompts Index
 * Export all prompt templates
 */

export * from "./equity-research";
export * from "./startup-research";
export * from "./key-people-research";

// Helper function to substitute placeholders in prompts
export function substitutePrompt(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  }
  return result;
}

