// 基本的なメッセージ型定義
export interface Message {
  id: number | string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isStreaming?: boolean;
}

// ストリーミングメッセージ制御インターフェース
export interface StreamingController {
  append: (text: string) => void;
  complete: () => void;
}

// メッセージ操作制御インターフェース
export interface MessageController {
  update: (text: string) => void;
  remove: () => void;
  getId: () => string | number;
}

// StreamingHelperインターフェース（拡張版）
export interface StreamingHelper {
  addMessage: (text: string, isUser?: boolean) => MessageController;
  addStreamingMessage: (text?: string, isUser?: boolean) => StreamingController & MessageController;
  updateMessage: (id: string | number, text: string) => boolean;
  removeMessage: (id: string | number) => boolean;
  getMessageById: (id: string | number) => Message | undefined;
}

// メッセージ送信ハンドラ型
export type MessageSendHandler = (message: string, helpers: StreamingHelper) => void | Promise<void>;

// 終了ハンドラ型
export type ExitHandler = () => void | Promise<void>;

// 色設定インターフェース
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

// ChatConfigインターフェース
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

// コンポーネント関数型
export type ChatComponentFunction = () => ChatConfig;

// runTerminalChat関数の引数型
export type ChatConfigOrFunction = ChatConfig | ChatComponentFunction;

// ターミナルサイズ型
export interface TerminalSize {
  width: number;
  height: number;
}

// TerminalChatUI Props型
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

// MessageList Props型
export interface MessageListProps {
  messages: readonly Message[];
  maxHeight: number;
  terminalWidth: number;
  colors?: ColorScheme;
}

// InputBox Props型
export interface InputBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
  colors?: ColorScheme;
}