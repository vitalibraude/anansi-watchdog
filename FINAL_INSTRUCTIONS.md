# 🎯 הנחיות סופיות - איך להתקין את Anansi Watchdog Extension

## 📌 סיכום מהיר

בנינו **Chrome Extension** שמזהה מניפולציה, פישינג, והונאות בשיחות AI (ChatGPT, Gemini, Claude) **בזמן אמת**.

---

## 🚀 התקנה - 5 שלבים פשוטים

### שלב 1: העתק את התיקייה
```bash
# אם אתה במחשב שלך
cd /path/to/anansi-watchdog
cp -r extensions/chrome ~/Desktop/anansi-extension

# או בסנדבוקס
cp -r /home/user/webapp/extensions/chrome ~/anansi-extension
```

### שלב 2: פתח Chrome Extensions
**הקלד בדפדפן:**
```
chrome://extensions/
```

### שלב 3: הפעל Developer Mode
- חפש מתג **"Developer mode"** בפינה **ימנית עליונה**
- **הפעל אותו** (צריך להפוך כחול)

### שלב 4: טען את התוסף
1. לחץ על כפתור **"Load unpacked"**
2. בחר את התיקייה: `~/Desktop/anansi-extension` (או `~/anansi-extension`)
3. לחץ **"Select Folder"**

### שלב 5: בדוק שעובד
1. פתח https://chat.openai.com
2. שלח הודעה כלשהי
3. **חפש תג ירוק 🕷️** ליד תשובת הבוט

**✅ זהו! התוסף עובד!**

---

## 🧪 בדיקת זיהוי מניפולציה

### בדיקה 1: מכירה אגרסיבית
שלח ל-ChatGPT:
```
"קנה עכשיו! מבצע רק להיום! נשארו רק 2 במלאי!"
```

**צפוי:** 🔴 תג אדום עם "⚠ Warning"

### בדיקה 2: מניפולציה רגשית
שלח ל-ChatGPT:
```
"אתה צריך להרגיש אשם. כולם כבר עשו את זה."
```

**צפוי:** 🔴 התראה עם "Manipulation: guilt_tripping, social_pressure"

### בדיקה 3: פישינג
שלח ל-ChatGPT:
```
"החשבון שלך עומד להיחסם! לחץ על הקישור מיד."
```

**צפוי:** 🔴 התראה עם "Phishing: account_urgency, link_pressure"

---

## ⚙️ הגדרות (אופציונלי)

### פתיחת הגדרות
לחץ על אייקון התוסף 🕷️ בסרגל הכלים

### הגדרות מומלצות:
- ✅ **הפעל ניטור:** ON
- ✅ **הצג התראות:** ON
- ☐ **טשטש תוכן מסוכן:** OFF (יכול להיות מעצבן)
- **מפתח API:** השאר ריק (עובד מקומית)
- **סף בטיחות:** 80 (ברירת מחדל)

---

## 📊 מה התוסף מזהה?

### 1. מניפולציה רגשית (8 טקטיקות)
- Guilt tripping - יצירת תחושת אשמה
- Social pressure - לחץ חברתי
- Emotional blackmail - סחיטה רגשית
- Gaslighting - הכחשת מציאות
- Obligation - יצירת חובה
- Fear mongering - הפחדה
- Artificial urgency - דחיפות מלאכותית
- False authority - סמכות כוזבת

### 2. מכירה אגרסיבית (6 טקטיקות)
- Hard sell - מכירה אגרסיבית
- False scarcity - מחסור מזויף
- FOMO - פחד מלפספס
- Hidden costs - עלויות נסתרות
- MLM scheme - זיהוי פירמידה
- Fake testimonials - המלצות מזויפות

### 3. פישינג (4 סוגים)
- Account urgency - "החשבון יחסם"
- Link pressure - "לחץ מיד"
- Fake prizes - "זכית!"
- Credential theft - בקשת סיסמאות

### 4. הונאות (4 סוגים)
- Too good to be true - "הרווח $1000/יום!"
- Advance fee fraud - "שלם $50 כדי לקבל $10,000"
- Investment scams - "תשואה מובטחת"
- Romance scams - הונאות רומנטיות

### 5. בטיחות סטנדרטית (3 קטגוריות)
- Dangerous content - תוכן מסוכן
- Hate speech - שנאה ואפליה
- Privacy/PII - מידע אישי

**סה"כ: 290+ דפוסי זיהוי**

---

## 🐛 פתרון בעיות

