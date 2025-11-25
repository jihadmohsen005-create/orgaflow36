@echo off
chcp 65001 >nul

:: ========================================
:: OrgaFlow36 - Quick Deploy
:: ========================================
:: نشر سريع بنقرة واحدة!
:: ========================================

title OrgaFlow36 - Quick Deploy

echo.
echo ════════════════════════════════════════
echo    OrgaFlow36 - Quick Deploy
echo ════════════════════════════════════════
echo.

:: إضافة التغييرات
echo [1/3] إضافة التغييرات...
git add .

:: إنشاء Commit برسالة تلقائية
echo [2/3] إنشاء Commit...
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set "msg=Update: %datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2% %datetime:~8,2%:%datetime:~10,2%"
git commit -m "%msg%"

:: رفع التحديثات
echo [3/3] رفع التحديثات إلى GitHub...
git push

if errorlevel 1 (
    echo.
    echo ❌ فشل في رفع التحديثات
    pause
    exit /b 1
)

echo.
echo ✅ تم رفع التحديثات بنجاح!
echo.
echo هل تريد تشغيل المشروع محلياً؟
set /p "run=اختر (Y/N): "

if /i "%run%"=="Y" (
    echo.
    echo 🚀 تشغيل المشروع...
    npm run dev
) else (
    echo.
    echo تم الانتهاء!
    timeout /t 3 /nobreak >nul
)

