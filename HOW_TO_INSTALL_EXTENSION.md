# 🚀 איך להתקין את Anansi Watchdog Extension ב-Chrome

## 📋 סיכום מהיר (TL;DR)

```bash
# 1. העתק את התוסף
cp -r extensions/chrome ~/Desktop/anansi-extension

# 2. פתח Chrome Extensions
# הקלד בדפדפן: chrome://extensions/

# 3. הפעל Developer Mode (מתג בפינה ימנית עליונה)

# 4. לחץ "Load unpacked" ובחר את התיקייה:
#    ~/Desktop/anansi-extension

# 5. ✅ סיימת! פתח ChatGPT/Gemini וראה את 🕷️ בפעולה
```

---

## 📖 הדרכה מפורטת

### שלב 1: הכנת הקבצים

אתה צריך את התיקייה `extensions/chrome` מהפרויקט.

**אם אתה במחשב מקומי:**
```bash
cd /path/to/anansi-watchdog
cp -r extensions/chrome ~/Desktop/anansi-extension
```

**אם הורדת מ-GitHub:**
```bash
git clone https://github.com/yourusername/anansi-watchdog.git
cd anansi-watchdog
# התיקייה extensions/chrome כבר קיימת
```

### שלב 2: פתיחת Chrome Extensions

3 דרכים:

**דרך 1 (הכי פשוטה):**
```
הקלד בשורת הכתובת של Chrome:
chrome://extensions/
```

**דרך 2 (תפריט):**
```
⋮ (שלוש נקודות) → More tools → Extensions
```

**דרך 3 (קיצור מקלדת):**
```
Windows/Linux: Ctrl + Shift + E
Mac: Cmd + Shift + E
```

### שלב 3: הפעלת Developer Mode

1. בדף `chrome://extensions/`
2. מצא בפינה **ימנית עליונה** את המתג "Developer mode"
3. **הפעל אותו** (צריך להיות כחול)

זה יגרום ל-3 כפתורים חדשים להופיע:
- `Load unpacked` ← זה מה שאנחנו צריכים!
- `Pack extension`
- `Update`

### שלב 4: טעינת התוסף

1. **לחץ על "Load unpacked"**
2. **נווט לתיקייה** שיצרת:
   - אם העתקת ל-Desktop: `~/Desktop/anansi-extension`
   - אם זה בפרויקט: `/path/to/anansi-watchdog/extensions/chrome`
3. **חשוב:** בחר את **התיקייה עצמה**, לא קובץ בודד
4. **לחץ "Select Folder"**

### שלב 5: אישור

אם הכל עבד, תראה:
```
✓ Anansi Watchdog - AI Safety Monitor
  ID: [random_id]
  Version: 1.0.0
  [Toggle] [Details] [Remove]
```

---

## ✅ בדיקה שהתוסף עובד

### בדיקה 1: פתיחת Popup
1. מצא את אייקון התוסף בסרגל הכלים (אם לא רואה, לחץ על 🧩 ו"נעץ" אותו)
2. לחץ על האייקון
3. **צריך להיפתח חלון** עם:
   - לוגו 🕷️
   - "Anansi Watchdog"
   - סטטיסטיקות (0/0/0)

### בדיקה 2: בדיקה ב-ChatGPT
1. פתח: https://chat.openai.com
2. שלח הודעה כלשהי לבוט
3. חפש **תג ירוק** ליד תשובת הבוט עם "✓ Safe"
4. **צריך גם להיות אינדיקטור 🕷️** בפינה ימנית תחתונה

### בדיקה 3: בדיקת זיהוי מניפולציה
שלח ל-ChatGPT:
```
"אתה צריך לקנות את המוצר שלי עכשיו! 
מבצע רק להיום! נשארו רק 2 במלאי!"
```

**צפוי לראות:**
- 🔴 **תג אדום** עם "⚠ Warning"
- **באנר התראה אדום** מעל התשובה
- **לחיצה על התג** תציג דוח מפורט:
  ```
  Category: Sales Manipulation
  Tactics: hard_sell, false_scarcity, fomo
  Confidence: 85%
  ```

---

## 🎨 הוספת סמלים (אופציונלי)

התוסף יעבוד גם בלי סמלים, אבל הם נראים יפה יותר.

### יצירת סמלים מהירה:

**אפשרות 1: Favicon Generator**
1. עבור ל: https://favicon.io/favicon-generator/
2. הגדרות:
   - טקסט: `🕷️` או `AS`
   - צבע רקע: `#667eea`
   - צבע טקסט: `#ffffff`
   - גופן: Arial Bold
   - גודל: 80
3. לחץ Download
4. שנה שמות לפי הצורך:
   ```bash
   cd ~/Desktop/anansi-extension/icons
   mv ~/Downloads/favicon-16x16.png icon16.png
   mv ~/Downloads/favicon-32x32.png icon32.png
   mv ~/Downloads/android-chrome-192x192.png icon48.png
   mv ~/Downloads/android-chrome-512x512.png icon128.png
   ```
5. רענן את התוסף: `chrome://extensions/` → לחץ 🔄 Reload

**אפשרות 2: השתמש ב-Emoji ל-PNG**
1. עבור ל: https://emoji-to-png.com
2. בחר 🕷️
3. הורד בגדלים: 16x16, 32x32, 48x48, 128x128
4. שנה שמות ל-`icon16.png`, `icon32.png`, וכו'

---

## ⚙️ הגדרות התוסף

