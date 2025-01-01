// Swap source and target language
document.getElementById("switchLang").addEventListener("click", function() {
    const sourceLang = document.getElementById("sourceLanguage").value;
    const targetLang = document.getElementById("targetLanguage").value;

    document.getElementById("sourceLanguage").value = targetLang;
    document.getElementById("targetLanguage").value = sourceLang;
});

// Listen for the translate button click
document.getElementById("translateButton").addEventListener("click", function () {
    const sourceText = document.getElementById("sourceText").value;
    const sourceLang = document.getElementById("sourceLanguage").value;
    const targetLang = document.getElementById("targetLanguage").value;

    if (!sourceText.trim()) {
        alert("Please enter some text to translate!");
        return;
    }

    // Send a message to the background script to perform translation
    chrome.runtime.sendMessage({
        action: "translate",
        text: sourceText,  // Use user-entered text
        sourceLang: sourceLang,
        targetLang: targetLang
    });
});

// Listen for translation result
chrome.runtime.onMessage.addListener(function (request) {
    if (request.action === "showTranslation") {
        document.getElementById("translatedText").value = request.translation;
    }
});
