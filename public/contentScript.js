let tooltipOpen = false; // Flag to track whether the tooltip is currently open
let port; // Declare the port variable globally for persistent connection with background script

/**
 * Function to establish a persistent connection to the background script.
 * This connection is used to send and receive messages for translation.
 */
function connectToBackground() {
    port = chrome.runtime.connect({ name: "translation-port" }); // Connect to the background script

    // Add listener for port disconnection, attempt to reconnect if disconnected
    port.onDisconnect.addListener(handlePortDisconnect);

    // Add listener to handle incoming messages from the background script
    port.onMessage.addListener(handleMessageFromBackground);
}

/**
 * Function to handle the incoming translation result from the background script.
 * @param {Object} request - The message object received from the background script.
 */
function handleMessageFromBackground(request) {
    if (request.action === "showTranslation") {
        const tooltip = document.getElementById('translation-tooltip');
        if (tooltip) {
            // Update the tooltip with the translated text
            updateTooltipContent(tooltip, request.translation);
        }
    }
}

/**
 * Function to update the content of the tooltip with the translation.
 * @param {HTMLElement} tooltip - The tooltip element.
 * @param {string} translation - The translated text to display inside the tooltip.
 */
function updateTooltipContent(tooltip, translation) {
    // Create a <p> element for the translation text and apply styling
    tooltip.innerHTML = `<p class="translation-text">${translation}</p>`;
    const translationParagraph = tooltip.querySelector('.translation-text');
    translationParagraph.style.padding = '10px'; // Adjust the padding for better readability

    // Append the close button to the tooltip
    const closeButton = createCloseButton();
    tooltip.appendChild(closeButton);
}

/**
 * Function to create a close button for the tooltip.
 * This button will be used to close the tooltip when clicked.
 * @returns {HTMLElement} The close button element.
 */
function createCloseButton() {
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;'; // Cross symbol for closing the tooltip
    closeButton.style.position = 'absolute';
    closeButton.style.top = '3px';
    closeButton.style.right = '2px';
    closeButton.style.paddingLeft = '5px';
    closeButton.style.border = 'none';
    closeButton.style.background = 'transparent';
    closeButton.style.fontSize = '18px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.color = '#1b1c1c'; // Dark color for the cross symbol

    // Add event handler to close the tooltip when the button is clicked
    closeButton.onclick = function () {
        closeTooltip();
    };

    return closeButton;
}

/**
 * Function to handle port disconnection and attempt to reconnect.
 * This ensures that the connection is re-established if it gets disconnected.
 */
function handlePortDisconnect() {
    console.warn("Port disconnected, attempting to reconnect...");
    setTimeout(connectToBackground, 1000); // Attempt to reconnect after 1 second
}

/**
 * Function to close the tooltip and clean up event listeners.
 * This removes the tooltip from the DOM and disables any further events related to it.
 */
function closeTooltip() {
    const tooltip = document.getElementById('translation-tooltip');
    if (tooltip) {
        tooltip.remove(); // Remove the tooltip from the DOM
        tooltipOpen = false; // Set the flag to indicate the tooltip is closed
        document.removeEventListener('mousedown', handleOutsideClick); // Remove event listener for outside clicks
    }
}

/**
 * Function to create the tooltip element that displays the selected text and translation options.
 * @param {string} text - The selected text that needs to be translated.
 * @param {number} x - The X-coordinate where the tooltip should appear.
 * @param {number} y - The Y-coordinate where the tooltip should appear.
 */
function createTooltip(text, x, y) {
    if (tooltipOpen) return; // If the tooltip is already open, don't create a new one

    const tooltip = document.createElement('div');
    tooltip.id = 'translation-tooltip'; // Set the ID to identify the tooltip later
    styleTooltip(tooltip, x, y); // Apply styling to the tooltip

    // Create the translate button and append it to the tooltip
    const translateButton = createTranslateButton(text);
    tooltip.appendChild(translateButton);

    // Create the close button and append it to the tooltip
    const closeButton = createCloseButton();
    tooltip.appendChild(closeButton);

    // Append the tooltip to the document's body
    document.body.appendChild(tooltip);
    tooltipOpen = true; // Set the flag indicating the tooltip is now open

    // Add event listener to close the tooltip when clicking outside of it
    document.addEventListener('mousedown', handleOutsideClick);
}

