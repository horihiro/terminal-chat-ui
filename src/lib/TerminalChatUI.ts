import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Text, useInput, useApp, useStdout } from 'ink';
import MessageList from '../components/MessageList.js';
import InputBox from '../components/InputBox.js';
import type { Message, TerminalChatUIProps, TerminalSize, ColorScheme } from '../types.js';
import fs from 'fs';

/**
 * Terminal Chat UI Library
 * 
 * A terminal-based chat UI component with strict TypeScript typing
 */
const TerminalChatUI: React.FC<TerminalChatUIProps> = ({
  messages = [],
  onMessageSend,
  title = "Terminal Chat",
  placeholder = "Enter message...",
  showControls = true,
  useAlternateScreen = true,
  colors,
  onExit
}) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [terminalSize, setTerminalSize] = useState<TerminalSize>({ width: 80, height: 24 });
  const { exit } = useApp();
  const { stdout } = useStdout();

  // Terminal control functions
  const initializeTerminal = useCallback(() => {
    if (!useAlternateScreen) return;
    
    // Disable terminal responses that might interfere with display
    if (process.stdin && process.stdin.isTTY) {
      // Disable cursor position reports and other terminal responses
      process.stdin.setRawMode(false);
    }
    
    // Switch to alternate screen buffer
    fs.writeSync(process.stdout.fd, '\x1b[?1049h');
    // Clear screen
    fs.writeSync(process.stdout.fd, '\x1b[2J\x1b[H');
    // Hide cursor
    fs.writeSync(process.stdout.fd, '\x1b[?25l');
    // Disable scrolling
    fs.writeSync(process.stdout.fd, '\x1b[?7l');
  }, [useAlternateScreen]);

  const restoreTerminal = useCallback(() => {
    if (!useAlternateScreen) return;
    
    // Clear alternate screen before switching back
    process.stdout.write('\x1b[2J\x1b[H');
    // Show cursor
    process.stdout.write('\x1b[?25h');
    // Enable scrolling
    process.stdout.write('\x1b[?7h');
    // Return to normal screen buffer (this restores pre-app content automatically)
    process.stdout.write('\x1b[?1049l');
  }, [useAlternateScreen]);

  // Terminal initialization and cleanup
  useEffect(() => {
    // Initialize terminal IMMEDIATELY to prevent any output to normal buffer
    // Note: If called from runTerminalChat, this might be redundant but ensures safety
    if (useAlternateScreen) {
      // Switch to alternate screen buffer BEFORE any React rendering
      process.stdout.write('\x1b[?1049h');
      // Clear screen
      process.stdout.write('\x1b[2J\x1b[H');
      // Hide cursor
      process.stdout.write('\x1b[?25l');
      // Disable scrolling
      process.stdout.write('\x1b[?7l');
    }

    // Setup cleanup function
    const cleanup = () => {
      restoreTerminal();
    };

    // Register cleanup for various exit events
    process.on('exit', cleanup);
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('uncaughtException', (error) => {
      cleanup();
      console.error('Uncaught Exception:', error);
      process.exit(1);
    });
    process.on('unhandledRejection', (reason, promise) => {
      cleanup();
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

    // Cleanup on component unmount
    return () => {
      // Remove existing listeners
      process.off('exit', cleanup);
      process.off('SIGINT', cleanup);
      process.off('SIGTERM', cleanup);
      
      cleanup();
    };
  }, [initializeTerminal, restoreTerminal]);

  // Monitor terminal size and dynamic updates
  useEffect(() => {
    const updateSize = () => {
      const newHeight = stdout?.rows || process.stdout.rows || 24;
      const newWidth = stdout?.columns || process.stdout.columns || 80;
      
      setTerminalSize(prev => {
        if (prev.height !== newHeight || prev.width !== newWidth) {
          return { width: newWidth, height: newHeight };
        }
        return prev;
      });
    };

    // Initial size setting
    updateSize();

    // Listen for resize events
    process.stdout.on('resize', updateSize);
    
    return () => {
      process.stdout.off('resize', updateSize);
    };
  }, [stdout]);

  // Message sending process
  const handleSendMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    
    // Notify external message send event
    if (onMessageSend) {
      onMessageSend(text.trim());
    }
    
    // Clear input field
    setInputValue('');
  }, [onMessageSend]);

  // Exit with Ctrl+C
  useInput((input, key) => {
    if (key.ctrl && input === 'c') {
      if (onExit) {
        onExit();
      } else {
        exit();
      }
    }
  });

  // Calculate message area height (support dynamic size)
  const messageAreaHeight = useMemo(() => 
    Math.max(5, terminalSize.height - 10), [terminalSize.height]);

  // Generate header text
  const headerText = useMemo(() => {
    let text = `📱 ${title} (${terminalSize.width}x${terminalSize.height})`;
    if (showControls) {
      text += " - Ctrl+C to exit";
    }
    return text;
  }, [title, terminalSize.width, terminalSize.height, showControls]);

  return React.createElement(Box, { 
    flexDirection: "column", 
    height: terminalSize.height,
    width: terminalSize.width,
    borderStyle: "single"
  },
    // Header (fixed)
    React.createElement(Box, { 
      paddingX: 1,
      height: 3,
      flexShrink: 0,
      borderStyle: "single",
      borderTop: false,
      borderLeft: false,
      borderRight: false
    },
      React.createElement(Text, { 
        bold: true, 
        color: colors?.header || "blue" 
      }, headerText)
    ),
    
    // Message area (scrollable, calculated fixed height)
    React.createElement(Box, { 
      height: messageAreaHeight,
      flexDirection: "column", 
      paddingX: 1,
      flexShrink: 0,
      borderStyle: "single",
      borderTop: false,
      borderLeft: false,
      borderRight: false,
      borderBottom: false
    },
      React.createElement(MessageList, { 
        messages: [...messages],
        maxHeight: messageAreaHeight,
        terminalWidth: terminalSize.width,
        colors: colors,
      })
    ),
    
    // Input area (fixed, bottom of screen)
    React.createElement(Box, { 
      paddingX: 1,
      height: 3,
      flexShrink: 0,
      borderStyle: "single",
      borderBottom: false,
      borderLeft: false,
      borderRight: false
    },
      React.createElement(InputBox, {
        value: inputValue,
        onChange: setInputValue,
        onSubmit: handleSendMessage,
        placeholder: placeholder,
        colors: colors
      })
    )
  );
};

export default TerminalChatUI;