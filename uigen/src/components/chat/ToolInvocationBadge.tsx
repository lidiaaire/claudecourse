import type { DynamicToolUIPart } from "ai";
import { Loader2 } from "lucide-react";

interface ToolInvocationBadgeProps {
  part: DynamicToolUIPart;
}

function deriveLabel(part: DynamicToolUIPart): string {
  const { toolName } = part;
  const args = part.input as any;
  const command: string | undefined = args?.command;
  const path: string | undefined = args?.path;

  const filename = path
    ? path.split("/").filter(Boolean).pop() ?? path
    : undefined;

  if (toolName === "str_replace_editor") {
    if (command === "create" && filename) return `Creating ${filename}`;
    if ((command === "str_replace" || command === "insert") && filename)
      return `Editing ${filename}`;
    if (command === "view" && filename) return `Viewing ${filename}`;
  }

  if (toolName === "file_manager") {
    if (command === "rename" && filename) return `Renaming ${filename}`;
    if (command === "delete" && filename) return `Deleting ${filename}`;
  }

  return toolName;
}

export function ToolInvocationBadge({ part }: ToolInvocationBadgeProps) {
  const label = deriveLabel(part);
  const isDone = part.state === "output-available" && part.output != null;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-neutral-700">{label}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{label}</span>
        </>
      )}
    </div>
  );
}