/**
 * Function to apply styling to the tooltip element.
 * This centralizes the tooltip's styling logic for better readability and maintainability.
 * @param {HTMLElement} tooltip - The tooltip element.
 * @param {number} x - The X-coordinate for positioning the tooltip.
 * @param {number} y - The Y-coordinate for positioning the tooltip.
 */
function styleTooltip(tooltip, x, y) {
    tooltip.style.position = 'absolute';
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
    tooltip.style.padding = '5px';
    tooltip.style.backgroundColor = '#d4d2cd';
    tooltip.style.color = '#1b1c1c';
    tooltip.style.borderRadius = '5px';
    tooltip.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.2)';
    tooltip.style.zIndex = '9999';
    tooltip.style.width = 'auto';
    tooltip.style.maxHeight = '300px'; // Limit the height of the tooltip for large translations
    tooltip.style.overflowY = 'auto'; // Enable scrolling if the content overflows
    tooltip.style.display = 'flex'; // Use flexbox for alignment
    tooltip.style.justifyContent = 'space-between';
    tooltip.style.minWidth = '120px'; // Minimum width for the tooltip
}

/**
 * Function to create the translate button with an icon.
 * This button will trigger the translation process when clicked.
 * @param {string} text - The selected text to be translated.
 * @returns {HTMLElement} The translate button element.
 */
function createTranslateButton(text) {
    const translateButton = document.createElement('button');
    translateButton.style.marginTop = '5px';
    translateButton.style.marginRight = '5px';
    translateButton.style.cursor = 'pointer';
    translateButton.style.backgroundColor = 'transparent'; // Transparent background
    translateButton.style.border = 'none'; // No border to make it look like an icon

    // Add the translate icon to the button
    const translateIcon = document.createElement('img');
    translateIcon.src = chrome.runtime.getURL('icons/google-translate.svg'); // Get the correct path for the icon
    translateIcon.style.width = '16px'; // Set the icon width
    translateIcon.style.height = '18px'; // Set the icon height

    translateButton.appendChild(translateIcon); // Append the icon to the button

    // Add event handler for translating the selected text
    translateButton.onclick = function () {
        console.log("Attempting to translate text: ", text);
        sendTranslationRequest(text); // Send the request to translate the text
    };

    return translateButton;
}

/**
 * Function to send the translation request to the background script.
 * This communicates with the background script to trigger the translation process.
 * @param {string} text - The text that needs to be translated.
 */
function sendTranslationRequest(text) {
    if (port) {
        try {
            // Send a message to the background script with the text to translate
            port.postMessage({ action: "translate", text });
        } catch (error) {
            console.error("Error during message passing: ", error);
            handlePortDisconnect(); // Reconnect if the port is unavailable
        }
    } else {
        console.warn("Port not available, attempting to reconnect...");
        handlePortDisconnect(); // Attempt to reconnect if the port is unavailable
    }
}

/**
 * Function to handle outside clicks to close the tooltip.
 * This ensures that the tooltip closes when the user clicks outside of it.
 * @param {MouseEvent} event - The mouse event object.
 */
function handleOutsideClick(event) {
    const tooltip = document.getElementById('translation-tooltip');
    if (tooltip && !tooltip.contains(event.target)) {
        closeTooltip(); // Close the tooltip if the click is outside the tooltip
    }
}

/**
 * Event listener for text selection.
 * When the user selects text, a tooltip will appear near the selected text offering translation.
 */
document.addEventListener('mouseup', function (event) {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText.length > 0) {
        const x = event.pageX;
        const y = event.pageY;
        createTooltip(selectedText, x, y); // Create and display the tooltip
    }
});

// Connect to the background script when the content script loads
connectToBackground();
