(() => {
  const root = document.querySelector('.chatgpt-launcher');
  if (!root) return;

  const trigger = root.querySelector('.chatgpt-trigger');
  const panel = root.querySelector('.chatgpt-panel');
  const close = root.querySelector('.chatgpt-close');
  const status = root.querySelector('.chatgpt-status');

  const setOpen = (open) => {
    panel.hidden = !open;
    trigger.hidden = open;
    trigger.setAttribute('aria-expanded', String(open));
    if (open) close.focus();
    else trigger.focus();
  };

  const buildPrompt = (question) => `連続小説「アタルとタケル」の${root.dataset.pageTitle}について、読者の質問に答えてください。
読みやすく、作品を楽しむ人に優しい日本語で回答してください。

【読者の質問】
「${question}」

【対象ページ】
${root.dataset.canonicalUrl}

【ページの位置づけ】
${root.dataset.pageContext}

【回答ルール】
- まず対象ページの公開情報を参照する
- 物語本文・公式設定・推測や考察を明確に分ける
- 未公開話の展開や、ページに書かれていない設定を事実として作らない
- 確認できない内容は「確認できない」と伝える
- 作中の町・会社・人物・出来事はフィクションとして扱う
- 回答の最後に、続けて聞ける具体的な質問を3つ示す

質問文はまだ送信せず、入力欄に表示した状態で止めてください。`;

  trigger.addEventListener('click', () => setOpen(true));
  close.addEventListener('click', () => setOpen(false));

  panel.addEventListener('click', (event) => {
    const button = event.target.closest('[data-question]');
    if (!button) return;

    const prompt = buildPrompt(button.dataset.question);
    window.open(`https://chatgpt.com/?q=${encodeURIComponent(prompt)}`, '_blank', 'noopener,noreferrer');

    status.textContent = 'ChatGPTを開きました。質問文が表示されない場合に備えてコピーします。';
    const copyPromise = navigator.clipboard?.writeText(prompt);
    copyPromise
      ?.then(() => {
        status.textContent = '質問文をコピーしました。内容を確認してから送信してください。';
      })
      .catch(() => {
        status.textContent = 'ChatGPTで質問文を確認してから送信してください。';
      });
    if (!copyPromise) status.textContent = 'ChatGPTで質問文を確認してから送信してください。';
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) setOpen(false);
  });
})();
