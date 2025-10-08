import { runTerminalChat, createMessage } from '../../dist/lib/index.js';
import { spawn } from 'child_process';

let chatProcess = null;
let msg = null;
let timeout = null;
const chatConfig = {
  title: "Simple echo chat",
  placeholder: "type anything...",
  initialMessages: [
    createMessage(1, 'Welcome to Simple echo chat', false),
  ],
  onMessageSend: (messageText, helpers) => {
    // Start the chat process if not already started
    if (!chatProcess) {
      chatProcess = spawn('node', ['examples/stdio-integration/streaming-echo-response.js'], {
        stdio: ['pipe', 'pipe', 'inherit']
      });
      chatProcess.on('error', (err) => {
        console.error('Failed to start subprocess.', err);
      });
      chatProcess.on('exit', (code) => {
        console.log(`Chat process exited with code ${code}`);
        chatProcess = null;
      });
      chatProcess.stdout.on('data', (data) => {
        if (!msg) {
          msg = helpers.addStreamingMessage("", false)
        }
        clearTimeout(timeout);
        if (data.toString() === '\0') {
          msg.complete();
          msg = null;
          return;
        }
        msg.append(data.toString());
        timeout = setTimeout(() => {
          if (msg) {
            msg.complete();
            msg = null;
          }
          timeout = null;
        }, 1000);
      });
    }
    chatProcess.stdin.write(messageText + '\n');
  }
};

// Launch the chat application
runTerminalChat(chatConfig);
