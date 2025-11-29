#!/usr/bin/env node

/**
 * プログラム的メッセージ操作のサンプル
 * "考え中"メッセージの表示・更新・削除の例
 */

import { runTerminalChat } from '../dist/lib/index.js';

// "考え中"メッセージを管理するための変数
let thinkingController = null;
let responseTimeout = null;

const messageHandler = async (message, helpers) => {
  // 既存の"考え中"メッセージがあれば削除
  if (thinkingController) {
    thinkingController.remove();
    thinkingController = null;
  }
  
  // 既存のタイムアウトをクリア
  if (responseTimeout) {
    clearTimeout(responseTimeout);
    responseTimeout = null;
  }

  // "考え中"メッセージを表示
  thinkingController = helpers.addMessage("🤔 考え中...", 1);
  
  // 1秒後に"考え中"メッセージを更新
  setTimeout(() => {
    if (thinkingController) {
      thinkingController.update("💭 思考を整理中...");
    }
  }, 1000);

  // 2秒後にさらに更新
  setTimeout(() => {
    if (thinkingController) {
      thinkingController.update("✨ 回答を準備中...");
    }
  }, 2000);

  // 3秒後に"考え中"メッセージを削除して実際の回答を表示
  responseTimeout = setTimeout(async () => {
    if (thinkingController) {
      thinkingController.remove();
      thinkingController = null;
    }
    
    // 実際の回答を追加
    const responses = [
      "こんにちは！何かお手伝いできることはありますか？",
      "いい質問ですね。もう少し詳しく教えていただけますか？",
      "なるほど、それについて考えてみました。",
      "興味深いトピックですね！",
      "そのご質問にお答えします。"
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    if (message.toLowerCase().includes("ストリーミング")) {
      const streaming = helpers.addStreamingMessage("", 1);
      await randomResponse.split('').reduce(async (promise, char) => {
        await promise;
        streaming.append(char);
        return new Promise(resolve => setTimeout(resolve, 50));
      }, Promise.resolve());
      streaming.complete();
    } else {
      helpers.addMessage(randomResponse, 1);
    }
  }, 3000);
};

// メッセージ操作のデモ用ハンドラ
const demoHandler = async (message, helpers) => {
  if (message.toLowerCase().includes("削除")) {
    // 削除デモ
    const tempMsg = helpers.addMessage("このメッセージは3秒後に削除されます。", 1);
    setTimeout(() => {
      tempMsg.remove();
      helpers.addMessage("メッセージが削除されました！", 1);
    }, 3000);
    
  } else if (message.toLowerCase().includes("更新")) {
    // 更新デモ
    const updateMsg = helpers.addMessage("このメッセージは更新されます...", 1);
    setTimeout(() => {
      updateMsg.update("メッセージが更新されました！✨");
    }, 2000);
    
  } else {
    // 通常の"考え中"デモ
    messageHandler(message, helpers);
  }
};

// チャットアプリケーションを起動
runTerminalChat({
  title: "📝 プログラム的メッセージ操作デモ",
  placeholder: "メッセージを入力... ('削除', '更新', 'ストリーミング' で特別なデモ)",
  initialMessages: [
    {
      id: 'welcome',
      text: 'プログラム的メッセージ操作のデモです！\n\n使用例:\n- 通常メッセージ → "考え中"状態のデモ\n- "削除"を含む → メッセージ削除のデモ\n- "更新"を含む → メッセージ更新のデモ\n- "ストリーミング"を含む → ストリーミング + 操作のデモ',
      role: 2,
      timestamp: new Date()
    }
  ],
  onMessageSend: demoHandler,
  colors: {
    userMessage: 'cyan',
    botMessage: 'green',
    inputPlaceholder: 'gray'
  }
}).catch(error => {
  console.error('Error starting chat:', error);
  process.exit(1);
});