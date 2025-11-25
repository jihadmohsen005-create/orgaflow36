@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: ========================================
:: OrgaFlow36 - Advanced Deployment Script
:: ========================================
:: نسخة متقدمة مع خيارات إضافية
:: ========================================

title OrgaFlow36 - Advanced Deployment

:: الألوان
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "CYAN=[96m"
set "MAGENTA=[95m"
set "RESET=[0m"

:menu
cls
echo.
echo %CYAN%╔════════════════════════════════════════════════╗%RESET%
echo %CYAN%║                                                ║%RESET%
echo %CYAN%║        OrgaFlow36 - Advanced Deployment        ║%RESET%
echo %CYAN%║                                                ║%RESET%
echo %CYAN%╚════════════════════════════════════════════════╝%RESET%
echo.
echo %BLUE%اختر العملية المطلوبة:%RESET%
echo.
echo %YELLOW%[1]%RESET% تحديث ورفع ثم تشغيل محلياً (الكل)
echo %YELLOW%[2]%RESET% تحديث ورفع فقط (بدون تشغيل)
echo %YELLOW%[3]%RESET% تشغيل محلياً فقط (بدون تحديث)
echo %YELLOW%[4]%RESET% بناء المشروع للإنتاج (Build)
echo %YELLOW%[5]%RESET% عرض حالة Git
echo %YELLOW%[6]%RESET% سحب آخر التحديثات من GitHub (Pull)
echo %YELLOW%[0]%RESET% خروج
echo.
set /p "menu_choice=اختر رقم العملية: "

if "%menu_choice%"=="1" goto :full_deploy
if "%menu_choice%"=="2" goto :update_only
if "%menu_choice%"=="3" goto :run_only
if "%menu_choice%"=="4" goto :build_only
if "%menu_choice%"=="5" goto :git_status
if "%menu_choice%"=="6" goto :git_pull
if "%menu_choice%"=="0" goto :exit
echo %RED%❌ اختيار غير صحيح%RESET%
timeout /t 2 /nobreak >nul
goto :menu

:: ========================================
:: العملية الكاملة
:: ========================================
:full_deploy
cls
echo %MAGENTA%════════════════════════════════════════%RESET%
echo %MAGENTA%   العملية الكاملة: تحديث + رفع + تشغيل%RESET%
echo %MAGENTA%════════════════════════════════════════%RESET%
echo.
call :check_git
call :show_changes
call :create_commit
call :push_changes
call :run_dev
goto :menu

:: ========================================
:: تحديث ورفع فقط
:: ========================================
:update_only
cls
echo %MAGENTA%════════════════════════════════════════%RESET%
echo %MAGENTA%   تحديث ورفع فقط%RESET%
echo %MAGENTA%════════════════════════════════════════%RESET%
echo.
call :check_git
call :show_changes
call :create_commit
call :push_changes
echo.
echo %GREEN%✅ تم الانتهاء من التحديث والرفع%RESET%
pause
goto :menu

:: ========================================
:: تشغيل محلياً فقط
:: ========================================
:run_only
cls
echo %MAGENTA%════════════════════════════════════════%RESET%
echo %MAGENTA%   تشغيل المشروع محلياً%RESET%
echo %MAGENTA%════════════════════════════════════════%RESET%
echo.
call :run_dev
goto :menu

:: ========================================
:: بناء المشروع
:: ========================================
:build_only
cls
echo %MAGENTA%════════════════════════════════════════%RESET%
echo %MAGENTA%   بناء المشروع للإنتاج%RESET%
echo %MAGENTA%════════════════════════════════════════%RESET%
echo.
echo %YELLOW%جاري بناء المشروع...%RESET%
npm run build
if errorlevel 1 (
    echo %RED%❌ فشل في بناء المشروع%RESET%
) else (
    echo %GREEN%✅ تم بناء المشروع بنجاح%RESET%
    echo %GREEN%   الملفات موجودة في مجلد: dist/%RESET%
)
echo.
pause
goto :menu

:: ========================================
:: عرض حالة Git
:: ========================================
:git_status
cls
echo %MAGENTA%════════════════════════════════════════%RESET%
echo %MAGENTA%   حالة Git%RESET%
echo %MAGENTA%════════════════════════════════════════%RESET%
echo.
git status
echo.
pause
goto :menu

:: ========================================
:: سحب التحديثات
:: ========================================
:git_pull
cls
echo %MAGENTA%════════════════════════════════════════%RESET%
echo %MAGENTA%   سحب آخر التحديثات من GitHub%RESET%
echo %MAGENTA%════════════════════════════════════════%RESET%
echo.
echo %YELLOW%جاري سحب التحديثات...%RESET%
git pull
if errorlevel 1 (
    echo %RED%❌ فشل في سحب التحديثات%RESET%
) else (
    echo %GREEN%✅ تم سحب التحديثات بنجاح%RESET%
)
echo.
pause
goto :menu

:: ========================================
:: الدوال المساعدة
:: ========================================

:check_git
echo %YELLOW%[التحقق من Git]%RESET%
git --version >nul 2>&1
if errorlevel 1 (
    echo %RED%❌ Git غير مثبت%RESET%
    pause
    exit /b 1
)
echo %GREEN%✅ Git جاهز%RESET%
echo.
exit /b 0

:show_changes
echo %YELLOW%[التغييرات الحالية]%RESET%
git status --short
echo.
exit /b 0

:create_commit
echo %YELLOW%[إنشاء Commit]%RESET%
echo.
set /p "commit_msg=أدخل رسالة الـ commit (اتركه فارغاً للرسالة التلقائية): "
if "!commit_msg!"=="" (
    for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
    set "commit_msg=Update: !datetime:~0,4!-!datetime:~4,2!-!datetime:~6,2! !datetime:~8,2!:!datetime:~10,2!"
)
git add .
git commit -m "!commit_msg!"
if errorlevel 1 (
    echo %YELLOW%⚠️ لا توجد تغييرات جديدة%RESET%
) else (
    echo %GREEN%✅ تم إنشاء Commit: !commit_msg!%RESET%
)
echo.
exit /b 0

:push_changes
echo %YELLOW%[رفع التحديثات]%RESET%
git push
if errorlevel 1 (
    echo %RED%❌ فشل في رفع التحديثات%RESET%
) else (
    echo %GREEN%✅ تم رفع التحديثات بنجاح%RESET%
)
echo.
exit /b 0

:run_dev
echo %YELLOW%[تشغيل خادم التطوير]%RESET%
echo.
if not exist "node_modules" (
    echo %YELLOW%تثبيت المكتبات...%RESET%
    npm install
)
echo %GREEN%🚀 تشغيل المشروع على http://localhost:5173%RESET%
echo %YELLOW%⚠️ اضغط Ctrl+C لإيقاف الخادم%RESET%
echo.
npm run dev
exit /b 0

:exit
echo.
echo %CYAN%شكراً لاستخدام OrgaFlow36!%RESET%
timeout /t 2 /nobreak >nul
exit

