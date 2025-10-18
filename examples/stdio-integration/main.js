// This script demonstrates integration a chat console UI with an external chat process using stdio.
import { runTerminalChat, createMessage } from '../../dist/lib/index.js';
import { spawn } from 'child_process';

// Launch the chat console application
const argv = process.argv[2].split(' ');
console.log("Launching chat program by the following arguments:", argv);
const chatProcess = spawn(argv[0], [
  ...argv.splice(1)
], {
  stdio: ['pipe', 'pipe', 'pipe']
});

console.log("Waiting for completing to start chat program that integrates by stdio integration...");
// Wait for the initial message from the chat process via stdout or stderr
const handleChatProcessCompleted = (data) => {
  chatProcess.stdout.off('data', handleChatProcessCompleted);
  chatProcess.stderr.off('data', handleChatProcessCompleted);
  console.log("Done.");

  const chatConfig = {
    title: "Simple echo chat",
    placeholder: "type anything...",
    initialMessages: [
      createMessage(1, data.toString(), false)
    ],
    onMessageSend: (messageText, helpers) => {
      let msg = null;
      let timeout = null;
      let isEndsWithNewLine = false;
      // Start the chat process if not already started
      chatProcess.on('error', (err) => {
        helpers.addMessage(`Failed to start subprocess. ${err.message}`, false);
      });
      chatProcess.on('exit', (code) => {
        helpers.addMessage(`Chat process exited with code ${code}`, false);
      });
      const stdoutDataHandler = (data) => {
        if (!msg) {
          msg = helpers.addStreamingMessage("", false);
          isEndsWithNewLine = false;
        }
        clearTimeout(timeout);
        if (data.toString() === '\0') {
          msg.complete();
          msg = null;
          chatProcess.stdout.off('data', stdoutDataHandler);
          return;
        }
        // isEndsWithNewLine && msg.append('\n');
        isEndsWithNewLine = data.toString().endsWith('\n');
        msg.append(data.toString().replace(/\n$/, ''));
        timeout = setTimeout(() => {
          timeout = null;
          chatProcess.stdout.off('data', stdoutDataHandler);
          if (!msg) return;

          msg.complete();
          msg = null;
        }, 1000);
      };
      chatProcess.stdout.on('data', stdoutDataHandler);
      chatProcess.stdin.write(messageText + '\n');
    }
  };
  // Start the terminal chat UI
  runTerminalChat(chatConfig);
};

chatProcess.stdout.on('data', handleChatProcessCompleted);
chatProcess.stderr.on('data', handleChatProcessCompleted);
