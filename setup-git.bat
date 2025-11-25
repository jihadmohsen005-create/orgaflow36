@echo off
echo ========================================
echo   OrgaFlow36 - Git Setup
echo ========================================
echo.

echo Step 1: Initializing Git...
git init
echo.

echo Step 2: Adding all files...
git add .
echo.

echo Step 3: Creating initial commit...
git commit -m "Initial commit - OrgaFlow36 ready for deployment"
echo.

echo ========================================
echo   Git setup complete!
echo ========================================
echo.
echo Next steps:
echo 1. Create a repository on GitHub: https://github.com/new
echo 2. Run: git remote add origin https://github.com/YOUR_USERNAME/orgaflow36.git
echo 3. Run: git branch -M main
echo 4. Run: git push -u origin main
echo.
pause

