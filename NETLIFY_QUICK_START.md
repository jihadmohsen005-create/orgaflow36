# ⚡ نشر سريع على Netlify - OrgaFlow36

## 🚀 في 5 خطوات فقط!

---

## 📌 الخطوة 1: رفع إلى GitHub (3 دقائق)

### في Command Prompt:

```cmd
cd C:\Users\pc\Downloads\orgaflow36
```

```bash
git init
git add .
git commit -m "Initial commit for Netlify"
```

### أنشئ Repository:
1. افتح: https://github.com/new
2. اسم: `orgaflow36`
3. اختر: **Private**
4. اضغط **"Create repository"**

### اربط وارفع:

```bash
# استبدل YOUR_USERNAME باسمك
git remote add origin https://github.com/YOUR_USERNAME/orgaflow36.git
git branch -M main
git push -u origin main
```

**ملاحظة:** استخدم **Personal Access Token** كـ Password
- أنشئه من: https://github.com/settings/tokens

---

## 🌐 الخطوة 2: سجّل في Netlify (دقيقة)

1. افتح: https://app.netlify.com/signup
2. اضغط **"GitHub"**
3. سجّل دخول وامنح الصلاحيات

---

## 📦 الخطوة 3: استورد المشروع (دقيقة)

1. اضغط **"Add new site"** → **"Import an existing project"**
2. اختر **"Deploy with GitHub"**
3. اختر `orgaflow36`

---

## ⚙️ الخطوة 4: أضف متغيرات البيئة (دقيقتان)

في صفحة التكوين، اضغط **"Show advanced"** → **"New variable"**

أضف:

```
VITE_SUPABASE_URL
https://dihtjatqgwyyuvilacdd.supabase.co

VITE_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpaHRqYXRxZ3d5eXV2aWxhY2RkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMTc0MDMsImV4cCI6MjA3OTU5MzQwM30.Ck7mKYM5g44SF4S3JkIjqpOWx6u582R9KCxqGLaIJ9A

GEMINI_API_KEY
PLACEHOLDER_API_KEY
```

---

## 🚀 الخطوة 5: انشر! (3 دقائق)

1. اضغط **"Deploy orgaflow36"**
2. انتظر 2-3 دقائق
3. افتح الرابط: `https://xxxxx.netlify.app`

---

## ✅ اختبر التطبيق

```
Username: director
Password: 123
```

---

## 🎯 تم! 🎉

**رابطك:**
```
https://your-site-name.netlify.app
```

**للتحديثات:**
```bash
git add .
git commit -m "تحديث"
git push
```

---

## 📚 للمزيد:
- `NETLIFY_DEPLOY_GUIDE.md` - دليل مفصل
- `netlify.toml` - ملف التكوين

**بالتوفيق! 🚀**

