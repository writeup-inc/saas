(() => {
  const button = document.getElementById('copy-address');
  const status = document.getElementById('copy-status');
  if (!button || !navigator.clipboard?.writeText) return;
  button.hidden = false;
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('〒107-0062 東京都港区南青山3-1-34 3rd MINAMI AOYAMA（オルクドール・サロンAOYAMA）');
      status.textContent = '建物名と住所をコピーしました。';
    } catch {
      status.textContent = 'コピーできませんでした。上の住所を選択してコピーしてください。';
    }
  });
})();
