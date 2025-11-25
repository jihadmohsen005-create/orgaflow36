@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: ========================================
:: OrgaFlow36 - Update and Run Script
:: ========================================
:: هذا الملف يقوم بـ:
:: 1. إضافة جميع التغييرات إلى Git
:: 2. إنشاء Commit
:: 3. رفع التحديثات إلى GitHub
:: 4. تشغيل المشروع محلياً
:: ========================================

title OrgaFlow36 - Update and Run

:: الألوان
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "RESET=[0m"

echo.
echo %BLUE%========================================%RESET%
echo %BLUE%   OrgaFlow36 - Update and Run Script  %RESET%
echo %BLUE%========================================%RESET%
echo.

:: التحقق من وجود Git
echo %YELLOW%[1/5] التحقق من Git...%RESET%
git --version >nul 2>&1
if errorlevel 1 (
    echo %RED%❌ خطأ: Git غير مثبت!%RESET%
    echo %RED%   الرجاء تثبيت Git من: https://git-scm.com%RESET%
    pause
    exit /b 1
)
echo %GREEN%✅ Git مثبت بنجاح%RESET%
echo.

:: التحقق من وجود تغييرات
echo %YELLOW%[2/5] التحقق من التغييرات...%RESET%
git status --short >nul 2>&1
if errorlevel 1 (
    echo %RED%❌ خطأ: هذا المجلد ليس Git repository%RESET%
    pause
    exit /b 1
)

:: عرض التغييرات
git status --short
echo.

:: سؤال المستخدم عن رسالة Commit
echo %YELLOW%[3/5] إنشاء Commit...%RESET%
echo.
echo هل تريد إدخال رسالة commit مخصصة؟
echo [1] نعم - سأكتب رسالة مخصصة
echo [2] لا - استخدم رسالة تلقائية (Update: التاريخ والوقت)
echo.
set /p "choice=اختر (1 أو 2): "

if "%choice%"=="1" (
    set /p "commit_msg=أدخل رسالة الـ commit: "
) else (
    :: رسالة تلقائية مع التاريخ والوقت
    for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
    set "date_formatted=!datetime:~0,4!-!datetime:~4,2!-!datetime:~6,2!"
    set "time_formatted=!datetime:~8,2!:!datetime:~10,2!:!datetime:~12,2!"
    set "commit_msg=Update: !date_formatted! !time_formatted!"
)

echo.
echo رسالة الـ Commit: %BLUE%!commit_msg!%RESET%
echo.

:: إضافة جميع التغييرات
echo %YELLOW%إضافة التغييرات...%RESET%
git add .
if errorlevel 1 (
    echo %RED%❌ فشل في إضافة التغييرات%RESET%
    pause
    exit /b 1
)
echo %GREEN%✅ تم إضافة جميع التغييرات%RESET%
echo.

:: إنشاء Commit
echo %YELLOW%إنشاء Commit...%RESET%
git commit -m "!commit_msg!"
if errorlevel 1 (
    echo %YELLOW%⚠️ لا توجد تغييرات جديدة للـ commit%RESET%
    echo.
    goto :skip_push
)
echo %GREEN%✅ تم إنشاء Commit بنجاح%RESET%
echo.

:: تأكيد Push
echo %YELLOW%[4/5] رفع التحديثات إلى GitHub...%RESET%
echo.
echo هل تريد رفع التحديثات إلى GitHub الآن؟
echo [Y] نعم - ارفع التحديثات
echo [N] لا - تخطى هذه الخطوة
echo.
set /p "push_choice=اختر (Y/N): "

if /i not "%push_choice%"=="Y" (
    echo %YELLOW%⏭️ تم تخطي عملية Push%RESET%
    echo.
    goto :skip_push
)

:: رفع التحديثات
echo %YELLOW%جاري رفع التحديثات...%RESET%
git push
if errorlevel 1 (
    echo %RED%❌ فشل في رفع التحديثات إلى GitHub%RESET%
    echo %RED%   تحقق من اتصال الإنترنت والصلاحيات%RESET%
    echo.
    echo هل تريد المتابعة وتشغيل المشروع محلياً؟
    set /p "continue=اختر (Y/N): "
    if /i not "!continue!"=="Y" (
        pause
        exit /b 1
    )
) else (
    echo %GREEN%✅ تم رفع التحديثات إلى GitHub بنجاح%RESET%
    echo %GREEN%   Repository: https://github.com/jihadmohsen005-create/orgaflow36%RESET%
    echo.
)

:skip_push

:: تشغيل المشروع محلياً
echo %YELLOW%[5/5] تشغيل المشروع محلياً...%RESET%
echo.
echo %BLUE%سيتم تشغيل خادم التطوير على:%RESET%
echo %BLUE%http://localhost:5173%RESET%
echo.
echo %YELLOW%⚠️ لإيقاف الخادم، اضغط Ctrl+C%RESET%
echo.
timeout /t 3 /nobreak >nul

:: التحقق من وجود node_modules
if not exist "node_modules" (
    echo %YELLOW%⚠️ لم يتم العثور على node_modules%RESET%
    echo %YELLOW%   جاري تثبيت المكتبات...%RESET%
    echo.
    npm install
    if errorlevel 1 (
        echo %RED%❌ فشل في تثبيت المكتبات%RESET%
        pause
        exit /b 1
    )
    echo %GREEN%✅ تم تثبيت المكتبات بنجاح%RESET%
    echo.
)

:: تشغيل خادم التطوير
echo %GREEN%🚀 جاري تشغيل المشروع...%RESET%
echo.
npm run dev

:: إذا توقف الخادم
echo.
echo %YELLOW%تم إيقاف الخادم%RESET%
pause

