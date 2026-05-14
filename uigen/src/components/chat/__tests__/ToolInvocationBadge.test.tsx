import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

// --- str_replace_editor, state "result" ---

test("shows 'Creating' label for str_replace_editor create command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "c1",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/components/Card.jsx" },
        state: "result",
        result: "Created successfully",
      }}
    />
  );
  expect(screen.getByText("Creating Card.jsx")).toBeDefined();
});

test("shows 'Editing' label for str_replace_editor str_replace command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "c2",
        toolName: "str_replace_editor",
        args: { command: "str_replace", path: "/App.jsx" },
        state: "result",
        result: "Replaced",
      }}
    />
  );
  expect(screen.getByText("Editing App.jsx")).toBeDefined();
});

test("shows 'Editing' label for str_replace_editor insert command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "c3",
        toolName: "str_replace_editor",
        args: { command: "insert", path: "/components/Header.jsx" },
        state: "result",
        result: "Inserted",
      }}
    />
  );
  expect(screen.getByText("Editing Header.jsx")).toBeDefined();
});

test("shows 'Viewing' label for str_replace_editor view command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "c4",
        toolName: "str_replace_editor",
        args: { command: "view", path: "/index.tsx" },
        state: "result",
        result: "file contents",
      }}
    />
  );
  expect(screen.getByText("Viewing index.tsx")).toBeDefined();
});

// --- str_replace_editor, state "call" (in-progress) ---

test("shows 'Creating' label with spinner for in-progress create", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "c5",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/components/Button.tsx" },
        state: "call",
      }}
    />
  );
  expect(screen.getByText("Creating Button.tsx")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("shows 'Editing' label with spinner for in-progress str_replace", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "c6",
        toolName: "str_replace_editor",
        args: { command: "str_replace", path: "/lib/utils.ts" },
        state: "call",
      }}
    />
  );
  expect(screen.getByText("Editing utils.ts")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeDefined();
});

// --- file_manager, state "result" ---

test("shows 'Renaming' label for file_manager rename command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "c7",
        toolName: "file_manager",
        args: { command: "rename", path: "/components/OldName.tsx", new_path: "/components/NewName.tsx" },
        state: "result",
        result: { success: true, message: "Renamed" },
      }}
    />
  );
  expect(screen.getByText("Renaming OldName.tsx")).toBeDefined();
});

test("shows 'Deleting' label for file_manager delete command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "c8",
        toolName: "file_manager",
        args: { command: "delete", path: "/components/Card.jsx" },
        state: "result",
        result: { success: true, message: "Deleted" },
      }}
    />
  );
  expect(screen.getByText("Deleting Card.jsx")).toBeDefined();
});

// --- file_manager, state "call" (in-progress) ---

test("shows 'Renaming' label with spinner for in-progress rename", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "c9",
        toolName: "file_manager",
        args: { command: "rename", path: "/components/OldName.tsx" },
        state: "call",
      }}
    />
  );
  expect(screen.getByText("Renaming OldName.tsx")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeDefined();
});

test("shows 'Deleting' label with spinner for in-progress delete", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "c10",
        toolName: "file_manager",
        args: { command: "delete", path: "/components/Card.jsx" },
        state: "call",
      }}
    />
  );
  expect(screen.getByText("Deleting Card.jsx")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeDefined();
});

// --- Fallback cases ---

test("falls back to toolName for unknown tool", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "c11",
        toolName: "unknown_tool",
        args: {},
        state: "call",
      }}
    />
  );
  expect(screen.getByText("unknown_tool")).toBeDefined();
});

test("falls back to toolName for known tool with unknown command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "c12",
        toolName: "str_replace_editor",
        args: { command: "undo_edit", path: "/App.jsx" },
        state: "call",
      }}
    />
  );
  expect(screen.getByText("str_replace_editor")).toBeDefined();
});

test("falls back to toolName for partial-call with empty args", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "c13",
        toolName: "str_replace_editor",
        args: {},
        state: "partial-call",
      }}
    />
  );
  expect(screen.getByText("str_replace_editor")).toBeDefined();
});

// --- Path/basename extraction ---

test("extracts basename from a deep path", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "c15",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/src/components/ui/Button.tsx" },
        state: "result",
        result: "Created",
      }}
    />
  );
  expect(screen.getByText("Creating Button.tsx")).toBeDefined();
});

test("uses bare filename as-is when no slashes in path", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "c16",
        toolName: "str_replace_editor",
        args: { command: "create", path: "Card.jsx" },
        state: "result",
        result: "Created",
      }}
    />
  );
  expect(screen.getByText("Creating Card.jsx")).toBeDefined();
});

// --- DOM structure ---

test("completed state shows green dot and no spinner", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "c17",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
        state: "result",
        result: "Created",
      }}
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("in-progress state shows spinner and no green dot", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "c18",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
        state: "call",
      }}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("outer container always has inline-flex and font-mono classes", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "c19",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
        state: "call",
      }}
    />
  );
  const outer = container.firstChild as HTMLElement;
  expect(outer.className).toContain("inline-flex");
  expect(outer.className).toContain("font-mono");
});
