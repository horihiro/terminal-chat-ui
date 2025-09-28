// Terminal chat UI library - Main exports
export { default as TerminalChatUI } from './TerminalChatUI.js';

// Re-export utilities for external use
export {
  TextUtils,
  TerminalUtils,
  MessageUtils,
  ArrayUtils
} from './utils.js';

export {
  TERMINAL_CONSTANTS,
  ANSI_CODES,
  DEFAULT_COLORS,
  REGEX_PATTERNS
} from './constants.js';

// Import utilities for internal use
import { TextUtils, TerminalUtils, MessageUtils, ArrayUtils } from './utils.js';

// Import and export TypeScript type definitions
export type { 
  Message, 
  StreamingHelper, 
  StreamingController,
  MessageController,
  ChatConfig, 
  ColorScheme,
  ChatComponentFunction,
  ChatConfigOrFunction,
  MessageSendHandler,
  ExitHandler,
  TerminalSize,
  TerminalChatUIProps,
  MessageListProps,
  InputBoxProps
} from '../types.js';

// Simple startup helper function - Hide React/ink complexity
export const runTerminalChat = async (chatConfig: import('../types.js').ChatConfigOrFunction): Promise<void> => {
  const React = await import('react');
  const { render } = await import('ink');
  const { TerminalUtils, MessageUtils, ArrayUtils } = await import('./utils.js');
  
  // Determine config object
  let config: import('../types.js').ChatConfig;
  if (typeof chatConfig === 'function') {
    config = chatConfig();
  } else {
    config = chatConfig;
  }
  
  // Pre-initialize alternate screen if enabled to prevent initial output to normal buffer
  const useAlternateScreen = config?.useAlternateScreen !== false; // default true
  if (useAlternateScreen) {
    TerminalUtils.initializeAlternateScreen();
  }
  
  try {
    const { default: TerminalChatUI } = await import('./TerminalChatUI.js');
    const { useState, useCallback } = React;
    
    // Get necessary values from configuration
    const {
      title = "Terminal Chat",
      placeholder = "Enter message...",
      onMessageSend,
      initialMessages = [],
      showControls = true,
      colors,
      onExit
    } = config;

    // Dynamically create React component
    const ChatApp = () => {
      const [messages, setMessages] = useState<import('../types.js').Message[]>([...initialMessages]);
      let messageIdCounter = initialMessages.length + 1;

      const handleMessageSend = useCallback((messageText: string) => {
          // Add user message
          const userMessage = MessageUtils.createMessage(messageIdCounter++, messageText, true);
          setMessages((prev: import('../types.js').Message[]) => ArrayUtils.addMessage(prev, userMessage));

          if (onMessageSend) {
            // Pass helper to callback function
            onMessageSend(messageText, {
              addMessage: (text: string, isUser = false) => {
                const botMessage = MessageUtils.createMessage(messageIdCounter++, text, isUser);
                setMessages((prev: import('../types.js').Message[]) => ArrayUtils.addMessage(prev, botMessage));
                
                // Return MessageController
                return {
                  update: (newText: string) => {
                    setMessages((prev: import('../types.js').Message[]) => 
                      ArrayUtils.updateMessageText(prev, botMessage.id, newText));
                  },
                  remove: () => {
                    setMessages((prev: import('../types.js').Message[]) => 
                      ArrayUtils.removeMessage(prev, botMessage.id));
                  },
                  getId: () => botMessage.id
                };
              },
              addStreamingMessage: (text = '', isUser = false) => {
                const streamingId = messageIdCounter++;
                const streamingMessage = MessageUtils.createStreamingMessage(streamingId, isUser);
                setMessages((prev: import('../types.js').Message[]) => ArrayUtils.addMessage(prev, streamingMessage));

                return {
                  append: (appendText: string) => {
                    setMessages((prev: import('../types.js').Message[]) => ArrayUtils.appendToMessage(prev, streamingId, appendText));
                  },
                  complete: () => {
                    setMessages((prev: import('../types.js').Message[]) => ArrayUtils.completeStreaming(prev, streamingId));
                  },
                  update: (newText: string) => {
                    setMessages((prev: import('../types.js').Message[]) => 
                      ArrayUtils.updateMessageText(prev, streamingId, newText));
                  },
                  remove: () => {
                    setMessages((prev: import('../types.js').Message[]) => 
                      ArrayUtils.removeMessage(prev, streamingId));
                  },
                  getId: () => streamingId
                };
              },
              updateMessage: (id: string | number, text: string) => {
                const prevMessages = messages;
                setMessages((prev: import('../types.js').Message[]) => 
                  ArrayUtils.updateMessageText(prev, id, text));
                return prevMessages.some(msg => msg.id === id);
              },
              removeMessage: (id: string | number) => {
                const prevMessages = messages;
                setMessages((prev: import('../types.js').Message[]) => 
                  ArrayUtils.removeMessage(prev, id));
                return prevMessages.some(msg => msg.id === id);
              },
              getMessageById: (id: string | number) => {
                return messages.find(msg => msg.id === id);
              }
            });
          }
        }, []);

        return React.createElement(TerminalChatUI, {
          messages: messages,
          onMessageSend: handleMessageSend,
          title,
          placeholder,
          showControls,
          useAlternateScreen,
          colors,
          onExit
        });
      };

      const app = render(React.createElement(ChatApp));
      return app.waitUntilExit();
      
  } catch (error) {
    // Restore terminal on error if alternate screen was initialized
    if (useAlternateScreen) {
      TerminalUtils.restoreNormalScreen();
    }
    console.error('Failed to start chat application:', error);
    process.exit(1);
  }
};

// Legacy utility functions for backward compatibility
// These now delegate to the new utils classes
export const createMessage = MessageUtils.createMessage;
export const addMessageToArray = ArrayUtils.addMessage;
export const generateMessageId = MessageUtils.generateId;
export const updateMessageText = ArrayUtils.updateMessageText;
export const appendToMessage = ArrayUtils.appendToMessage;
export const createStreamingMessage = MessageUtils.createStreamingMessage;
export const completeStreaming = ArrayUtils.completeStreaming;