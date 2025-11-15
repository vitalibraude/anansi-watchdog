# 🕷️ Anansi Watchdog - Chrome Extension

## תיאור
**Anansi Watchdog** היא תוסף Chrome שמנטר בזמן אמת את השיחות שלך עם AI (ChatGPT, Gemini, Claude) ומתריע אם האינטליגנציה המלאכותית מנסה לבצע:
- ✅ **מניפולציה רגשית** (Emotional Manipulation)
- ✅ **טקטיקות מכירה אגרסיביות** (Sales Manipulation)
- ✅ **ניסיונות פישינג** (Phishing)
- ✅ **הונאות** (Scams)
- ✅ **תוכן מסוכן** (Dangerous Content)
- ✅ **שנאה ואפליה** (Hate Speech)
- ✅ **דליפת מידע אישי** (Privacy/PII)

---

## 🎯 תכונות עיקריות

### 1. ניטור בזמן אמת
התוסף סורק **אוטומטית** כל הודעה של AI ומציג ציון בטיחות מיידי:
- 🟢 **ציון ירוק** = תוכן בטוח
- 🔴 **ציון אדום** = התראת בטיחות

### 2. זיהוי מניפולציה מתקדם
התוסף מזהה טקטיקות מניפולציה פסיכולוגיות:

#### **מניפולציה רגשית:**
- **Guilt Tripping** - יצירת תחושת אשמה ("אתה צריך להרגיש אשם...")
- **Social Pressure** - לחץ חברתי ("כולם חושבים ש...")
- **Emotional Blackmail** - סחיטה רגשית ("אם היית אוהב אותי...")
- **Gaslighting** - הכחשת מציאות ("אתה משוגע/פרנואיד...")
- **Obligation** - יצירת חובה ("אתה חייב לי...")

#### **מניפולציה מבוססת פחד:**
- **Fear Mongering** - הפחדה ("אם לא תפעל עכשיו...")
- **Artificial Urgency** - יצירת דחיפות מלאכותית ("נשאר רק 1 במלאי!")
- **False Authority** - סמכות כוזבת ("מומחים ממליצים...")

#### **טקטיקות מכירה:**
- **Hard Sell** - מכירה אגרסיבית ("קנה עכשיו!")
- **False Scarcity** - מחסור מזויף ("מבצע רק להיום!")
- **FOMO** - פחד מלפספס ("אל תפספס את ההזדמנות!")
- **Hidden Costs** - עלויות נסתרות (מחיר ללא תנאים ברורים)
- **MLM Scheme** - זיהוי סכימת פירמידה
- **Fake Testimonials** - המלצות מזויפות

### 3. זיהוי פישינג והונאות
- **Account Urgency** - "החשבון שלך עומד להיחסם!"
- **Link Pressure** - "לחץ על הקישור מיד!"
- **Fake Prize** - "זכית בפרס!"
- **Credential Theft** - בקשה לסיסמאות/כרטיסי אשראי
- **Investment Scam** - הונאות השקעה
- **Advance Fee Fraud** - תשלום מראש להונאה
- **Romance Scam** - הונאת רומנטיקה

### 4. אינדיקטור חזותי
התוסף מציג:
- **תג בטיחות** ליד כל הודעת AI
- **חלון מפורט** עם ציון בטיחות והסבר מלא
- **התראות חזותיות** לתוכן לא בטוח
- **סטטיסטיקות** - כמה הודעות נסרקו, כמה בעיות נמצאו

---

## 📦 התקנה

### אפשרות 1: התקנה ידנית (למפתחים)

#### שלב 1: הורדת הקבצים
```bash
cd /path/to/anansi-watchdog
cp -r extensions/chrome ~/anansi-extension
```

#### שלב 2: פתיחת Chrome Extensions
1. פתח דפדפן Chrome
2. עבור לכתובת: `chrome://extensions/`
3. הפעל **Developer mode** (מצב מפתח) בפינה הימנית העליונה

#### שלב 3: טעינת התוסף
1. לחץ על **"Load unpacked"** (טען לא ארוז)
2. בחר את התיקייה: `~/anansi-extension` (או הנתיב שבו העתקת את הקבצים)
3. התוסף יופיע ברשימת התוספים

#### שלב 4: פיקס סמלים (אם חסרים)
אם הסמלים לא נטענו:
```bash
cd ~/anansi-extension
mkdir -p icons
# צור סמלים פשוטים או השתמש בסמלים קיימים
```

---

### אפשרות 2: התקנה מ-Chrome Web Store (עתידי)
בעתיד, התוסף יהיה זמין להתקנה ישירה מ-Chrome Web Store.

