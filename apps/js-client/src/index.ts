import { BaseHttpAgent, type RunAgentInput } from '@ag-ui/client';

/**
 * Custom HTTP Agent for answer requests
 */
export class AnswerAgent extends BaseHttpAgent {
    protected requestInit(input: RunAgentInput): RequestInit {
        const { params, accessToken } = input.forwardedProps || {};
        return {
            method: 'POST',
            headers: {
                ...this.headers,
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                Accept: 'text/event-stream',
            },
            body: JSON.stringify(params),
            signal: this.abortController.signal,
        };
    }
}

export const createAnswerAgent = (
    agentId: string,
    organizationId: string,
) =>
    new AnswerAgent({
        url: ''
    });