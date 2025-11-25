# ⚡ تشخيص سريع - مشكلة التحميل

## 🎯 **افعل هذا الآن (30 ثانية):**

### **الخطوة 1: افتح Console**

1. **افتح الموقع:**
   - إذا كان على Netlify: افتح رابط Netlify
   - إذا كان على Vercel: افتح https://orgaflow36.vercel.app

2. **اضغط F12** (أو Right Click → Inspect)

3. **اذهب إلى تبويب "Console"**

4. **انظر إلى الأخطاء باللون الأحمر**

---

## 🔴 **الأخطاء الشائعة:**

### **خطأ 1: "Uncaught ReferenceError: process is not defined"**
```
❌ السبب: متغيرات البيئة غير موجودة
✅ الحل: أضف متغيرات البيئة في Netlify/Vercel
```

### **خطأ 2: "Failed to fetch" أو "NetworkError"**
```
❌ السبب: مشكلة في الاتصال بـ Supabase
✅ الحل: تحقق من VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY
```

### **خطأ 3: "Cannot read property 'xxx' of undefined"**
```
❌ السبب: خطأ في الكود
✅ الحل: راجع Build log
```

### **خطأ 4: "Module not found"**
```
❌ السبب: مكتبة ناقصة
✅ الحل: npm install && git push
```

---

## 📋 **قائمة التحقق السريعة:**

### **على Netlify:**

1. **افتح:** https://app.netlify.com
2. **اذهب إلى:** Site settings → Environment variables
3. **تحقق من وجود:**
   ```
   VITE_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY
   GEMINI_API_KEY
   ```
4. **إذا ناقصة:** أضفها وأعد النشر

### **على Vercel:**

1. **افتح:** https://vercel.com/dashboard
2. **اختر المشروع:** orgaflow36
3. **اذهب إلى:** Settings → Environment Variables
4. **تحقق من وجود:**
   ```
   VITE_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY
   GEMINI_API_KEY
   ```
5. **إذا ناقصة:** أضفها وأعد النشر (Redeploy)

---

## 🚀 **الحل السريع (5 دقائق):**

### **إذا كنت على Netlify:**

```
1. Netlify Dashboard → Site settings → Environment variables
2. أضف المتغيرات الثلاثة (انظر أدناه)
3. Deploys → Trigger deploy → Clear cache and deploy site
4. انتظر 2-3 دقائق
5. افتح الموقع مرة أخرى
```

### **إذا كنت على Vercel:**

```
1. Vercel Dashboard → Settings → Environment Variables
2. أضف المتغيرات الثلاثة (انظر أدناه)
3. Deployments → اضغط على النقاط الثلاث → Redeploy
4. انتظر 2-3 دقائق
5. افتح الموقع مرة أخرى
```

---

## 🔑 **متغيرات البيئة المطلوبة:**

### **المتغير 1:**
```
Name: VITE_SUPABASE_URL
Value: https://dihtjatqgwyyuvilacdd.supabase.co
```

### **المتغير 2:**
```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpaHRqYXRxZ3d5eXV2aWxhY2RkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMTc0MDMsImV4cCI6MjA3OTU5MzQwM30.Ck7mKYM5g44SF4S3JkIjqpOWx6u582R9KCxqGLaIJ9A
```

### **المتغير 3:**
```
Name: GEMINI_API_KEY
Value: PLACEHOLDER_API_KEY
```

**⚠️ مهم:**
- انسخ والصق بالضبط (بدون مسافات إضافية)
- في Vercel: اختر "Production, Preview, Development" لكل متغير

---

## 📸 **أرسل لي Screenshot من:**

1. **Console** (F12 → Console) - أهم شيء!
2. **Environment Variables** في Netlify/Vercel
3. **Build Log** (آخر نشر)

---

## 🎯 **الخطوة التالية:**

**افتح الموقع الآن واضغط F12 وأخبرني:**
- ما هي رسالة الخطأ في Console؟
- هل الموقع على Netlify أم Vercel؟
- هل أضفت متغيرات البيئة؟

**سأحل المشكلة فوراً بمجرد معرفة الخطأ!** 💪

