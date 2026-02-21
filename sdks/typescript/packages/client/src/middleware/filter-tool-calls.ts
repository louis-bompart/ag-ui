import { Middleware } from "./middleware";
import { AbstractAgent } from "@/agent";
import {
  RunAgentInput,
  BaseEvent,
  EventType,
  ToolCallStartEvent,
  ToolCallArgsEvent,
  ToolCallEndEvent,
  ToolCallResultEvent,
} from "@ag-ui/core";

type FilterToolCallsConfig =
  | { allowedToolCalls: string[]; disallowedToolCalls?: never }
  | { disallowedToolCalls: string[]; allowedToolCalls?: never };

export class FilterToolCallsMiddleware extends Middleware {
  private blockedToolCallIds = new Set<string>();
  private readonly allowedTools?: Set<string>;
  private readonly disallowedTools?: Set<string>;

  constructor(config: FilterToolCallsConfig) {
    super();

    // Runtime validation (belt and suspenders approach)
    if (config.allowedToolCalls && config.disallowedToolCalls) {
      throw new Error("Cannot specify both allowedToolCalls and disallowedToolCalls");
    }

    if (!config.allowedToolCalls && !config.disallowedToolCalls) {
      throw new Error("Must specify either allowedToolCalls or disallowedToolCalls");
    }

    if (config.allowedToolCalls) {
      this.allowedTools = new Set(config.allowedToolCalls);
    } else if (config.disallowedToolCalls) {
      this.disallowedTools = new Set(config.disallowedToolCalls);
    }
  }

  async *run(input: RunAgentInput, next: AbstractAgent): AsyncIterable<BaseEvent> {
    // Use runNext which already includes transformChunks
    for await (const event of this.runNext(input, next)) {
      // Handle TOOL_CALL_START events
      if (event.type === EventType.TOOL_CALL_START) {
        const toolCallStartEvent = event as ToolCallStartEvent;
        const shouldFilter = this.shouldFilterTool(toolCallStartEvent.toolCallName);

        if (shouldFilter) {
          // Track this tool call ID as blocked
          this.blockedToolCallIds.add(toolCallStartEvent.toolCallId);
          continue; // Filter out this event
        }

        yield event; // Allow this event
        continue;
      }

      // Handle TOOL_CALL_ARGS events
      if (event.type === EventType.TOOL_CALL_ARGS) {
        const toolCallArgsEvent = event as ToolCallArgsEvent;
        if (!this.blockedToolCallIds.has(toolCallArgsEvent.toolCallId)) {
          yield event;
        }
        continue;
      }

      // Handle TOOL_CALL_END events
      if (event.type === EventType.TOOL_CALL_END) {
        const toolCallEndEvent = event as ToolCallEndEvent;
        if (!this.blockedToolCallIds.has(toolCallEndEvent.toolCallId)) {
          yield event;
        }
        continue;
      }

      // Handle TOOL_CALL_RESULT events
      if (event.type === EventType.TOOL_CALL_RESULT) {
        const toolCallResultEvent = event as ToolCallResultEvent;
        const isBlocked = this.blockedToolCallIds.has(toolCallResultEvent.toolCallId);

        if (isBlocked) {
          // Clean up the blocked ID after the last event
          this.blockedToolCallIds.delete(toolCallResultEvent.toolCallId);
          continue;
        }

        yield event;
        continue;
      }

      // Allow all other events through
      yield event;
    }
  }

  private shouldFilterTool(toolName: string): boolean {
    if (this.allowedTools) {
      // If using allowed list, filter out tools NOT in the list
      return !this.allowedTools.has(toolName);
    } else if (this.disallowedTools) {
      // If using disallowed list, filter out tools IN the list
      return this.disallowedTools.has(toolName);
    }

    return false;
  }
}
