chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

chrome.commands.onCommand.addListener((command) => {
  console.log(`Command: ${command}`);
  if (command === "open-adhd-tab-manager") {
    chrome.windows.getCurrent(window => {
      chrome.sidePanel.open({ windowId: window.id }, () => console.log("Side panel opened"));
    });
  }
});
