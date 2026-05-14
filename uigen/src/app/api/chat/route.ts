import type { FileNode } from "@/lib/file-system";
import { VirtualFileSystem } from "@/lib/file-system";
import { streamText, convertToModelMessages } from "ai";
import type { UIMessage } from "ai";
import { buildStrReplaceTool } from "@/lib/tools/str-replace";
import { buildFileManagerTool } from "@/lib/tools/file-manager";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getLanguageModel } from "@/lib/provider";
import { generationPrompt } from "@/lib/prompts/generation";

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch (e) {
    console.error("Failed to parse request body:", e);
    return new Response("Bad request", { status: 400 });
  }

  const { messages, files, projectId } = body as {
    messages: UIMessage[];
    files: Record<string, FileNode>;
    projectId?: string;
  };

  const fileSystem = new VirtualFileSystem();
  fileSystem.deserializeFromNodes(files);

  const model = getLanguageModel();
  const isMockProvider = !process.env.ANTHROPIC_API_KEY;

  let coreMessages;
  try {
    coreMessages = convertToModelMessages(messages);
  } catch (e) {
    console.error("convertToModelMessages failed:", e);
    return new Response(String(e), { status: 500 });
  }

  const result = streamText({
    model,
    system: generationPrompt,
    messages: coreMessages,
    maxTokens: 10_000,
    maxSteps: isMockProvider ? 4 : 40,
    onError: (err: any) => {
      console.error(err);
    },
    tools: {
      str_replace_editor: buildStrReplaceTool(fileSystem),
      file_manager: buildFileManagerTool(fileSystem),
    },
    onFinish: async () => {
      if (projectId) {
        try {
          const session = await getSession();
          if (!session) {
            console.error("User not authenticated, cannot save project");
            return;
          }
          await prisma.project.update({
            where: { id: projectId, userId: session.userId },
            data: {
              messages: JSON.stringify(messages),
              data: JSON.stringify(fileSystem.serialize()),
            },
          });
        } catch (error) {
          console.error("Failed to save project data:", error);
        }
      }
    },
  });

  try {
    return result.toUIMessageStreamResponse();
  } catch (e) {
    console.error("toUIMessageStreamResponse failed:", e);
    return new Response(String(e), { status: 500 });
  }
}

export const maxDuration = 120;
