<script>
	import TranslatorWidget from './components/TranslatorWidget.svelte';
	let translation = "";
	let loading = false;
  
	chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	  if (request.action === "showTranslation") {
		translation = request.translation;
		loading = false;
	  }
	});
  
	$: if (window.getSelection().toString()) {
	  loading = true;
	  chrome.runtime.sendMessage({ action: "translate", text: window.getSelection().toString() });
	}
  </script>
  
  <TranslatorWidget {translation} {loading} />
  