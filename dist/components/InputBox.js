import React, { useCallback, useMemo, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { DEFAULT_COLORS } from '../lib/constants.js';
/**
 * Input box component with cursor display and color customization
 */
const InputBox = ({ value, onChange, onSubmit, placeholder = "Enter message...", colors }) => {
    // Memoize color values to avoid unnecessary re-renders
    const colorScheme = useMemo(() => ({
        inputLabel: colors?.inputLabel || DEFAULT_COLORS.inputLabel,
        inputText: colors?.inputText || DEFAULT_COLORS.inputText,
        inputCursor: colors?.inputCursor || DEFAULT_COLORS.inputCursor,
        inputPlaceholder: colors?.inputPlaceholder || DEFAULT_COLORS.inputPlaceholder
    }), [colors]);
    // Simplified approach - let Ink handle display and just hide system cursor
    useEffect(() => {
        if (process.stdout.isTTY) {
            // Simply hide the system cursor to prevent interference
            process.stdout.write('\x1b[?25l'); // Hide cursor
        }
        return () => {
            if (process.stdout.isTTY) {
                // Keep cursor hidden on cleanup
                process.stdout.write('\x1b[?25l');
            }
        };
    }, []);
    const handleInput = useCallback((input, key) => {
        if (key.return) {
            // Send message when Enter key is pressed
            onSubmit(value);
            onChange(''); // Clear input
            return;
        }
        if (key.backspace || key.delete) {
            // Delete character with backspace
            onChange(value.slice(0, -1));
            return;
        }
        // Filter out control keys and allow character input
        if (shouldAcceptInput(input, key)) {
            onChange(value + input);
        }
    }, [value, onChange, onSubmit]);
    useInput(handleInput);
    return React.createElement(Box, {
        flexDirection: "column"
    }, 
    // Main input row
    React.createElement(Box, {
        flexDirection: "row",
        alignItems: "center"
    }, 
    // Input label
    React.createElement(Text, {
        color: colorScheme.inputLabel,
        bold: true
    }, "💬 Message: "), 
    // Input text
    React.createElement(Text, {
        color: value ? colorScheme.inputText : "gray",
        dimColor: !value
    }, value || ''), 
    // Cursor (after text)
    React.createElement(Text, {
        color: colorScheme.inputCursor,
        backgroundColor: colorScheme.inputCursor
    }, " "), 
    // Placeholder (when no input)
    !value && React.createElement(Text, {
        color: colorScheme.inputPlaceholder,
        dimColor: true
    }, placeholder)), 
    // Debug info (only in development)
    process.env.NODE_ENV === 'development' && React.createElement(Text, {
        color: "gray",
        dimColor: true
    }, `Term: ${process.stdout.rows}x${process.stdout.columns} | WT: ${process.env.WT_SESSION ? 'Yes' : 'No'}`));
};
/**
 * Determine if input should be accepted based on key modifiers
 */
function shouldAcceptInput(input, key) {
    // Reject control keys
    if (key.ctrl || key.meta)
        return false;
    // Reject navigation keys
    if (key.upArrow || key.downArrow || key.pageUp || key.pageDown)
        return false;
    // Reject special keys
    if (key.escape || key.tab)
        return false;
    // Accept character input
    return Boolean(input && input.length > 0);
}
export default InputBox;