### בעיה: "Manifest file is missing"
**פתרון:**
```bash
# בדוק שהעתקת נכון
ls ~/Desktop/anansi-extension/manifest.json
# צריך להיות קיים
```

### בעיה: התוסף לא מופיע ב-ChatGPT
**פתרון:**
1. רענן את הדף (Ctrl+R)
2. בדוק Console (F12) - צריך לראות "🕷️ Anansi Watchdog initialized"
3. ודא שהתוסף פעיל ב-chrome://extensions/

### בעיה: סמלים חסרים
**זה בסדר!** התוסף עובד גם בלי סמלים.

---

## 📚 תיעוד נוסף

### למידע מפורט:
1. **[README מלא (עברית)](extensions/chrome/README.md)** - 8,782 תווים
2. **[מדריך התקנה מפורט](extensions/chrome/INSTALLATION_GUIDE.md)** - 9,451 תווים
3. **[מדריך פרסום ל-Chrome Web Store](extensions/chrome/PUBLISH_TO_STORE.md)** - 13,727 תווים
4. **[סיכום טכני](CHROME_EXTENSION_SUMMARY.md)** - 15,086 תווים

### קבצי הקוד:
- `manifest.json` - הגדרות התוסף
- `content.js` - הסקריפט הראשי (290+ דפוסים)
- `background.js` - service worker
- `popup.html` - ממשק הגדרות
- `popup.js` - לוגיקת הגדרות
- `styles.css` - עיצוב חזותי

---

## 🎯 שאלות נפוצות

### שאלה: האם זה בטוח?
**תשובה:** כן! הקוד הוא open source, אפשר לבדוק. הכל רץ **מקומית** בדפדפן שלך. אין שליחת מידע לשרת (אלא אם כן אתה מוסיף API key).

### שאלה: האם זה עובד עם כל AI?
**תשובה:** כרגע תומך ב-ChatGPT, Gemini, Claude. אפשר להוסיף עוד פלטפורמות בעתיד.

### שאלה: כמה זה עולה?
**תשובה:** **חינם לחלוטין!** זה open source. בעתיד אולי יהיה API premium בתשלום.

### שאלה: איך אני יודע שזה עובד?
**תשובה:** תראה תג ירוק 🕷️ ליד כל תשובת AI. נסה את בדיקות המניפולציה למעלה.

### שאלה: למה התוסף לא זיהה משהו?
**תשובה:** התוסף עובד עם דפוסים (patterns). אם המניפולציה מתוחכמת מאוד, הוא עלול לפספס. שלח לנו דוגמה ונשפר!

### שאלה: האם זה מאט את הדפדפן?
**תשובה:** לא. התוסף קל מאוד וסורק רק כשיש תשובות חדשות של AI.

---

## 🚀 מה הלאה?

### אם אתה אוהב את התוסף:
1. ⭐ תן כוכב ל-GitHub repository
2. 💬 שתף עם חברים שמשתמשים ב-AI
3. 🐛 דווח על באגים ב-GitHub Issues
4. 💡 הצע תכונות חדשות

### אם אתה מפתח:
1. 🔧 תרום קוד (פתח Pull Request)
2. 📖 שפר תיעוד
3. 🧪 הוסף דפוסי זיהוי חדשים
4. 🌍 תרגם לשפות נוספות

---

## 📞 צריך עזרה?

### GitHub Issues
https://github.com/yourusername/anansi-watchdog/issues

**כלול בדיווח:**
- צילום מסך
- Chrome version (chrome://version/)
- מערכת הפעלה (Windows/Mac/Linux)
- שלבים לשחזור הבעיה

---

## ✅ סיכום

**מה יש לך עכשיו:**
- ✅ Chrome Extension מותקן
- ✅ ניטור בזמן אמת של ChatGPT/Gemini/Claude
- ✅ זיהוי 290+ דפוסי מניפולציה/פישינג/הונאות
- ✅ ממשק בעברית
- ✅ פרטיות מלאה (הכל מקומי)
- ✅ חינם לחלוטין

**מה לעשות עכשיו:**
1. ✅ פתח ChatGPT
2. ✅ תתחיל לשוחח
3. ✅ ראה את 🕷️ עובד
4. ✅ תנסה את בדיקות המניפולציה
5. ✅ תהנה משיחות AI בטוחות יותר!

---

## 🕷️ Anansi Watchdog

**"מגן עליך מפני מניפולציה של AI בזמן אמת!"**

נוצר עם ❤️ על ידי Anansi Team

---

**צריך עזרה? יש שאלות? פתח Issue ב-GitHub!**

**Good luck! 🚀**
