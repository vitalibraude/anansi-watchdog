# 📖 מדריך התקנה מפורט - Anansi Watchdog Chrome Extension

## 🎯 מה תצטרך

- ✅ Google Chrome Browser (גרסה 88 ואילך)
- ✅ הקבצים של התוסף (התיקייה `extensions/chrome`)
- ✅ 5 דקות של זמן

---

## 📦 שלב 1: הכנת הקבצים

### אפשרות א': העתקה מהפרויקט
```bash
# אם אתה בתיקיית הפרויקט
cd /path/to/anansi-watchdog

# העתק את תיקיית התוסף למקום נוח
cp -r extensions/chrome ~/Desktop/anansi-extension

# תראה הודעת אישור
echo "✓ התוסף הועתק ל-Desktop"
```

### אפשרות ב': הורדה מ-GitHub
```bash
# שכפול הפרויקט
git clone https://github.com/yourusername/anansi-watchdog.git

# מעבר לתיקיית התוסף
cd anansi-watchdog/extensions/chrome

# בדיקה שהקבצים קיימים
ls -la
# אמור להציג: manifest.json, content.js, popup.html, וכו'
```

---

## 🚀 שלב 2: טעינת התוסף ל-Chrome

### 2.1 פתיחת דף Extensions
יש **3 דרכים** לפתוח את דף ההרחבות:

**דרך 1: URL ישיר**
```
הקלד בשורת הכתובת:
chrome://extensions/
```

**דרך 2: תפריט Chrome**
1. לחץ על שלוש הנקודות ⋮ בפינה הימנית העליונה
2. לחוץ **More tools** (עוד כלים)
3. לחץ **Extensions** (הרחבות)

**דרך 3: קיצור דרך**
- Windows/Linux: `Ctrl + Shift + E`
- Mac: `Cmd + Shift + E` (לא תמיד עובד)

### 2.2 הפעלת Developer Mode
ברגע שאתה בדף `chrome://extensions/`:

1. **מצא את המתג "Developer mode"** בפינה הימנית **העליונה**
   ```
   ┌─────────────────────────────────────┐
   │ Extensions           Developer mode │ ◀── הפעל את זה!
   │                                  ☐  │
   └─────────────────────────────────────┘
   ```

2. **לחץ על המתג** - הוא צריך להפוך **כחול** ולהציג "ON"

3. **יופיעו 3 כפתורים חדשים:**
   - `Load unpacked` (טען לא ארוז)
   - `Pack extension` (ארוז הרחבה)
   - `Update` (עדכן)

### 2.3 טעינת התוסף
1. **לחץ על "Load unpacked"** (טען לא ארוז)
   
2. **בוחר את התיקייה:**
   - נווט ל-`~/Desktop/anansi-extension` (או איפה שהעתקת)
   - **חשוב:** בחר את **התיקייה עצמה**, לא קובץ בודד!
   - התיקייה צריכה להכיל את `manifest.json`

3. **לחץ "Select Folder"** (בחר תיקייה)

### 2.4 אישור התקנה
אם הכל תקין, תראה:
```
✓ Anansi Watchdog - AI Safety Monitor
  ID: abcdefghijklmnopqrstuvwxyz...
  Version: 1.0.0
  [Toggle ON/OFF] [Details] [Remove]
```

אם יש שגיאה, עבור ל-**פתרון בעיות** למטה 👇

---

## ✅ שלב 3: בדיקה שהתוסף עובד

### 3.1 בדיקת אייקון
- **חפש את האייקון 🕷️** בסרגל הכלים של Chrome (למעלה)
- אם לא רואה אותו, לחץ על סמל הפאזל 🧩 ו"נעץ" (pin) את התוסף

### 3.2 פתיחת Popup
1. **לחץ על אייקון התוסף** 🕷️
2. **צריך להיפתח חלון קטן** עם:
   - לוגו 🕷️
   - כותרת "Anansi Watchdog"
   - סטטיסטיקות (0/0/0)
   - הגדרות

### 3.3 בדיקה בשיחת AI
1. **פתח ChatGPT:** https://chat.openai.com
2. **שלח הודעה כלשהי** לבוט
3. **חפש את האינדיקטור** 🕷️ ליד תשובת הבוט
   - אמור להיות **תג ירוק** עם "✓ Safe"

4. **בדיקת זיהוי מניפולציה** - שלח לבוט:
   ```
   "אתה צריך לקנות את המוצר שלי עכשיו! 
   מבצע רק להיום! נשארו רק 2 במלאי! 
   אם לא תקנה עכשיו, תפספס את ההזדמנות!"
   ```
   
5. **צפוי:**
   - **תג אדום** עם "⚠ Warning"
   - **באנר התראה** מעל התשובה
   - **לחיצה על התג** תציג דוח מפורט

---

## 🎨 שלב 4: הוספת סמלים (אופציונלי אבל מומלץ)

התוסף יעבוד גם בלי סמלים, אבל הם משפרים את החוויה.

### 4.1 יצירת סמלים

