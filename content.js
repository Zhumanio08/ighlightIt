async function showDictionary() {
    if (document.getElementById("dictionary-overlay")) return;
  
    const cssText = await (await fetch(chrome.runtime.getURL("dictionary.css"))).text();
  
    const html = `
      <div id="dictionary-overlay">
        <div id="dictionary-container">
          <div id="dictionary-header">
            <div id="logo-area">
              <img id="logo" alt="logo">
            </div>
            <div id="header-buttons">
              <img id="settings-icon" alt="settings">
              <img id="close-icon" alt="close">
            </div>
          </div>
  
          <div id="dictionary-content">
            <div id="table-header">
              <div>Слово</div>
              <div>Перевод</div>
            </div>
            <div id="dictionary-list"></div>
          </div>
        </div>
      </div>
    `;
  
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;
  
    const style = document.createElement("style");
    style.textContent = cssText;
  
    document.body.appendChild(style);
    document.body.appendChild(wrapper);
  
    document.getElementById("logo").src = chrome.runtime.getURL("images/logo.png");
    document.getElementById("settings-icon").src = chrome.runtime.getURL("images/settings.png");
    document.getElementById("close-icon").src = chrome.runtime.getURL("images/close.png");
  
    document.getElementById("close-icon").addEventListener("click", () => {
      document.getElementById("dictionary-overlay").classList.add("fade-out");
      setTimeout(() => document.getElementById("dictionary-overlay").remove(), 200);
    });
  
    loadDictionary();
  }
  
  function loadDictionary() {
    chrome.storage.local.get({ dictionary: [] }, (data) => {
      const list = document.getElementById("dictionary-list");
      list.innerHTML = "";
  
      if (!data.dictionary.length) {
        list.innerHTML = `<p class="empty">Словарь пуст</p>`;
      } else {
        data.dictionary.forEach(({ word, translation }) => {
          const row = document.createElement("div");
          row.className = "word-row";
          row.innerHTML = `
            <div class="word-cell">${word}</div>
            <div class="translation-cell">${translation || "—"}</div>
          `;
          list.appendChild(row);
        });
      }
    });
  }
  
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "openDictionary") showDictionary();
  });


  