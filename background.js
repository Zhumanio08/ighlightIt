chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "addToDictionary",
    title: "Добавить в словарь",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "openDictionary",
    title: "Открыть словарь",
    contexts: ["page", "selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab.id) return;

  switch (info.menuItemId) {
    case "addToDictionary":
      const word = info.selectionText.trim();
      if (!word) return;
      const translation = await translateWord(word, "en", "ru");

      // Сохранение слова
      chrome.storage.local.get({ dictionary: [] }, (data) => {
        const exists = data.dictionary.find((item) => item.word === word);
        if (exists) return;

        data.dictionary.push({ word, translation });
        chrome.storage.local.set({ dictionary: data.dictionary }, () => {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (word, translation) =>
              alert(`"${word}" → "${translation}" добавлено в словарь ✅`),
            args: [word, translation]
          });
        });
      });
      break;

    case "openDictionary":
      chrome.tabs.sendMessage(tab.id, { action: "openDictionary" });
      break;
  }
});



async function translateWord(text, sourceLang = "auto", targetLang = "ru") {
  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
    );
    const data = await res.json();
    return data[0][0][0];
  } catch (err) {
    console.error("Ошибка Google Translate:", err);
    return "(перевод недоступен)";
  }
}

