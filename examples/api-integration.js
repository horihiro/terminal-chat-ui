#!/usr/bin/env node
import { runTerminalChat, createChatConfig, createMessage } from '../dist/lib/index.js';

/**
 * 外部API連携のサンプル（モックAPI使用）
 * 実際のプロジェクトではここにChatGPTやClaude APIなどを統合
 */

// モックAPIレスポンス（実際のプロジェクトでは外部APIを呼び出し）
const mockAPICall = async (message) => {
  // 実際の例:
  // const response = await fetch('https://api.openai.com/v1/chat/completions', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify({
  //     model: 'gpt-3.5-turbo',
  //     messages: [{ role: 'user', content: message }]
  //   })
  // });
  
  // モック応答
  await new Promise(resolve => setTimeout(resolve, 1000)); // 1秒待機
  
  if (message.includes('天気')) {
    return '今日は晴れの予報です。外出には最適な日ですね！';
  } else if (message.includes('時間')) {
    return `現在の時刻は ${new Date().toLocaleTimeString()} です。`;
  } else if (message.includes('計算')) {
    return 'JavaScript: 2 + 2 = 4 です。他にも計算をお手伝いします！';
  } else {
    return `「${message}」についてお答えします。実際のプロジェクトでは、ここで外部APIからの応答を返します。`;
  }
};

const chatConfig = {
  title: "外部API連携チャット",
  placeholder: "「天気」「時間」「計算」などを試してみてください...",
  initialMessages: [
    createMessage(1, '外部API連携チャットデモへようこそ！', 2),
    createMessage(2, '実際のプロジェクトでは、ここでChatGPTやClaude等のAPIを呼び出します', 2)
  ],
  
  // カスタム色設定の例（プレースホルダー色を含む）
  colors: {
    userMessage: 'cyan',
    botMessage: 'magenta',
    inputLabel: 'green',
    inputText: 'white',
    inputPlaceholder: 'yellow', // プレースホルダーを黄色に設定
    header: 'cyan'
  },
  
  onMessageSend: async (messageText, helpers) => {
    try {
      if (messageText.includes('終了')) {
        helpers.addMessage('チャットを終了します。ありがとうございました！', 1);
        setTimeout(() => process.exit(0), 1500);
        return;
      }

      // API呼び出し（ローディング表示）
      helpers.addMessage('🤔 考え中...', 1);
      
      // モックAPI呼び出し
      const response = await mockAPICall(messageText);
      
      // 応答を表示
      setTimeout(() => {
        helpers.addMessage(response, 1);
      }, 500);
      
    } catch (error) {
      console.error('API Error:', error);
      helpers.addMessage('申し訳ありません、エラーが発生しました。', 2);
    }
  }
};

runTerminalChat(chatConfig);