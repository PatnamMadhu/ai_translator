// Function to make the OpenAI API call and handle translation logic
function translateSelectedText(text, callback) {
    console.log("Making API call to OpenAI with text: ", text);

    fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": ``  // Replace with your OpenAI API key
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a helpful assistant that translates text." },
                { role: "user", content: `Please translate this text: "${text}" into Chinese or English depending on the language, and return only the translated text.` }
            ],
            max_tokens: 300
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data && data.choices && data.choices.length > 0) {
            const translation = data.choices[0].message.content.trim();
            console.log("Translation received: ", translation);
            callback({ success: true, translation });
        } else {
            console.error("No translation choices received.");
            callback({ success: false, message: "No translation available." });
        }
    })
    .catch(error => {
        console.error("Error during API call:", error);
        callback({ success: false, message: "API call failed", error });
    });
}

// Listener for persistent port connections from content scripts or popup
chrome.runtime.onConnect.addListener(function (port) {
    if (port.name === "translation-port") {
        port.onMessage.addListener(function (request) {
            if (request.action === "translate") {
                console.log("Received text to translate: ", request.text);
                handleTranslationRequest(request.text, (response) => {
                    port.postMessage({ action: "showTranslation", translation: response.translation });
                });
            }
        });
    }
});

// Listener for one-time messages from content scripts or popup
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "translate") {
        const { sourceLang, targetLang, text } = request;

        console.log(`Translating from ${sourceLang} to ${targetLang}: ${text}`);

        // Prepare the translation prompt dynamically
        const prompt = createTranslationPrompt(sourceLang, targetLang, text);

        // Handle the translation request
        handleTranslationRequest(prompt, (response) => {
            if (response.success) {
                chrome.runtime.sendMessage({ action: "showTranslation", translation: response.translation });
            } else {
                console.error("Translation failed: ", response.message);
            }
        });
    }
});

// Function to dynamically create the translation prompt
function createTranslationPrompt(sourceLang, targetLang, text) {
    const sourceLangLabel = sourceLang === 'zh' ? 'Chinese' : 'English';
    const targetLangLabel = targetLang === 'zh' ? 'Chinese' : 'English';
    return `Translate the following text from ${sourceLangLabel} to ${targetLangLabel}: "${text}" and return only the translated text.`;
}

// Function to handle the translation request and pass the result via callback
function handleTranslationRequest(text, callback) {
    translateSelectedText(text, (response) => {
        if (response.success) {
            console.log("Translation successful");
            callback(response);
        } else {
            console.error("Translation failed", response.message);
            callback({ success: false, message: response.message });
        }
    });
}