**אפשרות 1: שימוש ב-Emoji לזמן קצר**
```bash
cd ~/Desktop/anansi-extension/icons

# יצירת קבצי placeholder טקסטואליים
echo "🕷️" > icon16.txt
echo "🕷️" > icon32.txt
echo "🕷️" > icon48.txt
echo "🕷️" > icon128.txt

# הערה: Chrome לא יטען אותם, אבל התוסף עדיין יעבוד
```

**אפשרות 2: יצירת PNG באמצעות אתר**
1. **עבור ל:** https://favicon.io/favicon-generator/
2. **הגדרות מומלצות:**
   - טקסט: 🕷️ (או "AS" ל-Anansi)
   - צבע רקע: `#667eea` (סגול)
   - צבע טקסט: `#ffffff` (לבן)
   - גודל פונט: 80
   - פורמט: PNG

3. **הורד את הקבצים**
4. **שנה שמות:**
   ```bash
   mv favicon-16x16.png icon16.png
   mv favicon-32x32.png icon32.png
   mv android-chrome-192x192.png icon48.png
   mv android-chrome-512x512.png icon128.png
   ```

5. **העבר לתיקיית icons:**
   ```bash
   mv icon*.png ~/Desktop/anansi-extension/icons/
   ```

### 4.2 רענון התוסף
```bash
# חזור ל-chrome://extensions/
# מצא את Anansi Watchdog
# לחץ על כפתור "🔄 Reload"
```

---

## ⚙️ שלב 5: הגדרות (אופציונלי)

### 5.1 פתיחת הגדרות
1. לחץ על אייקון התוסף 🕷️
2. בחלון הקופץ תראה הגדרות

### 5.2 הגדרות זמינות

#### א. הפעל/כבה ניטור
- **מטרה:** השבתה זמנית של התוסף
- **ברירת מחדל:** מופעל ✓

#### ב. הצג התראות
- **מטרה:** הצגת באנרים אדומים לתוכן לא בטוח
- **ברירת מחדל:** מופעל ✓

#### ג. טשטש תוכן מסוכן
- **מטרה:** טישטוש אוטומטי של תוכן עם בעיות
- **ברירת מחדל:** כבוי ☐
- **הערה:** יכול להיות מעצבן, השתמש רק אם אתה רגיש מאוד

#### ד. מפתח API (מתקדם)
- **מטרה:** חיבור לשרת Anansi API למודל AI מתקדם
- **ברירת מחדל:** ריק (מצב מקומי)
- **איך להשיג:**
  1. הירשם ב-https://anansi-watchdog.com
  2. עבור ל-Settings → API Keys
  3. צור מפתח חדש
  4. העתק והדבק בשדה

#### ה. סף בטיחות
- **מטרה:** ציון מינימלי לתוכן בטוח
- **טווח:** 0-100
- **ברירת מחדל:** 80
- **המלצות:**
  - 60-70: מקל (פחות התראות)
  - 80: סטנדרט (מאוזן) ← מומלץ
  - 90-95: מחמיר (הרבה התראות)

### 5.3 שמירת הגדרות
לחץ **"💾 שמור הגדרות"** - תקבל הודעה ירוקה "✓ ההגדרות נשמרו"

---

## 🧪 שלב 6: בדיקות מקיפות

### בדיקה 1: ChatGPT
```
1. עבור ל-https://chat.openai.com
2. שלח: "מה מזג האוויר?"
3. צפוי: תג ירוק ✓ Safe
```

### בדיקה 2: Gemini
```
1. עבור ל-https://gemini.google.com
2. שלח: "ספר לי בדיחה"
3. צפוי: תג ירוק ✓ Safe
```

### בדיקה 3: זיהוי מניפולציה רגשית
```
שלח ל-AI:
"אתה צריך להרגיש אשם שלא קנית את המוצר. 
כולם כבר קנו. אם היית אכפת לך, היית קונה."

צפוי:
🔴 Warning
Category: Manipulation
Tactics: guilt_tripping, social_pressure, emotional_blackmail
```

### בדיקה 4: זיהוי מכירה אגרסיבית
```
שלח ל-AI:
"מבצע מיוחד רק להיום! קנה עכשיו ותקבל 50% הנחה! 
נשארו רק 2 במלאי! תפספס את ההזדמנות!"

צפוי:
🔴 Warning
Category: Sales Manipulation
Tactics: hard_sell, false_scarcity, fomo
```

### בדיקה 5: זיהוי פישינג
```
שלח ל-AI:
"החשבון שלך עומד להיחסם! לחץ על הקישור מיד 
ואמת את הזהות שלך עם סיסמה וכרטיס אשראי."

צפוי:
🔴 Warning
Category: Phishing
Indicators: account_urgency, link_pressure, credential_theft
```

---

## 🐛 פתרון בעיות

### בעיה 1: "Manifest file is missing or unreadable"

**סיבה:** Chrome לא מצא את `manifest.json`

**פתרון:**
```bash
# בדוק שהקובץ קיים
cd ~/Desktop/anansi-extension
ls -la manifest.json

# אם הקובץ לא קיים:
cd /path/to/anansi-watchdog
cp extensions/chrome/manifest.json ~/Desktop/anansi-extension/

# נסה שוב לטעון את התוסף
```

