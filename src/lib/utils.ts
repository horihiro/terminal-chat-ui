import type { Message } from '../types.js';
import { REGEX_PATTERNS, TERMINAL_CONSTANTS, ANSI_CODES } from './constants.js';
import GraphemeSplitter from 'grapheme-splitter';
import stringWidth from 'string-width';

/**
 * Text processing utilities with multi-byte character support
 */
export class TextUtils {
  /**
   * Calculate text width considering Japanese/multi-byte characters
   */
  static getTextWidth(text: string): number {
    if (!text) return 0;
    return stringWidth(text);
  }

  /**
   * Wrap text with multi-byte character support
   */
  static wrapText(text: string, maxWidth: number): string[] {
    if (!text) return [''];
    if (text.length <= TERMINAL_CONSTANTS.SHORT_MESSAGE_THRESHOLD ||
      maxWidth <= TERMINAL_CONSTANTS.MIN_WRAP_WIDTH) {
      return [text];
    }

    const splitter = new GraphemeSplitter();
    const graphemes = splitter.splitGraphemes(text); // 各グラフェム（絵文字合成含む）
    const lines: string[] = [];
    let currentLine = '';
    let currentWidth = 0;

    for (const g of graphemes) {
      const gw = stringWidth(g); // 正確な表示幅
      if (currentWidth + gw <= maxWidth) {
        currentLine += g;
        currentWidth += gw;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = g;
        currentWidth = gw;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines.length > 0 ? lines : [''];
  }

  /**
   * Format timestamp with user/bot icon
   */
  static formatTimeWithIcon(timestamp: Date, isUser: boolean): string {
    const timeStr = timestamp.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
    const icon = isUser ? TERMINAL_CONSTANTS.USER_ICON : TERMINAL_CONSTANTS.BOT_ICON;
    return `${icon} ${timeStr}`;
  }
}

/**
 * Terminal control utilities
 */
export class TerminalUtils {
  /**
   * Initialize alternate screen buffer
   */
  static initializeAlternateScreen(): void {
    process.stdout.write(ANSI_CODES.ALTERNATE_SCREEN_ON);
    process.stdout.write(ANSI_CODES.CLEAR_SCREEN);
    process.stdout.write(ANSI_CODES.CURSOR_HIDE);
    process.stdout.write(ANSI_CODES.SCROLL_DISABLE);
  }

  /**
   * Restore normal screen buffer
   */
  static restoreNormalScreen(): void {
    process.stdout.write(ANSI_CODES.CLEAR_SCREEN);
    process.stdout.write(ANSI_CODES.CURSOR_SHOW);
    process.stdout.write(ANSI_CODES.SCROLL_ENABLE);
    process.stdout.write(ANSI_CODES.ALTERNATE_SCREEN_OFF);
  }

  /**
   * Get current terminal dimensions
   */
  static getTerminalSize(): { width: number; height: number } {
    return {
      width: process.stdout.columns || TERMINAL_CONSTANTS.DEFAULT_WIDTH,
      height: process.stdout.rows || TERMINAL_CONSTANTS.DEFAULT_HEIGHT
    };
  }
}

/**
 * Message processing utilities
 */
export class MessageUtils {
  /**
   * Generate unique message ID
   */
  static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  /**
   * Create message with validation
   */
  static createMessage(
    id: number | string,
    text: string,
    isUser: boolean = false,
    timestamp: Date = new Date()
  ): Message {
    if (typeof text !== 'string') {
      throw new Error('Message text must be a string');
    }

    return {
      id,
      text: text.trim(),
      isUser,
      timestamp
    };
  }

  /**
   * Create streaming message
   */
  static createStreamingMessage(
    id: number | string,
    isUser: boolean = false,
    timestamp: Date = new Date()
  ): Message {
    return {
      id,
      text: '',
      isUser,
      timestamp,
      isStreaming: true
    };
  }

  /**
   * Calculate optimal message box width
   */
  static calculateMessageBoxWidth(
    message: Message,
    terminalWidth: number,
    isStreaming: boolean = false
  ): number {
    const maxWidth = Math.max(
      TERMINAL_CONSTANTS.MIN_MESSAGE_BOX_WIDTH,
      Math.floor((terminalWidth - TERMINAL_CONSTANTS.MESSAGE_BOX_PADDING) *
        TERMINAL_CONSTANTS.MESSAGE_BOX_WIDTH_RATIO)
    );

    const textWidth = TextUtils.getTextWidth(message.text);

    if (message.isUser && textWidth > TERMINAL_CONSTANTS.SHORT_TEXT_THRESHOLD) {
      // User messages: calculate based on wrapped lines
      const wrappedLines = TextUtils.wrapText(message.text, maxWidth - TERMINAL_CONSTANTS.MESSAGE_PADDING);
      const maxLineWidth = Math.max(...wrappedLines.map(line => TextUtils.getTextWidth(line)));
      return Math.min(maxWidth, maxLineWidth + 4);
    }

    // Bot messages or short text: optimal size based on content
    return Math.min(maxWidth, textWidth + 4);
  }
}

/**
 * Array manipulation utilities (immutable operations)
 */
export class ArrayUtils {
  /**
   * Add message to array immutably
   */
  static addMessage<T>(array: readonly T[], item: T): T[] {
    return [...array, item];
  }

  /**
   * Update message by ID immutably
   */
  static updateMessageById(
    messages: readonly Message[],
    messageId: number | string,
    updater: (message: Message) => Message
  ): Message[] {
    return messages.map(msg =>
      msg.id === messageId ? updater(msg) : msg
    );
  }

  /**
   * Update message text by ID
   */
  static updateMessageText(
    messages: readonly Message[],
    messageId: number | string,
    newText: string
  ): Message[] {
    return ArrayUtils.updateMessageById(messages, messageId, msg => ({
      ...msg,
      text: newText
    }));
  }

  /**
   * Append text to message
   */
  static appendToMessage(
    messages: readonly Message[],
    messageId: number | string,
    appendText: string
  ): Message[] {
    return ArrayUtils.updateMessageById(messages, messageId, msg => ({
      ...msg,
      text: msg.text + appendText
    }));
  }

  /**
   * Complete streaming message
   */
  static completeStreaming(
    messages: readonly Message[],
    messageId: number | string
  ): Message[] {
    return ArrayUtils.updateMessageById(messages, messageId, msg => ({
      ...msg,
      isStreaming: false
    }));
  }

  /**
   * Remove message by ID immutably
   */
  static removeMessage(
    messages: readonly Message[],
    messageId: number | string
  ): Message[] {
    return messages.filter(msg => msg.id !== messageId);
  }
}