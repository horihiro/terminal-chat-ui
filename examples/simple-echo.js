import { runTerminalChat, createMessage } from '../dist/lib/index.js';

const chatConfig = {
  title: "Simple echo chat",
  placeholder: "type anything...",
  initialMessages: [
    createMessage(1, 'Welcome to Simple echo chat', false),
  ],
  
  onMessageSend: (messageText, helpers) => {
    // Simple echo response after 0.5s
    setTimeout(() => {
      if (messageText.includes('exit') || messageText.includes('quit')) {
        helpers.addMessage('Good bye!', false);
        setTimeout(() => process.exit(0), 1000);
      } else {
        helpers.addMessage(`echo: ${messageText}`, false);
      }
    }, 500);
  }
};

// Launch the chat application
runTerminalChat(chatConfig);