#!/usr/bin/env node

/**
 * 最適化された色設定デモ - 黒いターミナル背景での視認性を重視
 */

import { runTerminalChat } from '../dist/lib/index.js';

const colorOptimizedHandler = async (message, helpers) => {
  if (message.toLowerCase().includes("色") || message.toLowerCase().includes("カラー")) {
    helpers.addMessage("🎨 この色設定は黒いターミナル背景で最適化されています！", false);
  } else if (message.toLowerCase().includes("見やすい") || message.toLowerCase().includes("視認性")) {
    helpers.addMessage("👀 各コンポーネントの色が見やすく調整されています：\n• ユーザーメッセージ: 明るい緑\n• ボットメッセージ: 明るい青\n• ヘッダー: 明るいシアン\n• 入力欄: 明るい黄色", false);
  } else {
    const thinking = helpers.addMessage("🤔 考え中...", false);
    
    setTimeout(() => {
      thinking.update("💭 黒背景に映える色で回答を準備中...");
    }, 1000);
    
    setTimeout(() => {
      thinking.remove();
      helpers.addMessage(`「${message}」について、\n視認性の良い色でお答えします！`, false);
    }, 2500);
  }
};

// 黒背景最適化チャットアプリケーション
runTerminalChat({
  title: "🌟 黒背景最適化チャット",
  placeholder: "'色'や'見やすい'と入力してテストしてください...",
  initialMessages: [
    {
      id: 'color-welcome',
      text: '🎯 黒背景最適化デモへようこそ！',//\n\nこのチャットは黒いターミナル背景での視認性を重視した色設定になっています：\n\n📋 色設定の特徴：\n• ユーザーメッセージ: 明るい緑 (greenBright)\n• ボットメッセージ: 明るい青 (blueBright)\n• ヘッダー: 明るいシアン (cyanBright)\n• タイムスタンプ: シアン (cyan)\n• 入力ラベル: 明るい黄色 (yellowBright)\n• スクロール表示: マゼンタ (magenta)\n\n「色」や「見やすい」と入力して試してください！',
      isUser: false,
      timestamp: new Date()
    }
  ],
  onMessageSend: colorOptimizedHandler,
  // デフォルト色設定を使用（constants.tsの最適化された色）
  colors: {} 
}).catch(error => {
  console.error('色最適化デモエラー:', error);
  process.exit(1);
});