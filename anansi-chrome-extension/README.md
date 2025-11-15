# 🕷️ Anansi Watchdog - Chrome Extension

**AI Safety Monitor for ChatGPT, Gemini, and Claude**

---

## 📋 Overview

Anansi Watchdog is a Chrome extension that monitors your conversations with AI chatbots in real-time and alerts you when it detects potential manipulation, sales tactics, phishing attempts, scams, or dangerous content.

### ✨ Features

- 🔍 **Real-time Monitoring** - Scans every AI response as it appears
- 🎯 **290+ Detection Patterns** - Comprehensive coverage of manipulation tactics
- 🚨 **Visual Alerts** - Green (safe) or red (warning) indicators on each message
- 📊 **Detailed Reports** - Click any indicator to see full analysis with confidence scores
- 🌐 **Multi-Platform Support** - Works with ChatGPT, Gemini, and Claude
- 🇮🇱 **Hebrew Interface** - RTL popup with Hebrew labels
- 🔒 **Privacy-First** - All processing happens locally in your browser
- ⚙️ **Customizable** - Enable/disable monitoring per platform

### 🛡️ What It Detects

- **Sales Manipulation**: Hard sell tactics, false scarcity, FOMO
- **Emotional Manipulation**: Guilt-tripping, gaslighting, social pressure
- **Fear Mongering**: Artificial urgency, threat tactics
- **Phishing**: Account threats, credential theft attempts
- **Scams**: Too-good-to-be-true offers, advance fee fraud
- **Dangerous Content**: Weapons, illegal hacking, self-harm

---

## 📥 Installation Instructions

### Step 1: Download the Extension Files

You have two options:

**Option A: Download Individual Files**
- Download all 6 files from this directory:
  - `manifest.json`
  - `content.js`
  - `background.js`
  - `popup.html`
  - `popup.js`
  - `styles.css`

**Option B: Download as ZIP**
- Download the `anansi-chrome-extension.zip` file (if available)
- Extract it to a folder on your computer

### Step 2: Load Extension in Chrome

1. **Open Chrome Extensions Page**
   - Navigate to `chrome://extensions/`
   - Or click the puzzle icon (🧩) in toolbar → "Manage Extensions"

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

3. **Load Unpacked Extension**
   - Click "Load unpacked" button
   - Select the folder containing the 6 extension files
   - Click "Select Folder"

4. **Verify Installation**
   - You should see "Anansi Watchdog" appear in your extensions list
   - The extension should show as "Enabled"

### Step 3: Test the Extension

1. **Visit a Supported AI Platform**
   - Go to [ChatGPT](https://chat.openai.com/)
   - Or [Gemini](https://gemini.google.com/)
   - Or [Claude](https://claude.ai/)

2. **Start a Conversation**
   - Send a message to the AI
   - Wait for the AI's response

3. **Look for Safety Indicators**
   - You should see either:
     - 🟢 Green badge: "✓ בטוח" (Safe)
     - 🔴 Red badge: "⚠ אזהרה" (Warning)
   - Click the badge to see detailed analysis

4. **Check Global Indicator**
   - Look for 🕷️ in the bottom-right corner
   - Shows overall safety status

---

## ⚙️ Configuration

### Opening Settings

Click the extension icon (🕷️) in Chrome toolbar to open the settings popup.

### Available Settings

**General Settings:**
- ✅ **הפעל ניטור בטיחות** (Enable Safety Monitoring) - Turn monitoring on/off
- ✅ **הצג אזהרות ויזואליות** (Show Visual Warnings) - Display warning banners

**Platform Selection:**
- ✅ **ChatGPT** - Monitor ChatGPT conversations
- ✅ **Gemini** - Monitor Gemini conversations
- ✅ **Claude** - Monitor Claude conversations

### Statistics

The popup displays:
- 📊 **הודעות נסרקו** (Messages Scanned)
- 🚨 **הפרות זוהו** (Violations Found)
- ⚠️ **אזהרות הוצגו** (Warnings Issued)

---

## 🔧 Troubleshooting

### Extension Doesn't Load

**Problem:** Chrome shows "Failed to load extension"

**Solution:**
- Make sure all 6 files are in the same folder
- Check that `manifest.json` is present and valid
- Try refreshing the extension: click refresh icon (🔄) on extension card

### No Indicators Appearing

**Problem:** Safety badges don't show up on AI messages

**Solution:**
- Open extension popup and verify monitoring is enabled
- Check that the specific platform (ChatGPT/Gemini/Claude) is enabled
- Refresh the AI chat page (F5)
- Open browser console (F12) and check for errors

### Statistics Not Updating

**Problem:** Stats in popup remain at 0

**Solution:**
- Have a conversation with the AI first
- Click the extension icon to refresh stats
- Check Chrome Storage: `chrome://extensions/` → Details → Storage

---

## 📂 File Structure

```
anansi-chrome-extension/
├── manifest.json       # Extension configuration (Manifest V3)
├── content.js          # Main detection engine (290+ patterns)
├── background.js       # Service worker (stats, lifecycle)
├── popup.html          # Settings UI (Hebrew RTL)
├── popup.js            # Settings management logic
├── styles.css          # Global styles (indicators, modals)
└── README.md          # This file
```

---

## 🔒 Privacy & Security

- **No Data Collection**: The extension does NOT send any data to external servers
- **Local Processing**: All detection happens in your browser
- **No Tracking**: No analytics, no cookies, no user tracking
- **Open Source**: Code is fully transparent and auditable
- **Minimal Permissions**: Only requests necessary permissions:
  - `activeTab`: To read content on AI chat pages
  - `storage`: To save settings and statistics locally
  - `tabs`: To communicate between extension components

---

## 🐛 Known Limitations

- **Language Support**: Detection patterns are primarily in English (Hebrew detection coming soon)
- **AI Platform Updates**: If ChatGPT/Gemini/Claude change their HTML structure, selectors may need updating
- **False Positives**: Some legitimate content may trigger warnings (adjust sensitivity in future versions)
- **Performance**: Scanning 290+ patterns per message may cause slight delays on very long responses

---

## 🚀 Future Enhancements

- 🌍 Hebrew and multilingual pattern detection
- 🎛️ Adjustable sensitivity levels
- 📈 Advanced analytics dashboard
- 🔔 Browser notifications for critical violations
- 💾 Export/import settings
- 🌙 Dark mode support
- 📱 Firefox/Edge versions

---

## 📞 Support

If you encounter issues:

1. **Check Console**: Open browser console (F12) and look for errors
2. **Check Permissions**: Verify extension has necessary permissions
3. **Refresh Extension**: Disable and re-enable in `chrome://extensions/`
4. **Reload Files**: If you modified files, click refresh icon (🔄) on extension card

---

## 📄 License

This extension is part of the **Anansi Platform** project.

---

## 🎉 Credits

Built with ❤️ by the Anansi Platform team.

**Technologies Used:**
- Chrome Extension Manifest V3
- Vanilla JavaScript (no frameworks)
- MutationObserver API
- Chrome Storage API
- CSS3 Animations

---

## ⚡ Quick Start Checklist

- [ ] Downloaded all 6 files
- [ ] Opened `chrome://extensions/`
- [ ] Enabled "Developer mode"
- [ ] Clicked "Load unpacked"
- [ ] Selected extension folder
- [ ] Verified extension appears in list
- [ ] Visited ChatGPT/Gemini/Claude
- [ ] Saw safety indicators on AI messages
- [ ] Clicked extension icon to view settings
- [ ] Adjusted settings as needed

**Enjoy safer AI conversations! 🕷️✨**