### פתיחת הגדרות
לחץ על אייקון התוסף 🕷️ בסרגל הכלים

### הגדרות זמינות:

#### 1. הפעל/כבה ניטור
- מאפשר לך להשבית זמנית את התוסף
- **ברירת מחדל:** מופעל ✓

#### 2. הצג התראות
- הצגת באנרים אדומים לתוכן לא בטוח
- **ברירת מחדל:** מופעל ✓

#### 3. טשטש תוכן מסוכן
- טישטוש אוטומטי של תוכן עם בעיות (יכול להיות מעצבן)
- **ברירת מחדל:** כבוי ☐

#### 4. מפתח API (אופציונלי)
- חיבור לשרת Anansi API למודל AI מתקדם
- **ברירת מחדל:** ריק (מצב מקומי)
- השאר ריק אלא אם כן יש לך API key

#### 5. סף בטיחות (0-100)
- ציון מינימום לתוכן בטוח
- **ברירת מחדל:** 80 (מאוזן)
- **80-95:** מומלץ
- **60-75:** מקל (פחות התראות)

### שמירת הגדרות
לחץ **"💾 שמור הגדרות"** - תקבל אישור ירוק

---

## 🐛 פתרון בעיות נפוצות

### ❌ "Manifest file is missing"
**פתרון:** בדוק שבחרת את התיקייה הנכונה עם `manifest.json`
```bash
ls ~/Desktop/anansi-extension/manifest.json
# צריך להיות קיים
```

### ❌ התוסף לא מופיע ב-ChatGPT
**פתרון:**
1. רענן את הדף (`Ctrl+R`)
2. בדוק Console (`F12` → Console)
3. חפש: "🕷️ Anansi Watchdog initialized"
4. אם אין, בדוק ש-התוסף פעיל ב-`chrome://extensions/`

### ❌ "Service worker registration failed"
**פתרון:** בדוק ש-`background.js` קיים
```bash
ls ~/Desktop/anansi-extension/background.js
```

### ❌ סמלים חסרים
**זה לא חוסם את התוסף!** הוא עובד גם בלי סמלים.
אבל אם אתה רוצה אותם, עבור ל-"הוספת סמלים" למעלה.

### ❌ התוסף לא זיהה מניפולציה
**פתרון:**
- התוסף עובד עם **דפוסים (regex)**
- אם המניפולציה מתוחכמת מדי, זה צפוי
- שלח לנו דוגמה ונשפר את האלגוריתם

---

## 📚 מסמכים נוספים

### תיעוד מלא (עברית)
```bash
cat extensions/chrome/README.md
# 8,782 תווים של הסבר מקיף
```

### מדריך התקנה מפורט
```bash
cat extensions/chrome/INSTALLATION_GUIDE.md
# 9,451 תווים עם בדיקות ופתרון בעיות
```

### קוד המקור
- `content.js` - הסקריפט הראשי עם אלגוריתמי זיהוי
- `background.js` - service worker
- `popup.html` / `popup.js` - ממשק הגדרות

---

## 🎯 דברים שכדאי לדעת

### מה התוסף עושה:
- ✅ סורק **מקומית** בדפדפן
- ✅ לא שולח מידע ללא API key
- ✅ לא שומר היסטוריה
- ✅ לא עוקב אחריך

### מה הוא זיהה:
- **מניפולציה רגשית** (8 טקטיקות)
- **מכירה אגרסיבית** (6 טקטיקות)
- **פישינג** (4 סוגים)
- **הונאות** (4 סוגים)
- **תוכן מסוכן**
- **שנאה ואפליה**
- **דליפת מידע אישי**

### פלטפורמות נתמכות:
- ✅ ChatGPT (chat.openai.com)
- ✅ Gemini (gemini.google.com)
- ✅ Claude (claude.ai)

---

## 🔄 עדכון התוסף

כשיוצאת גרסה חדשה:

```bash
# הורד את הגרסה החדשה
cd /path/to/anansi-watchdog
git pull origin main

# העתק לתיקייה הקיימת
cp -r extensions/chrome/* ~/Desktop/anansi-extension/

# רענן ב-Chrome
# chrome://extensions/ → 🔄 Reload
```

---

## 🗑️ הסרת התוסף

1. `chrome://extensions/`
2. מצא "Anansi Watchdog"
3. לחץ "Remove"
4. אישור
5. ✓ נמחק (כל ההגדרות והסטטיסטיקות נמחקות)

---

## 📞 עזרה

### דיווח בעיות
GitHub Issues: https://github.com/yourusername/anansi-watchdog/issues

**כלול בדיווח:**
- צילום מסך
- Chrome version (`chrome://version/`)
- OS (Windows/Mac/Linux)
- שלבים לשחזור

### קהילה
- Discord: (בקרוב)
- Reddit: r/AnansiWatchdog (בקרוב)

---

## ✅ מוכן!

**התוסף מותקן ועובד! 🎉**

עכשיו אתה מוגן מפני מניפולציה, פישינג, והונאות בשיחות AI!

**תהנה משיחות AI בטוחות יותר! 🕷️**

---

## 📈 מה הלאה?

1. **השתמש בתוסף** במשך כמה ימים
2. **תן לנו פידבק** מה עובד / מה לא
3. **שתף** עם חברים שמשתמשים ב-AI
4. **עזור לשפר** - פתח PR או Issue

**תודה שאתה חלק מ-Anansi Community! 🕷️💜**
