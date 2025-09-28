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
    const dimensions = useMemo(() => ({
        messageBoxMaxWidth: Math.max(TERMINAL_CONSTANTS.MIN_MESSAGE_BOX_WIDTH, Math.floor((terminalWidth - TERMINAL_CONSTANTS.MESSAGE_BOX_PADDING) *
            TERMINAL_CONSTANTS.MESSAGE_BOX_WIDTH_RATIO)),
        maxVisibleMessages: Math.max(TERMINAL_CONSTANTS.MIN_VISIBLE_MESSAGES, Math.floor((maxHeight - 6) / TERMINAL_CONSTANTS.MESSAGE_HEIGHT_ESTIMATE))
    }), [maxHeight, terminalWidth]);
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
    // Auto-scroll to bottom when new messages are added
    useEffect(() => {
        if (messages.length > dimensions.maxVisibleMessages) {
            setScrollOffset(Math.max(0, messages.length - dimensions.maxVisibleMessages));
        }
    }, [messages.length, dimensions.maxVisibleMessages]);
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
    // Timestamp
    React.createElement(Text, {
        color: colorScheme.timestamp,
        dimColor: true
    }, message.timestamp.toLocaleTimeString())), [colorScheme]);
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
    }, React.createElement(Text, {
        color: colorScheme.botMessage
    }, message.text), 
    // Streaming indicator
    message.isStreaming && React.createElement(Text, {
        color: colorScheme.streamingIndicator
    }, "▌")), 
    // Timestamp
    React.createElement(Text, {
        color: colorScheme.timestamp,
        dimColor: true
    }, message.timestamp.toLocaleTimeString())), [colorScheme]);
    const { visibleMessages, hasMoreAbove, hasMoreBelow } = displayData;
    return React.createElement(Box, {
        flexDirection: "column",
        height: maxHeight
    }, 
    // Scroll indicator - above
    hasMoreAbove && React.createElement(Box, {
        justifyContent: "center",
        marginBottom: 1
    }, React.createElement(Text, {
        color: colorScheme.scrollIndicator,
        dimColor: true
    }, "↑ More messages above (Arrow keys, PageUp/PageDown to scroll)")), 
    // Messages container
    React.createElement(Box, {
        flexDirection: "column",
        flexGrow: 1
    }, ...visibleMessages.map(renderMessage)), 
    // Scroll indicator - below
    hasMoreBelow && React.createElement(Box, {
        justifyContent: "center",
        marginTop: 1
    }, React.createElement(Text, {
        color: colorScheme.scrollIndicator,
        dimColor: true
    }, "↓ More messages below (Arrow keys, PageUp/PageDown to scroll)")));
};
export default MessageList;
