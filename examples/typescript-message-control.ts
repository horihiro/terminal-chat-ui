#!/usr/bin/env node

/**
 * TypeScript版 Message Control API サンプル
 * 
 * 型安全なメッセージ操作APIの使用例
 */

import { 
  runTerminalChat, 
  type MessageSendHandler, 
  type MessageController,
  type StreamingController 
} from '../dist/lib/index.js';

interface ThinkingState {
  controller: MessageController;
  step: number;
  timeout?: NodeJS.Timeout;
}

// 型安全な"考え中"メッセージ管理
class ThinkingManager {
  private currentThinking: ThinkingState | null = null;
  
  public startThinking(helpers: any): MessageController {
    this.clearCurrent();
    
    const controller = helpers.addMessage("🤔 考え中...", false);
    this.currentThinking = {
      controller,
      step: 0
    };
    
    this.scheduleUpdates();
    return controller;
  }
  
  private scheduleUpdates(): void {
    if (!this.currentThinking) return;
    
    const steps = [
      "💭 思考を整理中...",
      "🔍 情報を検索中...", 
      "✨ 回答を準備中..."
    ];
    
    this.currentThinking.timeout = setTimeout(() => {
      if (!this.currentThinking) return;
      
      this.currentThinking.step++;
      if (this.currentThinking.step < steps.length) {
        this.currentThinking.controller.update(steps[this.currentThinking.step]);
        this.scheduleUpdates();
      }
    }, 1000);
  }
  
  public finishThinking(helpers: any, response: string): void {
    if (this.currentThinking) {
      this.currentThinking.controller.remove();
      this.clearCurrent();
    }
    helpers.addMessage(response, false);
  }
  
  private clearCurrent(): void {
    if (this.currentThinking?.timeout) {
      clearTimeout(this.currentThinking.timeout);
    }
    this.currentThinking = null;
  }
}

// ストリーミングメッセージの型安全な管理
class StreamingManager {
  public createProgressStream(helpers: any, totalSteps: number): StreamingController & MessageController {
    const stream = helpers.addStreamingMessage("", false);
    let currentStep = 0;
    
    const updateProgress = () => {
      const progress = Math.floor((currentStep / totalSteps) * 100);
      const progressBar = "█".repeat(Math.floor(progress / 10)) + "░".repeat(10 - Math.floor(progress / 10));
      stream.update(`進行状況: [${progressBar}] ${progress}%`);
      
      currentStep++;
      if (currentStep <= totalSteps) {
        setTimeout(updateProgress, 200);
      } else {
        stream.complete();
      }
    };
    
    setTimeout(updateProgress, 100);
    return stream;
  }
}

// メイン処理
const thinkingManager = new ThinkingManager();
const streamingManager = new StreamingManager();

const typedMessageHandler: MessageSendHandler = async (message, helpers) => {
  const command = message.toLowerCase().trim();
  
  switch (command) {
    case '考え中':
    case 'thinking':
      const thinkingController = thinkingManager.startThinking(helpers);
      
      setTimeout(() => {
        thinkingManager.finishThinking(
          helpers, 
          `質問「${message}」についてお答えします。型安全な"考え中"処理が完了しました！`
        );
      }, 4000);
      break;
      
    case 'progress':
    case '進行状況':
      const progressStream = streamingManager.createProgressStream(helpers, 50);
      
      setTimeout(() => {
        progressStream.update("✅ 処理完了！");
      }, 11000);
      break;
      
    case 'batch':
    case '一括処理':
      const messages: MessageController[] = [];
      
      // 複数メッセージの一括作成
      for (let i = 1; i <= 3; i++) {
        const msg = helpers.addMessage(`処理項目 ${i}`, false);
        messages.push(msg);
      }
      
      // 段階的な更新
      messages.forEach((msg, index) => {
        setTimeout(() => {
          msg.update(`処理項目 ${index + 1} - 完了 ✅`);
          
          // 最後の項目が完了したら一括削除
          if (index === messages.length - 1) {
            setTimeout(() => {
              messages.forEach(m => m.remove());
              helpers.addMessage("🎉 一括処理が完了しました！", false);
            }, 2000);
          }
        }, (index + 1) * 1000);
      });
      break;
      
    default:
      const response = helpers.addMessage("コマンドを認識しています...", false);
      
      setTimeout(() => {
        response.update(`受信: "${message}"\n\n利用可能コマンド:\n• '考え中' - 段階的思考デモ\n• 'progress' - 進行状況表示\n• 'batch' - 一括処理デモ`);
      }, 500);
  }
};

// アプリケーション起動
runTerminalChat({
  title: "🎯 TypeScript Message Control API",
  placeholder: "コマンド入力: '考え中', 'progress', 'batch'",
  initialMessages: [
    {
      id: 'ts-welcome',
      text: '⚡ TypeScript版 Message Control APIへようこそ！\n\n型安全なメッセージ操作をデモンストレーションします。\n\n🔤 "考え中", "progress", "batch" のいずれかを試してください。',
      isUser: false,
      timestamp: new Date()
    }
  ],
  onMessageSend: typedMessageHandler,
  colors: {
    userMessage: 'blue',
    botMessage: 'green',
    inputPlaceholder: 'dim',
    streamingIndicator: 'cyan'
  }
}).catch((error: Error) => {
  console.error('TypeScript Demo Error:', error);
  process.exit(1);
});