# Terminal Chat UI Library

A Node.js terminal-based chat UI library with scrollable message display, modern interface, and **programmatic message control**.
Provides both JavaScript and TypeScript versions with API-style message manipulation.

## Features

- 📱 **Terminal Native**: Modern chat UI running directly in terminal
- 🚀 **Component Based**: Modern development experience with reusable components
- 💬 **Scrollable**: Full support for message history navigation
- 🌍 **Multilingual**: Complete support for Japanese and other multi-byte characters
- 🎨 **Customizable**: Configurable titles, placeholders, and control display
- 🔧 **Library Ready**: Clean separation of UI and business logic
- 📨 **Streaming Responses**: Real-time typing effects with programmatic control
- 🖥️ **Auto Terminal Control**: Automatic screen buffer and cleanup handling
- 🔧 **Dual Language**: JavaScript and TypeScript versions available
- ⚡ **Message Control API**: Programmatic message update, removal, and management
- 🤖 **"Thinking" Messages**: API for temporary status messages like "考え中..."

## Project Structure

```
src/               # TypeScript version (Main)
├── types.ts       # Type definitions (with Message Control API)
├── components/    # UI components
└── lib/          # Library interface (extended StreamingHelper)

examples/        # Sample applications
├── message-control-demo.js       # Basic message manipulation demo
├── api-integration-demo.js       # Advanced API integration patterns
└── typescript-message-control.ts # Type-safe message control examples
dist/           # TypeScript build output
```

## Installation and Setup

```bash
npm install
```

## Running Demo Applications

**Simple echo bot** (JavaScript):
```bash
node examples/simple-echo.js
```

**Basic Message Control** (JavaScript):
```bash
node examples/message-control-demo.js
```

**API Integration** (JavaScript):
```bash  
node examples/api-integration.js
```

**Type-Safe Message Control** (TypeScript):
```bash
# First build, then run
npm run build
node examples/typescript-message-control.js
```

```javascript
import { runTerminalChat, createMessage } from '../dist/lib/index.js';

const chatConfig = {
  title: "Simple echo chat",
  placeholder: "type anything...",
  initialMessages: [
    createMessage(1, 'Welcome to Simple echo chat', false),
  ],
  
  onMessageSend: (messageText, helpers) => {
    // Simple echo response
    setTimeout(() => {
      if (messageText.includes('exit') || messageText.includes('quit')) {
        helpers.addMessage('Good bye！', false);
        setTimeout(() => process.exit(0), 1000);
      } else {
        helpers.addMessage(`echo: ${messageText}`, false);
      }
    }, 500);
  }
};

// Launch the chat application
runTerminalChat(chatConfig);
```

## Development Mode (File Watching)

```bash
npm run dev:simple      # Simple version development
npm run dev:streaming   # Streaming version development
npm run dev:api         # API integration version development
```

## Message Control API

### 🤖 Programmatic Message Management

This library provides powerful APIs to programmatically control messages, perfect for implementing "thinking" states, progress indicators, and dynamic content updates.

#### MessageController API

```javascript
// Add a message and get a controller
const controller = helpers.addMessage("考え中...", false);

// Update the message
controller.update("思考を整理中...");

// Remove the message  
controller.remove();

// Get message ID
const id = controller.getId();
```

#### StreamingController API

```javascript  
// Add streaming message
const stream = helpers.addStreamingMessage("", false);

// Append text incrementally
stream.append("Loading");
stream.append("...");

// Complete streaming
stream.complete();

// Streaming messages also support MessageController methods
stream.update("Completed!");
stream.remove();
```

#### StreamingHelper Extended API

```javascript
const messageHandler = (message, helpers) => {
  // Basic operations
  const msg1 = helpers.addMessage(text, isUser);
  const stream = helpers.addStreamingMessage(text, isUser);
  
  // Advanced operations
  helpers.updateMessage(id, newText);    // Returns boolean
  helpers.removeMessage(id);             // Returns boolean  
  helpers.getMessageById(id);            // Returns Message | undefined
};
```

### 🎯 Practical Examples

#### "Thinking" Message Pattern

```javascript
const showThinking = (helpers) => {
  const thinking = helpers.addMessage("🤔 考え中...", false);
  
  setTimeout(() => thinking.update("💭 思考を整理中..."), 1000);
  setTimeout(() => thinking.update("✨ 回答を準備中..."), 2000);
  setTimeout(() => {
    thinking.remove();
    helpers.addMessage("お答えします！", false);
  }, 3000);
};
```

#### Multi-Step Process

```javascript
const multiStepProcess = (helpers) => {
  const steps = [
    helpers.addMessage("Step 1: データ収集中...", false),
    helpers.addMessage("Step 2: 処理中...", false), 
    helpers.addMessage("Step 3: 完了準備中...", false)
  ];
  
  steps.forEach((step, i) => {
    setTimeout(() => {
      step.update(`Step ${i+1}: 完了 ✅`);
      if (i === steps.length - 1) {
        setTimeout(() => {
          steps.forEach(s => s.remove());
          helpers.addMessage("🎉 全工程完了！", false);
        }, 1000);
      }
    }, (i + 1) * 1000);
  });
};
```

## Using as a Library

### 🎯 Simple Configuration Version (No framework knowledge required!)

```javascript
#!/usr/bin/env node
import { runTerminalChat, createMessage } from './dist/lib/index.js';

// Complete chat app with just configuration object!
const chatConfig = {
  title: "My Chat App",
  placeholder: "Type something...",
  initialMessages: [
    createMessage(1, 'Welcome!', false)
  ],
  
  onMessageSend: (messageText, helpers) => {
    // Show "thinking" state
    const thinking = helpers.addMessage("考え中...", false);
    
    setTimeout(() => {
      thinking.remove();
      helpers.addMessage(`Response: ${messageText}`);
    }, 2000);
  }
};

// Launch with one line! No need to understand frameworks
runTerminalChat(chatConfig);
```


## Project Structure

```
├── src/                           # Library source code
│   ├── lib/                       # Library core
│   │   ├── TerminalChatUI.ts      # Main UI component
│   │   └── index.ts               # Exports and utilities
│   └── components/                # Internal components
│       ├── MessageList.ts         # Message display
│       └── InputBox.ts            # Input field
├── examples/                      # Usage examples & demo apps
│   ├── simple-echo.js             # Simple echo
│   ├── streaming-chat.js          # Streaming response
│   ├── api-integration.js         # External API integration
│   └── README.md                  # Sample descriptions
└── README.md                      # This file
```

## Controls

- **Send Message**: Type and press Enter
- **Scroll**: ↑/↓ keys, PageUp/PageDown keys
- **Exit**: Ctrl+C

## Tech Stack

- **Node.js**: JavaScript runtime environment
- **ES Modules**: Modern JavaScript module system
- **Terminal Control**: ANSI escape sequences for screen management

## License

MIT License