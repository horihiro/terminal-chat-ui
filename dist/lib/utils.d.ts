import { Message, RoleType } from '../types.js';
/**
 * Text processing utilities with multi-byte character support
 */
export declare class TextUtils {
    /**
     * Calculate text width considering Japanese/multi-byte characters
     */
    static getTextWidth(text: string): number;
    /**
     * Wrap text with multi-byte character support
     */
    static wrapText(text: string, maxWidth: number): string[];
    /**
     * Format timestamp with user/bot icon
     */
    static formatTimeWithIcon(timestamp: Date, role: RoleType): string;
}
/**
 * Terminal control utilities
 */
export declare class TerminalUtils {
    /**
     * Initialize alternate screen buffer
     */
    static initializeAlternateScreen(): void;
    /**
     * Restore normal screen buffer
     */
    static restoreNormalScreen(): void;
    /**
     * Get current terminal dimensions
     */
    static getTerminalSize(): {
        width: number;
        height: number;
    };
}
/**
 * Message processing utilities
 */
export declare class MessageUtils {
    /**
     * Generate unique message ID
     */
    static generateId(): string;
    /**
     * Create message with validation
     */
    static createMessage(id: number | string, text: string, role?: RoleType, timestamp?: Date): Message;
    /**
     * Create streaming message
     */
    static createStreamingMessage(id: number | string, role?: RoleType, timestamp?: Date): Message;
    /**
     * Calculate optimal message box width
     */
    static calculateMessageBoxWidth(message: Message, terminalWidth: number, isStreaming?: boolean): number;
}
/**
 * Array manipulation utilities (immutable operations)
 */
export declare class ArrayUtils {
    /**
     * Add message to array immutably
     */
    static addMessage<T>(array: readonly T[], item: T): T[];
    /**
     * Update message by ID immutably
     */
    static updateMessageById(messages: readonly Message[], messageId: number | string, updater: (message: Message) => Message): Message[];
    /**
     * Update message text by ID
     */
    static updateMessageText(messages: readonly Message[], messageId: number | string, newText: string): Message[];
    /**
     * Append text to message
     */
    static appendToMessage(messages: readonly Message[], messageId: number | string, appendText: string): Message[];
    /**
     * Complete streaming message
     */
    static completeStreaming(messages: readonly Message[], messageId: number | string): Message[];
    /**
     * Remove message by ID immutably
     */
    static removeMessage(messages: readonly Message[], messageId: number | string): Message[];
}
