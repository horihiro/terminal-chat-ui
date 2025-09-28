// Terminal Chat UI Constants
export const TERMINAL_CONSTANTS = {
  // Default terminal size
  DEFAULT_WIDTH: 80,
  DEFAULT_HEIGHT: 24,
  
  // Layout dimensions
  HEADER_HEIGHT: 3,
  INPUT_HEIGHT: 3,
  MIN_MESSAGE_AREA_HEIGHT: 5,
  TOTAL_FIXED_HEIGHT: 10, // HEADER_HEIGHT + INPUT_HEIGHT + borders
  
  // Message display
  MESSAGE_PADDING: 4,
  MESSAGE_HEIGHT_ESTIMATE: 4,
  MIN_VISIBLE_MESSAGES: 2,
  MESSAGE_BOX_PADDING: 10,
  MESSAGE_BOX_WIDTH_RATIO: 0.7,
  MIN_MESSAGE_BOX_WIDTH: 20,
  
  // Text handling
  SHORT_TEXT_THRESHOLD: 40,
  SHORT_MESSAGE_THRESHOLD: 20,
  MIN_WRAP_WIDTH: 5,
  
  // Scroll behavior
  SCROLL_AMOUNT_DEFAULT: 1,
  SCROLL_AMOUNT_PAGE: 3,
  
  // Animation delays
  DEFAULT_STREAM_DELAY: 60,
  FAST_STREAM_DELAY: 20,
  SLOW_STREAM_DELAY: 200,
  PUNCTUATION_EXTRA_DELAY_MULTIPLIER: 2
} as const;

// ANSI escape sequences
export const ANSI_CODES = {
  // Screen control
  ALTERNATE_SCREEN_ON: '\x1b[?1049h',
  ALTERNATE_SCREEN_OFF: '\x1b[?1049l',
  CLEAR_SCREEN: '\x1b[2J\x1b[H',
  CURSOR_HIDE: '\x1b[?25l',
  CURSOR_SHOW: '\x1b[?25h',
  SCROLL_DISABLE: '\x1b[?7l',
  SCROLL_ENABLE: '\x1b[?7h'
} as const;

// Default color scheme
export const DEFAULT_COLORS = {
  userMessage: 'green',
  userMessageBorder: 'green',
  botMessage: 'blue',
  botMessageBorder: 'blue',
  timestamp: 'gray',
  header: 'blue',
  inputLabel: 'yellow',
  inputText: 'white',
  inputCursor: 'gray',
  inputPlaceholder: 'gray',
  scrollIndicator: 'gray',
  streamingIndicator: 'blue'
} as const;

// Regular expressions
export const REGEX_PATTERNS = {
  // Japanese and full-width characters
  JAPANESE_CHARS: /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\uFF00-\uFFEF]/,
  // Punctuation for streaming delays
  PUNCTUATION: /[。、！？.,!?]/
} as const;