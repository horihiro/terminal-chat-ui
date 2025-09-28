import assert from 'node:assert';
import { describe, it } from 'node:test';
import type { 
  Message, 
  ChatConfig, 
  StreamingHelper,
  TerminalSize,
  TerminalChatUIProps 
} from '../src/types.js';

describe('Type Definitions', () => {
  it('should properly define Message interface', () => {
    const message: Message = {
      id: 1,
      text: 'Hello, world!',
      isUser: true,
      timestamp: new Date(),
      isStreaming: false
    };

    assert.ok(message.id !== undefined);
    assert.strictEqual(typeof message.text, 'string');
    assert.strictEqual(typeof message.isUser, 'boolean');
    assert.ok(message.timestamp instanceof Date);
    assert.strictEqual(typeof message.isStreaming, 'boolean');
  });

  it('should properly define ChatConfig interface', () => {
    const config: ChatConfig = {
      title: 'Test Chat',
      placeholder: 'Type here...',
      initialMessages: [],
      showControls: true,
      useAlternateScreen: true,
      onMessageSend: (message: string, helpers: StreamingHelper) => {
        console.log(message);
      },
      onExit: () => {
        console.log('Exiting...');
      }
    };

    assert.strictEqual(config.title, 'Test Chat');
    assert.strictEqual(config.placeholder, 'Type here...');
    assert.ok(Array.isArray(config.initialMessages));
    assert.strictEqual(typeof config.showControls, 'boolean');
    assert.strictEqual(typeof config.useAlternateScreen, 'boolean');
    assert.strictEqual(typeof config.onMessageSend, 'function');
    assert.strictEqual(typeof config.onExit, 'function');
  });

  it('should properly define TerminalSize interface', () => {
    const size: TerminalSize = {
      width: 80,
      height: 24
    };

    assert.strictEqual(typeof size.width, 'number');
    assert.strictEqual(typeof size.height, 'number');
    assert.ok(size.width > 0);
    assert.ok(size.height > 0);
  });

  it('should properly define TerminalChatUIProps interface', () => {
    const props: TerminalChatUIProps = {
      messages: [],
      onMessageSend: (message: string) => {
        console.log('Message sent:', message);
      },
      title: 'Test UI',
      placeholder: 'Enter text...',
      showControls: true,
      useAlternateScreen: true,
      onExit: () => {
        console.log('UI exiting...');
      }
    };

    assert.ok(Array.isArray(props.messages));
    assert.strictEqual(typeof props.onMessageSend, 'function');
    assert.strictEqual(props.title, 'Test UI');
    assert.strictEqual(props.placeholder, 'Enter text...');
    assert.strictEqual(typeof props.showControls, 'boolean');
    assert.strictEqual(typeof props.useAlternateScreen, 'boolean');
    assert.strictEqual(typeof props.onExit, 'function');
  });
});