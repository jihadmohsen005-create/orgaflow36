@echo off
chcp 65001 >nul
echo ========================================
echo   OrgaFlow36 - GitHub Setup for Netlify
echo ========================================
echo.

echo الخطوة 1: تهيئة Git...
git init
if errorlevel 1 (
    echo ❌ فشل تهيئة Git
    pause
    exit /b 1
)
echo ✅ تم تهيئة Git بنجاح
echo.

echo الخطوة 2: إضافة جميع الملفات...
git add .
if errorlevel 1 (
    echo ❌ فشل إضافة الملفات
    pause
    exit /b 1
)
echo ✅ تم إضافة الملفات بنجاح
echo.

echo الخطوة 3: إنشاء Commit...
git commit -m "Initial commit - OrgaFlow36 ready for Netlify deployment"
if errorlevel 1 (
    echo ❌ فشل إنشاء Commit
    echo.
    echo تأكد من إعداد Git config:
    echo git config --global user.name "Your Name"
    echo git config --global user.email "your.email@example.com"
    pause
    exit /b 1
)
echo ✅ تم إنشاء Commit بنجاح
echo.

echo ========================================
echo   ✅ Git جاهز!
echo ========================================
echo.
echo الخطوات التالية:
echo.
echo 1. أنشئ Repository على GitHub:
echo    https://github.com/new
echo.
echo 2. اسم Repository: orgaflow36
echo.
echo 3. اختر: Private
echo.
echo 4. اضغط "Create repository"
echo.
echo 5. بعد إنشاء Repository، نفّذ الأوامر التالية:
echo.
echo    git remote add origin https://github.com/YOUR_USERNAME/orgaflow36.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo    (استبدل YOUR_USERNAME باسم المستخدم الخاص بك)
echo.
echo 6. عند طلب Password، استخدم Personal Access Token من:
echo    https://github.com/settings/tokens
echo.
pause

