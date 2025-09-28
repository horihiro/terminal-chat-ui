import assert from 'node:assert';
import { describe, it } from 'node:test';
import { 
  createMessage, 
  addMessageToArray, 
  generateMessageId, 
  updateMessageText, 
  appendToMessage,
  createStreamingMessage,
  completeStreaming
} from '../src/lib/index.js';
import type { Message } from '../src/types.js';

describe('Utility Functions', () => {
  describe('createMessage', () => {
    it('should create a user message with all required properties', () => {
      const message = createMessage(1, 'Hello!', true);
      
      assert.strictEqual(message.id, 1);
      assert.strictEqual(message.text, 'Hello!');
      assert.strictEqual(message.isUser, true);
      assert.ok(message.timestamp instanceof Date);
      assert.strictEqual(message.isStreaming, undefined);
    });

    it('should create a bot message by default', () => {
      const message = createMessage(2, 'Hi there!');
      
      assert.strictEqual(message.id, 2);
      assert.strictEqual(message.text, 'Hi there!');
      assert.strictEqual(message.isUser, false);
      assert.ok(message.timestamp instanceof Date);
    });

    it('should accept custom timestamp', () => {
      const customTime = new Date('2025-01-01');
      const message = createMessage(3, 'Test', false, customTime);
      
      assert.strictEqual(message.timestamp, customTime);
    });
  });

  describe('generateMessageId', () => {
    it('should generate unique string IDs', () => {
      const id1 = generateMessageId();
      const id2 = generateMessageId();
      
      assert.strictEqual(typeof id1, 'string');
      assert.strictEqual(typeof id2, 'string');
      assert.notStrictEqual(id1, id2);
      assert.ok(id1.length > 0);
    });
  });

  describe('addMessageToArray', () => {
    it('should add a message to empty array', () => {
      const messages: Message[] = [];
      const newMessage = createMessage(1, 'First message', true);
      
      const result = addMessageToArray(messages, newMessage);
      
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0], newMessage);
      assert.strictEqual(messages.length, 0); // Original array unchanged
    });

    it('should add a message to existing array', () => {
      const messages: Message[] = [
        createMessage(1, 'First', true)
      ];
      const newMessage = createMessage(2, 'Second', false);
      
      const result = addMessageToArray(messages, newMessage);
      
      assert.strictEqual(result.length, 2);
      assert.strictEqual(result[0].text, 'First');
      assert.strictEqual(result[1].text, 'Second');
      assert.strictEqual(messages.length, 1); // Original array unchanged
    });
  });

  describe('updateMessageText', () => {
    it('should update message text by ID', () => {
      const messages: Message[] = [
        createMessage(1, 'Original', true),
        createMessage(2, 'Another', false)
      ];
      
      const result = updateMessageText(messages, 1, 'Updated');
      
      assert.strictEqual(result[0].text, 'Updated');
      assert.strictEqual(result[1].text, 'Another');
      assert.strictEqual(messages[0].text, 'Original'); // Original unchanged
    });

    it('should not modify messages with different IDs', () => {
      const messages: Message[] = [
        createMessage(1, 'Message 1', true),
        createMessage(2, 'Message 2', false)
      ];
      
      const result = updateMessageText(messages, 999, 'No change');
      
      assert.strictEqual(result[0].text, 'Message 1');
      assert.strictEqual(result[1].text, 'Message 2');
    });
  });

  describe('appendToMessage', () => {
    it('should append text to existing message', () => {
      const messages: Message[] = [
        createMessage(1, 'Hello', true),
        createMessage(2, 'World', false)
      ];
      
      const result = appendToMessage(messages, 1, ' there!');
      
      assert.strictEqual(result[0].text, 'Hello there!');
      assert.strictEqual(result[1].text, 'World');
    });

    it('should handle empty append text', () => {
      const messages: Message[] = [
        createMessage(1, 'Test', true)
      ];
      
      const result = appendToMessage(messages, 1, '');
      
      assert.strictEqual(result[0].text, 'Test');
    });
  });

  describe('createStreamingMessage', () => {
    it('should create streaming message with empty text', () => {
      const message = createStreamingMessage(1, false);
      
      assert.strictEqual(message.id, 1);
      assert.strictEqual(message.text, '');
      assert.strictEqual(message.isUser, false);
      assert.strictEqual(message.isStreaming, true);
      assert.ok(message.timestamp instanceof Date);
    });

    it('should create user streaming message', () => {
      const message = createStreamingMessage('user-1', true);
      
      assert.strictEqual(message.id, 'user-1');
      assert.strictEqual(message.isUser, true);
      assert.strictEqual(message.isStreaming, true);
    });
  });

  describe('completeStreaming', () => {
    it('should mark streaming message as complete', () => {
      const messages: Message[] = [
        createStreamingMessage(1, false),
        createMessage(2, 'Regular', true)
      ];
      
      const result = completeStreaming(messages, 1);
      
      assert.strictEqual(result[0].isStreaming, false);
      assert.strictEqual(result[1].isStreaming, undefined);
    });

    it('should not affect non-streaming messages', () => {
      const messages: Message[] = [
        createMessage(1, 'Normal', true),
        createMessage(2, 'Another', false)
      ];
      
      const result = completeStreaming(messages, 1);
      
      // Non-streaming messages get isStreaming: false when processed
      assert.strictEqual(result[0].isStreaming, false);
      assert.strictEqual(result[1].isStreaming, undefined);
    });
  });
});