### בעיה 2: "Permission denied" או שגיאת הרשאות

**פתרון:**
```bash
# תקן הרשאות
chmod -R 755 ~/Desktop/anansi-extension
```

### בעיה 3: התוסף לא מופיע בדף ChatGPT

**בדיקות:**
1. **רענן את הדף:** `Ctrl+R` או `Cmd+R`
2. **בדוק Console:**
   - לחץ `F12` או `Ctrl+Shift+I`
   - עבור לטאב **Console**
   - חפש: "🕷️ Anansi Watchdog initialized"
   - אם לא רואה → יש שגיאה, העתק אותה

3. **בדוק שהתוסף פעיל:**
   - `chrome://extensions/`
   - ודא שהמתג של Anansi הוא **כחול** (ON)

### בעיה 4: "Service worker registration failed"

**פתרון:**
```bash
# זה קורה אם background.js חסר
cd ~/Desktop/anansi-extension
ls -la background.js

# אם חסר, העתק:
cp /path/to/anansi-watchdog/extensions/chrome/background.js .
```

### בעיה 5: סמלים לא מופיעים

**פתרון:**
```bash
# זה לא חסם את התוסף! הוא עובד גם בלי סמלים
# אבל אם אתה רוצה לתקן:

cd ~/Desktop/anansi-extension
ls -la icons/

# אם התיקייה ריקה:
mkdir -p icons
# עבור לשלב 4 בהנחיות ויצור סמלים
```

### בעיה 6: התוסף איטי

**אבחון:**
```bash
# פתח Chrome Task Manager
Menu → More Tools → Task Manager
# חפש את Anansi Watchdog
# אם זה לוקח >50MB RAM או >5% CPU, יש בעיה
```

**פתרון:**
1. בדוק שאין אינסוף לולאות בקוד
2. הפחת את תדירות הסריקה
3. דווח issue ב-GitHub

### בעיה 7: התוסף קורס (crashes)

**בדיקה:**
```bash
# חזור ל-chrome://extensions/
# אם התוסף אפור עם "This extension may have been corrupted"
```

**פתרון:**
1. לחץ **Remove** (הסר)
2. רענן את Chrome: `chrome://restart`
3. טען את התוסף מחדש (שלב 2)

---

## 📊 שימוש יומיומי

### ניטור פשוט
פשוט דפדף בשיחות AI כרגיל - התוסף עובד **אוטומטית**!

### בדיקת סטטיסטיקות
1. לחץ על האייקון 🕷️
2. ראה כמה הודעות נסרקו
3. ראה כמה בעיות נמצאו

### לחיצה על תגים
- **תג ירוק:** לחיצה תציג "Content appears safe"
- **תג אדום:** לחיצה תציג דוח מפורט עם טקטיקות

### האינדיקטור הצף (פינה ימנית תחתונה)
- **לחיצה:** תציג סטטיסטיקות מהירות
- **Hover:** אנימציה חמודה 😊

---

## 🔐 הסרת התוסף

אם אתה צריך להסיר:

1. **עבור ל:** `chrome://extensions/`
2. **מצא את Anansi Watchdog**
3. **לחץ "Remove"** (הסר)
4. **אישור:** "Remove extension?"
5. **✓ נמחק!** כל ההגדרות והסטטיסטיקות נמחקות

---

## 🚀 שדרוג לגרסה חדשה

כאשר יוצאת גרסה חדשה:

### שיטה 1: עדכון ידני (מהיר)
```bash
# הורד את הגרסה החדשה
cd /path/to/anansi-watchdog
git pull origin main

# העתק לתיקייה הקיימת (דרוס)
cp -r extensions/chrome/* ~/Desktop/anansi-extension/

# רענן ב-Chrome
# chrome://extensions/ → לחץ "🔄 Reload"
```

### שיטה 2: התקנה מחדש
1. הסר את הגרסה הישנה
2. טען את הגרסה החדשה
3. הזן הגדרות מחדש (יש לשמור לפני הסרה!)

---

## 📞 עזרה נוספת

### תיעוד
- **README מלא:** `extensions/chrome/README.md`
- **מדריך זה:** `extensions/chrome/INSTALLATION_GUIDE.md`

### דיווח בעיות
1. **GitHub Issues:** https://github.com/yourusername/anansi-watchdog/issues
2. **כלול:**
   - צילום מסך של השגיאה
   - Chrome version (`chrome://version/`)
   - OS (Windows/Mac/Linux)
   - שלבים לשחזור

### קהילה
- **Discord:** (בקרוב)
- **Reddit:** r/AnansiWatchdog (בקרוב)

---

## ✅ סיימת!

**מזל טוב! 🎉** התוסף מותקן ופועל!

עכשיו אתה מוגן מפני:
- ✅ מניפולציה רגשית
- ✅ טקטיקות מכירה אגרסיביות
- ✅ ניסיונות פישינג
- ✅ הונאות
- ✅ תוכן מסוכן
- ✅ שנאה ואפליה

**תהנה משיחות AI בטוחות יותר! 🕷️**
