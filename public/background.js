
chrome.commands.onCommand.addListener((command) => {
  console.log(`Command: ${command}`);
  if (command === "open-adhd-tab-manager") {
    // open adhd extension popup
    chrome.action.openPopup()
  }
});
