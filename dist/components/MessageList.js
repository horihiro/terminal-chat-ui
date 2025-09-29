import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import { TextUtils, MessageUtils } from '../lib/utils.js';
import { TERMINAL_CONSTANTS, DEFAULT_COLORS } from '../lib/constants.js';
/**
 * Scrollable message list with color customization and optimized rendering
 */
const MessageList = ({ messages, maxHeight, terminalWidth, colors }) => {
    const [scrollOffset, setScrollOffset] = useState(0);
    // Memoized calculations for performance
    const dimensions = useMemo(() => {
        // Calculate actual total height needed for all messages
        const totalMessageHeight = messages.reduce((totalHeight, message) => {
            let messageHeight = 0;
            const maxWidth = Math.max(TERMINAL_CONSTANTS.MIN_MESSAGE_BOX_WIDTH, Math.floor((terminalWidth - TERMINAL_CONSTANTS.MESSAGE_BOX_PADDING) *
                TERMINAL_CONSTANTS.MESSAGE_BOX_WIDTH_RATIO));
            if (message.isUser) {
                // User messages: calculate wrapped lines
                const textWidth = TextUtils.getTextWidth(message.text);
                if (textWidth > TERMINAL_CONSTANTS.SHORT_TEXT_THRESHOLD) {
                    const wrappedLines = TextUtils.wrapText(message.text, maxWidth - TERMINAL_CONSTANTS.MESSAGE_PADDING);
                    messageHeight = wrappedLines.length + 2; // content lines + borders
                }
                else {
                    messageHeight = 3; // single line + borders
                }
            }
            else {
                // Bot messages: also calculate based on actual content length
                const textWidth = TextUtils.getTextWidth(message.text);
                const lines = message.text.split('\n'); // Handle explicit line breaks
                if (textWidth > TERMINAL_CONSTANTS.SHORT_TEXT_THRESHOLD || lines.length > 1) {
                    // Multi-line bot message
                    let totalLines = 0;
                    lines.forEach(line => {
                        if (TextUtils.getTextWidth(line) > maxWidth - TERMINAL_CONSTANTS.MESSAGE_PADDING) {
                            const wrappedLines = TextUtils.wrapText(line, maxWidth - TERMINAL_CONSTANTS.MESSAGE_PADDING);
                            totalLines += wrappedLines.length;
                        }
                        else {
                            totalLines += 1;
                        }
                    });
                    messageHeight = totalLines + 2; // content lines + borders
                }
                else {
                    messageHeight = 3; // single line + borders
                }
            }
            messageHeight += 1; // timestamp line
            messageHeight += 1; // margin
            return totalHeight + messageHeight;
        }, 0);
        // Calculate how many messages can actually fit
        const availableHeight = maxHeight - 4; // Reserve space for scroll indicators
        let maxVisibleMessages = messages.length;
        // If total height exceeds available space, calculate how many messages fit
        if (totalMessageHeight > availableHeight) {
            let accumulatedHeight = 0;
            maxVisibleMessages = 0;
            // Count from the end (latest messages) to see how many fit
            for (let i = messages.length - 1; i >= 0; i--) {
                const message = messages[i];
                let messageHeight = 0;
                const maxWidth = Math.max(TERMINAL_CONSTANTS.MIN_MESSAGE_BOX_WIDTH, Math.floor((terminalWidth - TERMINAL_CONSTANTS.MESSAGE_BOX_PADDING) *
                    TERMINAL_CONSTANTS.MESSAGE_BOX_WIDTH_RATIO));
                if (message.isUser) {
                    const textWidth = TextUtils.getTextWidth(message.text);
                    if (textWidth > TERMINAL_CONSTANTS.SHORT_TEXT_THRESHOLD) {
                        const wrappedLines = TextUtils.wrapText(message.text, maxWidth - TERMINAL_CONSTANTS.MESSAGE_PADDING);
                        messageHeight = wrappedLines.length + 2;
                    }
                    else {
                        messageHeight = 3;
                    }
                }
                else {
                    const textWidth = TextUtils.getTextWidth(message.text);
                    const lines = message.text.split('\n');
                    if (textWidth > TERMINAL_CONSTANTS.SHORT_TEXT_THRESHOLD || lines.length > 1) {
                        let totalLines = 0;
                        lines.forEach(line => {
                            if (TextUtils.getTextWidth(line) > maxWidth - TERMINAL_CONSTANTS.MESSAGE_PADDING) {
                                const wrappedLines = TextUtils.wrapText(line, maxWidth - TERMINAL_CONSTANTS.MESSAGE_PADDING);
                                totalLines += wrappedLines.length;
                            }
                            else {
                                totalLines += 1;
                            }
                        });
                        messageHeight = totalLines + 2;
                    }
                    else {
                        messageHeight = 3;
                    }
                }
                messageHeight += 2; // timestamp + margin
                if (accumulatedHeight + messageHeight <= availableHeight) {
                    accumulatedHeight += messageHeight;
                    maxVisibleMessages++;
                }
                else {
                    break;
                }
            }
            maxVisibleMessages = Math.max(TERMINAL_CONSTANTS.MIN_VISIBLE_MESSAGES, maxVisibleMessages);
        }
        return {
            messageBoxMaxWidth: Math.max(TERMINAL_CONSTANTS.MIN_MESSAGE_BOX_WIDTH, Math.floor((terminalWidth - TERMINAL_CONSTANTS.MESSAGE_BOX_PADDING) *
                TERMINAL_CONSTANTS.MESSAGE_BOX_WIDTH_RATIO)),
            maxVisibleMessages: maxVisibleMessages,
            totalMessageHeight: totalMessageHeight
        };
    }, [maxHeight, terminalWidth, messages]);
    // Memoized color scheme
    const colorScheme = useMemo(() => ({
        userMessage: colors?.userMessage || DEFAULT_COLORS.userMessage,
        userMessageBorder: colors?.userMessageBorder || DEFAULT_COLORS.userMessageBorder,
        botMessage: colors?.botMessage || DEFAULT_COLORS.botMessage,
        botMessageBorder: colors?.botMessageBorder || DEFAULT_COLORS.botMessageBorder,
        timestamp: colors?.timestamp || DEFAULT_COLORS.timestamp,
        scrollIndicator: colors?.scrollIndicator || DEFAULT_COLORS.scrollIndicator,
        streamingIndicator: colors?.streamingIndicator || DEFAULT_COLORS.streamingIndicator
    }), [colors]);
    // Auto-scroll to bottom when messages change (including content updates)
    useEffect(() => {
        if (messages.length > dimensions.maxVisibleMessages) {
            setScrollOffset(Math.max(0, messages.length - dimensions.maxVisibleMessages));
        }
        else {
            setScrollOffset(0);
        }
    }, [messages, dimensions.maxVisibleMessages, dimensions.totalMessageHeight]);
    // Scroll handler with boundary checks
    const handleScroll = useCallback((direction, amount = 1) => {
        setScrollOffset(prevOffset => {
            const newOffset = direction === 'up'
                ? Math.max(0, prevOffset - amount)
                : Math.min(messages.length - dimensions.maxVisibleMessages, prevOffset + amount);
            return newOffset;
        });
    }, [messages.length, dimensions.maxVisibleMessages]);
    // Keyboard input handling
    useInput((input, key) => {
        if (key.upArrow) {
            handleScroll('up', TERMINAL_CONSTANTS.SCROLL_AMOUNT_DEFAULT);
        }
        else if (key.downArrow) {
            handleScroll('down', TERMINAL_CONSTANTS.SCROLL_AMOUNT_DEFAULT);
        }
        else if (key.pageUp) {
            handleScroll('up', TERMINAL_CONSTANTS.SCROLL_AMOUNT_PAGE);
        }
        else if (key.pageDown) {
            handleScroll('down', TERMINAL_CONSTANTS.SCROLL_AMOUNT_PAGE);
        }
    });
    // Calculate display data
    const displayData = useMemo(() => {
        const visibleMessages = messages.slice(scrollOffset, scrollOffset + dimensions.maxVisibleMessages);
        const hasMoreAbove = scrollOffset > 0;
        const hasMoreBelow = scrollOffset + dimensions.maxVisibleMessages < messages.length;
        return { visibleMessages, hasMoreAbove, hasMoreBelow };
    }, [messages, scrollOffset, dimensions.maxVisibleMessages]);
    const renderMessage = useCallback((message) => {
        const boxWidth = MessageUtils.calculateMessageBoxWidth(message, terminalWidth, Boolean(message.isStreaming));
        // Calculate wrapped lines for user messages
        const userLines = message.isUser && TextUtils.getTextWidth(message.text) > TERMINAL_CONSTANTS.SHORT_TEXT_THRESHOLD
            ? TextUtils.wrapText(message.text, dimensions.messageBoxMaxWidth - TERMINAL_CONSTANTS.MESSAGE_PADDING)
            : [message.text];
        return React.createElement(Box, {
            key: message.id,
            marginBottom: 1,
            flexShrink: 0,
            width: terminalWidth - TERMINAL_CONSTANTS.MESSAGE_PADDING,
            flexDirection: "column"
        }, message.isUser
            ? renderUserMessage(message, boxWidth, userLines)
            : renderBotMessage(message, boxWidth));
    }, [terminalWidth, dimensions.messageBoxMaxWidth, colorScheme]);
    // Render user message
    const renderUserMessage = useCallback((message, boxWidth, lines) => React.createElement(Box, {
        flexDirection: "column",
        alignItems: "flex-end"
    }, React.createElement(Box, {
        borderStyle: "single",
        borderColor: colorScheme.userMessageBorder,
        width: boxWidth,
        flexDirection: "column",
        paddingX: 1
    }, 
    // Render each line separately
    ...lines.map((line, lineIndex) => React.createElement(Text, {
        key: lineIndex,
        color: colorScheme.userMessage
    }, line))), 
    // Timestamp with user icon
    React.createElement(Text, {
        color: colorScheme.timestamp,
        dimColor: true
    }, TextUtils.formatTimeWithIcon(message.timestamp, true))), [colorScheme]);
    // Render bot message
    const renderBotMessage = useCallback((message, boxWidth) => React.createElement(Box, {
        flexDirection: "column",
        alignItems: "flex-start"
    }, React.createElement(Box, {
        borderStyle: "single",
        borderColor: colorScheme.botMessageBorder,
        width: boxWidth,
        flexDirection: "column",
        paddingX: 1
    }, React.createElement(Box, {
        flexDirection: "row"
    }, React.createElement(Text, {
        color: colorScheme.botMessage
    }, message.text), 
    // Streaming indicator (inline, no line break)
    message.isStreaming && React.createElement(Text, {
        color: colorScheme.streamingIndicator
    }, "▌"))), 
    // Timestamp with bot icon
    React.createElement(Text, {
        color: colorScheme.timestamp,
        dimColor: true
    }, TextUtils.formatTimeWithIcon(message.timestamp, false))), [colorScheme]);
    const { visibleMessages, hasMoreAbove, hasMoreBelow } = displayData;
    return React.createElement(Box, {
        flexDirection: "column",
        height: maxHeight
    }, 
    // Scroll indicator - above
    hasMoreAbove && React.createElement(Box, {
        justifyContent: "center",
        marginBottom: 1,
        flexShrink: 0
    }, React.createElement(Text, {
        color: colorScheme.scrollIndicator,
        dimColor: true
    }, "↑ More messages above (Arrow keys, PageUp/PageDown to scroll)")), 
    // Messages container (with explicit height to prevent overflow)
    React.createElement(Box, {
        flexDirection: "column",
        flexGrow: 1,
        flexShrink: 1,
        minHeight: 0,
        overflow: "hidden"
    }, ...visibleMessages.map(renderMessage)), 
    // Scroll indicator - below
    hasMoreBelow && React.createElement(Box, {
        justifyContent: "center",
        marginTop: 1,
        flexShrink: 0
    }, React.createElement(Text, {
        color: colorScheme.scrollIndicator,
        dimColor: true
    }, "↓ More messages below (Arrow keys, PageUp/PageDown to scroll)")));
};
export default MessageList;
