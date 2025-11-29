import { runTerminalChat, createMessage } from '../dist/lib/index.js';

const chatConfig = {
  title: "Simple echo chat",
  placeholder: "type anything...",
  initialMessages: [
    createMessage(1, 'Welcome to Simple echo chat', 2),
  ],
  
  onMessageSend: (messageText, helpers) => {
    // Simple echo response after 0.5s
    setTimeout(() => {
      if (messageText.includes('exit') || messageText.includes('quit')) {
        helpers.addMessage('Good bye!', 1);
        setTimeout(() => process.exit(0), 1000);
      } else {
        helpers.addMessage(`echo: ${messageText}`, 1);
      }
    }, 500);
  }
};

// Launch the chat application
runTerminalChat(chatConfig);