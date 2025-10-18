import {
  AgentsClient,
  DoneEvent,
  ErrorEvent,
  MessageStreamEvent,
  RunStreamEvent,
} from '@azure/ai-agents';
import { DefaultAzureCredential } from '@azure/identity';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const rl = readline.createInterface({ input, output });
// check if the object is ThreadRun
const isThreadRun = (x) => {
  return x && typeof x.id === "string";
}

const main = async () => {
  const endpoint = process.argv[2];
  if (!endpoint) {
    throw new Error("Missing endpoint argument");
  }
  const agentId = process.argv[3];
  if (!agentId) {
    throw new Error("Please provide the agent ID as a command line argument");
  }

  const client = new AgentsClient(endpoint, new DefaultAzureCredential);

  // retrieve the agent
  const agent = await client.getAgent(agentId);
  if (!agent) {
    throw new Error(`Agent with ID ${agentId} not found.`);
  }

  // create a new thread
  const thread = await client.threads.create();

  console.log("You can start chatting with the agent now.");

  const conversationLoop = async () => {
    const ask = await rl.question("");
    // send a user message to the agent
    const message = await client.messages.create(
      thread.id,
      "user",
      ask,
    );

    const streamEventMessages = await client.runs.create(
      thread.id, // threadId
      agent.id, // agentId
      {
        toolResources: {
          // Pre-approve all MCP tools that are set in the agent
          'mcp': agent.tools.filter(t => 'serverLabel' in t).map((t) => ({
            serverLabel: t.serverLabel,
            requireApproval: 'never',
            headers: {}
          }))
        }
      }
    ).stream();
    for await (const eventMessage of streamEventMessages) {
      switch (eventMessage.event) {
        case RunStreamEvent.ThreadRunCreated:
          // console.warn(`ThreadRun status: ${(eventMessage.data).status}`);
          break;
        case MessageStreamEvent.ThreadMessageDelta:
          {
            const messageDelta = eventMessage.data;
            messageDelta.delta.content.forEach((contentPart) => {
              if (contentPart.type === "text") {
                const textContent = contentPart;
                const textValue = textContent.text?.value || "";
                process.stdout.write(textValue);
              }
            });
          }
          break;
        case RunStreamEvent.ThreadRunCompleted:
          console.log();
          // console.warn("Thread Run Completed");
          break;
        case ErrorEvent.Error:
          // console.warn(`An error occurred. Data ${eventMessage.data}`);
          break;
        case RunStreamEvent.ThreadRunRequiresAction:
          // console.warn("Tool approval required.");
          if (!isThreadRun(eventMessage.data)) {
            // console.warn("Received ThreadRunRequiresAction but event data is not a ThreadRun:", eventMessage.data);
            continue;
          }
          eventMessage.data;
          break;
        case DoneEvent.Done:
          // console.warn("Stream completed.");
          break;
      }
    }
    conversationLoop();
  }
  conversationLoop();
};

main().catch((err) => {
  console.error("Error in conversation:", err);
});