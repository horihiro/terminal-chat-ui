import { REGEX_PATTERNS, TERMINAL_CONSTANTS, ANSI_CODES } from './constants.js';
/**
 * Text processing utilities with multi-byte character support
 */
export class TextUtils {
    /**
     * Calculate text width considering Japanese/multi-byte characters
     */
    static getTextWidth(text) {
        if (!text)
            return 0;
        let width = 0;
        for (const char of text) {
            width += REGEX_PATTERNS.JAPANESE_CHARS.test(char) ? 2 : 1;
        }
        return width;
    }
    /**
     * Wrap text with multi-byte character support
     */
    static wrapText(text, maxWidth) {
        if (!text)
            return [''];
        if (text.length <= TERMINAL_CONSTANTS.SHORT_MESSAGE_THRESHOLD ||
            maxWidth <= TERMINAL_CONSTANTS.MIN_WRAP_WIDTH) {
            return [text];
        }
        const lines = [];
        let currentLine = '';
        let currentWidth = 0;
        for (const char of text) {
            const charWidth = REGEX_PATTERNS.JAPANESE_CHARS.test(char) ? 2 : 1;
            if (currentWidth + charWidth <= maxWidth) {
                currentLine += char;
                currentWidth += charWidth;
            }
            else {
                if (currentLine)
                    lines.push(currentLine);
                currentLine = char;
                currentWidth = charWidth;
            }
        }
        if (currentLine)
            lines.push(currentLine);
        return lines.length > 0 ? lines : [''];
    }
    /**
     * Format timestamp with user/bot icon
     */
    static formatTimeWithIcon(timestamp, isUser) {
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
    static initializeAlternateScreen() {
        process.stdout.write(ANSI_CODES.ALTERNATE_SCREEN_ON);
        process.stdout.write(ANSI_CODES.CLEAR_SCREEN);
        process.stdout.write(ANSI_CODES.CURSOR_HIDE);
        process.stdout.write(ANSI_CODES.SCROLL_DISABLE);
    }
    /**
     * Restore normal screen buffer
     */
    static restoreNormalScreen() {
        process.stdout.write(ANSI_CODES.CLEAR_SCREEN);
        process.stdout.write(ANSI_CODES.CURSOR_SHOW);
        process.stdout.write(ANSI_CODES.SCROLL_ENABLE);
        process.stdout.write(ANSI_CODES.ALTERNATE_SCREEN_OFF);
    }
    /**
     * Get current terminal dimensions
     */
    static getTerminalSize() {
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
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
    /**
     * Create message with validation
     */
    static createMessage(id, text, isUser = false, timestamp = new Date()) {
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
    static createStreamingMessage(id, isUser = false, timestamp = new Date()) {
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
    static calculateMessageBoxWidth(message, terminalWidth, isStreaming = false) {
        const maxWidth = Math.max(TERMINAL_CONSTANTS.MIN_MESSAGE_BOX_WIDTH, Math.floor((terminalWidth - TERMINAL_CONSTANTS.MESSAGE_BOX_PADDING) *
            TERMINAL_CONSTANTS.MESSAGE_BOX_WIDTH_RATIO));
        // if (isStreaming) {
        //   return maxWidth; // Fixed width during streaming to prevent layout shifts
        // }
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
    static addMessage(array, item) {
        return [...array, item];
    }
    /**
     * Update message by ID immutably
     */
    static updateMessageById(messages, messageId, updater) {
        return messages.map(msg => msg.id === messageId ? updater(msg) : msg);
    }
    /**
     * Update message text by ID
     */
    static updateMessageText(messages, messageId, newText) {
        return ArrayUtils.updateMessageById(messages, messageId, msg => ({
            ...msg,
            text: newText
        }));
    }
    /**
     * Append text to message
     */
    static appendToMessage(messages, messageId, appendText) {
        return ArrayUtils.updateMessageById(messages, messageId, msg => ({
            ...msg,
            text: msg.text + appendText
        }));
    }
    /**
     * Complete streaming message
     */
    static completeStreaming(messages, messageId) {
        return ArrayUtils.updateMessageById(messages, messageId, msg => ({
            ...msg,
            isStreaming: false
        }));
    }
    /**
     * Remove message by ID immutably
     */
    static removeMessage(messages, messageId) {
        return messages.filter(msg => msg.id !== messageId);
    }
}