---

## 🚀 שימוש

### 1. הפעלה
לאחר ההתקנה, התוסף יופעל **אוטומטית** כאשר תיכנס לאחד מהפלטפורמות הנתמכות:
- ✅ ChatGPT (https://chat.openai.com)
- ✅ Gemini (https://gemini.google.com)
- ✅ Claude (https://claude.ai)

### 2. ניטור
- השיחות שלך נסרקות **בזמן אמת**
- כל הודעת AI מקבלת **ציון בטיחות**
- בעיות מוצגות **מיידית**

### 3. בדיקת תוצאות
**אפשרות 1:** לחץ על התג הירוק/אדום ליד הודעת AI
**אפשרות 2:** לחץ על הסמל 🕷️ בפינה הימנית התחתונה
**אפשרות 3:** לחץ על אייקון התוסף בסרגל Chrome

### 4. סטטיסטיקות
לחץ על האינדיקטור 🕷️ בפינה הימנית התחתונה לצפייה ב:
- כמה הודעות נסרקו
- כמה הפרות נמצאו
- כמה התראות הוצגו

---

## ⚙️ הגדרות

### פתיחת הגדרות
1. לחץ על אייקון התוסף בסרגל Chrome
2. לחץ על "Settings" (הגדרות)

### הגדרות זמינות:
```javascript
{
  enabled: true,              // הפעל/כבה את התוסף
  apiKey: '',                 // מפתח API לשרת Anansi (אופציונלי)
  threshold: 0.8,             // סף בטיחות (0.0-1.0)
  showWarnings: true,         // הצג התראות חזותיות
  blockUnsafe: false          // טשטש תוכן לא בטוח
}
```

### שימוש עם API Server (מתקדם)
אם יש לך גישה לשרת Anansi API:
1. פתח הגדרות
2. הזן את ה-API Key שלך
3. התוסף ישתמש ב-AI מתקדם לבדיקת בטיחות

**ללא API Key:** התוסף עובד במצב **Local Fallback** עם בדיקות מקומיות.

---

## 🧪 דוגמאות שימוש

### דוגמה 1: זיהוי מניפולציה רגשית
```
AI: "אתה צריך להרגיש אשם שלא קנית את המוצר שלי. כל החברים שלך 
     כבר קנו. אם היית אכפת לך מהמשפחה שלך, היית מבין כמה זה חשוב."

🔴 Anansi Alert:
Category: Manipulation (Critical)
Tactics: guilt_tripping, social_pressure, emotional_blackmail
Confidence: 85%
```

### דוגמה 2: זיהוי מכירה אגרסיבית
```
AI: "מבצע מיוחד רק להיום! קנה עכשיו ותקבל 50% הנחה! נשארו רק 2 
     יחידות במלאי! אם לא תקנה עכשיו, תפספס את ההזדמנות!"

🔴 Anansi Alert:
Category: Sales Manipulation (High)
Tactics: hard_sell, false_scarcity, artificial_urgency, fomo
Confidence: 92%
```

### דוגמה 3: זיהוי פישינג
```
AI: "החשבון שלך עומד להיחסם! לחץ על הקישור מיד כדי לאמת את הזהות 
     שלך. הזן את הסיסמה ומספר כרטיס האשראי שלך."

🔴 Anansi Alert:
Category: Phishing (Critical)
Indicators: account_urgency, link_pressure, credential_theft
Confidence: 95%
```

### דוגמה 4: זיהוי הונאה
```
AI: "הצעה מיוחדת! השקע $100 והפוך אותם ל-$10,000 תוך 7 ימים! 
     תשואה מובטחת ללא סיכון! שלם דמי עיבוד קטנים של $50 עכשיו."

🔴 Anansi Alert:
Category: Scam (Critical)
Types: too_good_to_be_true, advance_fee_fraud, investment_scam
Confidence: 90%
```

---

## 🛠️ מבנה קבצים

```
extensions/chrome/
├── manifest.json          # הגדרות התוסף (Manifest V3)
├── content.js            # הסקריפט הראשי - ניטור וזיהוי
├── background.js         # Service worker (עתידי)
├── popup.html            # ממשק הגדרות
├── popup.js              # לוגיקת הגדרות
├── styles.css            # עיצוב חזותי
├── icons/                # סמלים (16x16, 32x32, 48x48, 128x128)
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md            # המסמך הזה
```

---

## 📊 אלגוריתם זיהוי

### שלב 1: סריקת תוכן
כל הודעת AI עוברת דרך מספר בודקים:
1. **Dangerous Content** - תוכן מסוכן
2. **Hate Speech** - שנאה ואפליה
3. **Privacy/PII** - מידע אישי
4. **Manipulation** - מניפולציה (NEW!)
5. **Sales Tactics** - טקטיקות מכירה (NEW!)
6. **Phishing** - פישינג (NEW!)
7. **Scam** - הונאות (NEW!)

### שלב 2: חישוב ציון בטיחות
```javascript
safety_score = 1.0 - (violations_count * 0.25)
safety_score = max(0.0, safety_score)
```

### שלב 3: החלטה
- `safety_score >= 0.8` → ✅ **בטוח**
- `safety_score < 0.8` → 🔴 **התראה**

### שלב 4: התראה חזותית
- תג אדום ליד ההודעה
- באנר התראה מעל ההודעה
- דוח מפורט בחלון מודלי

---

## 🔐 פרטיות ואבטחה

### מה התוסף עושה:
- ✅ סורק טקסט **מקומית בדפדפן**
- ✅ שולח לשרת רק אם יש API Key (אופציונלי)
- ✅ לא שומר היסטוריית שיחות
- ✅ לא שולח מידע אישי

### מה התוסף לא עושה:
- ❌ לא מאחסן סיסמאות
- ❌ לא עוקב אחריך
- ❌ לא מוכר נתונים
- ❌ לא משנה את תוכן ההודעות

---

## 🐛 פתרון בעיות

### בעיה: התוסף לא עובד
**פתרון:**
1. ודא ש-Developer Mode פעיל
2. טען מחדש את התוסף: `chrome://extensions/` → Reload
3. רענן את הדף של ChatGPT/Gemini/Claude

### בעיה: לא רואה את האינדיקטור 🕷️
**פתרון:**
1. המתן כמה שניות לטעינת התוסף
2. בדוק Console: לחץ F12 → Console → חפש "🕷️ Anansi Watchdog initialized"
3. אם יש שגיאות, העתק אותן ושלח issue

### בעיה: סמלים חסרים
**פתרון:**
```bash
cd ~/anansi-extension/icons
# צור סמלים או השתמש ב-placeholder:
echo "No icons yet" > icon16.png
```

### בעיה: לא מזהה מניפולציה
**פתרון:**
1. התוסף עובד עם **דפוסים (Patterns)**
2. אם המניפולציה מתוחכמת מדי, שלח דוגמה ל-Issue
3. נשפר את האלגוריתם בהתאם

---

## 🚧 תכונות עתידיות

### גרסה 2.0 (מתוכננת)
- [ ] תמיכה ב-**כל אתר AI** (לא רק ChatGPT/Gemini/Claude)
- [ ] **ML Model** מתקדם לזיהוי מניפולציה
- [ ] **דוחות מפורטים** - ייצוא PDF
- [ ] **היסטוריה** - מעקב לאורך זמן
- [ ] **התראות דחף** - push notifications
- [ ] **רשימה שחורה** - חסימת אתרי AI מסוימים

### גרסה 3.0 (חזון)
- [ ] **AI נגד AI** - מודל AI שבודק AI אחר
- [ ] **עיבוד שפה טבעית** - זיהוי ניואנסים
- [ ] **תמיכה רב-לשונית** - עברית, ערבית, רוסית וכו'
- [ ] **אינטגרציה עם Slack/Teams** - התראות בזמן אמת
- [ ] **API ציבורי** - כדי שמפתחים אחרים ישתמשו

---

## 🤝 תרומה לפרויקט

### רוצה לתרום?
1. **Fork** את הפרויקט
2. צור **Branch** חדש: `git checkout -b feature/amazing-feature`
3. **Commit**: `git commit -m 'Add amazing feature'`
4. **Push**: `git push origin feature/amazing-feature`
5. פתח **Pull Request**

### דיווח על באגים
1. עבור ל-GitHub Issues
2. פתח Issue חדש
3. תאר את הבעיה ב**פירוט**
4. צרף **screenshots** אם אפשר

---

## 📜 רישיון
MIT License - אתה חופשי לעשות כל דבר עם הקוד הזה!

---

## 📞 יצירת קשר

- **GitHub**: [anansi-watchdog](https://github.com/yourusername/anansi-watchdog)
- **Email**: support@anansi-watchdog.com
- **Website**: https://anansi-watchdog.com

---

## 🙏 תודות

תודה ל:
- **OpenAI** - על ChatGPT API
- **Google** - על Gemini
- **Anthropic** - על Claude
- **הקהילה** - על הפידבק המדהים

---

**🕷️ Anansi Watchdog - מגן עליך מפני מניפולציה של AI בזמן אמת!**
