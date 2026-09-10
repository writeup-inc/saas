(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,48444,e=>{"use strict";var t=e.i(43476),a=e.i(71645);let s="https://writeup-inc.github.io/saas/writeup-ai-history/",i=["ライトアップは、なぜAIに強い会社なの？","自社に合いそうなAI支援を教えて","AI事業の歴史を3分で分かるように説明して"];e.s(["default",0,function(){let[e,r]=(0,a.useState)(!1),[n,c]=(0,a.useState)("");return(0,t.jsx)("aside",{className:`chatgpt-launcher ${e?"is-open":""}`,"aria-label":"ChatGPTでライトアップについて質問する",children:e?(0,t.jsxs)("div",{className:"chatgpt-panel",children:[(0,t.jsx)("button",{className:"chatgpt-close",type:"button",onClick:()=>r(!1),"aria-label":"閉じる",children:"×"}),(0,t.jsx)("span",{className:"chatgpt-label",children:"ASK WITH SOURCES"}),(0,t.jsxs)("h2",{children:["ChatGPTに",(0,t.jsx)("br",{}),"聞いてみる"]}),(0,t.jsx)("p",{children:"このページと公開資料をもとに、ライトアップのAI事業について確認できます。"}),(0,t.jsx)("div",{className:"chatgpt-questions","aria-label":"質問例",children:i.map(e=>(0,t.jsxs)("button",{type:"button",onClick:()=>{let t,a,i;return t=`（株）ライトアップのAI事業について顧客からの質問に答えてください。
わかりやすく、読みやすく、そして読む人に優しい文章で生成してください。

【お客様の質問】
「${e}」

【対象ページ】※回答時に参照してください
[${s}](${s})

【回答ルール】
- 営業担当ではなく、公開情報を調べる **中立的な案内役** として親切に回答する
- まず対象ページの情報から回答し、外部検索は必要な場合だけ行う
- 確認できる事実、ライトアップ社内の一次情報、推測を明確に分ける
- 重要な説明には参照したURLを付ける
- 確認できない内容は推測せず、「確認できない」と伝える
- 料金、契約条件、効果保証は断定しない
- この後の質問にも、対象ページと出典を前提に日本語で答える

回答の最後に、内容に合わせた具体的な選択肢5つ表示してください。`,a=`https://chatgpt.com/?q=${encodeURIComponent(t)}`,i=function(e){if(navigator.clipboard?.writeText)return navigator.clipboard.writeText(e);let t=document.createElement("textarea");t.value=e,t.setAttribute("readonly",""),t.style.position="fixed",t.style.opacity="0",document.body.appendChild(t),t.select();let a=document.execCommand("copy");return document.body.removeChild(t),a?Promise.resolve():Promise.reject(Error("copy failed"))}(t),void(window.open(a,"_blank","noopener,noreferrer"),i.then(()=>c("質問文をコピーしました。表示されない場合は、ChatGPTの入力欄へ貼り付けてください。")).catch(()=>c("ChatGPTが開きます。質問文が表示されない場合は、このページに戻って再度お試しください。")))},children:[(0,t.jsx)("span",{children:e}),(0,t.jsx)("b",{"aria-hidden":"true",children:"↗"})]},e))}),(0,t.jsx)("small",{children:"ChatGPTが別画面で開きます。入力欄に質問文を事前入力します。"}),n&&(0,t.jsx)("p",{className:"chatgpt-notice",role:"status",children:n})]}):(0,t.jsx)("div",{className:"ai-provider-triggers",children:(0,t.jsxs)("button",{className:"chatgpt-trigger",type:"button",onClick:()=>{r(!0),c("")},"aria-expanded":"false",children:[(0,t.jsx)("span",{className:"chatgpt-trigger-icon","aria-hidden":"true",children:"AI"}),(0,t.jsxs)("span",{children:["ChatGPTに",(0,t.jsx)("br",{}),"聞いてみる"]})]})})})}])}]);