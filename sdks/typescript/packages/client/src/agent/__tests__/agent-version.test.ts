import { AbstractAgent } from "@/agent";
import { BaseEvent, RunAgentInput } from "@ag-ui/core";
import packageJson from "../../../package.json";

describe("AbstractAgent maxVersion default", () => {
  class VersionAgent extends AbstractAgent {
    async *run(input: RunAgentInput): AsyncIterable<BaseEvent> {
      // empty
    }
  }

  it("uses the package.json version by default", () => {
    const agent = new VersionAgent();
    expect(agent.maxVersion).toBe(packageJson.version);
  });
});
