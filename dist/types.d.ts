export interface Message {
    id: number | string;
    text: string;
    role: RoleType;
    timestamp: Date;
    isStreaming?: boolean;
}
export declare const enum RoleType {
    USER = 0,
    BOT = 1,
    SYSTEM = 2
}
export interface StreamingController {
    append: (text: string) => void;
    complete: () => void;
}
export interface MessageController {
    update: (text: string) => void;
    remove: () => void;
    getId: () => string | number;
}
export interface StreamingHelper {
    addMessage: (text: string, role?: RoleType) => MessageController;
    addStreamingMessage: (text?: string, role?: RoleType) => StreamingController & MessageController;
    updateMessage: (id: string | number, text: string) => boolean;
    removeMessage: (id: string | number) => boolean;
    getMessageById: (id: string | number) => Message | undefined;
}
export type MessageSendHandler = (message: string, helpers: StreamingHelper) => void | Promise<void>;
export type ExitHandler = () => void | Promise<void>;
export interface ColorScheme {
    userMessage?: string;
    userMessageBorder?: string;
    botMessage?: string;
    botMessageBorder?: string;
    timestamp?: string;
    header?: string;
    inputLabel?: string;
    inputText?: string;
    inputCursor?: string;
    inputPlaceholder?: string;
    scrollIndicator?: string;
    streamingIndicator?: string;
}
export interface ChatConfig {
    title?: string;
    placeholder?: string;
    initialMessages?: readonly Message[];
    showControls?: boolean;
    useAlternateScreen?: boolean;
    colors?: ColorScheme;
    onMessageSend?: MessageSendHandler;
    onExit?: ExitHandler;
}
export type ChatComponentFunction = () => ChatConfig;
export type ChatConfigOrFunction = ChatConfig | ChatComponentFunction;
export interface TerminalSize {
    width: number;
    height: number;
}
export interface TerminalChatUIProps {
    messages: readonly Message[];
    onMessageSend: (message: string) => void;
    title?: string;
    placeholder?: string;
    showControls?: boolean;
    useAlternateScreen?: boolean;
    colors?: ColorScheme;
    onExit?: ExitHandler;
}
export interface MessageListProps {
    messages: readonly Message[];
    maxHeight: number;
    terminalWidth: number;
    colors?: ColorScheme;
}
export interface InputBoxProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (value: string) => void;
    placeholder?: string;
    colors?: ColorScheme;
}
