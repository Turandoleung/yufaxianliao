Set-Location "d:\moments"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Git Push Script - yufaxianliao" -ForegroundColor Cyan
Write-Host "  Remote: git@github.com:Turandoleung/yufaxianliao.git" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/4] Checking current status..." -ForegroundColor Yellow
git status
Write-Host ""

Write-Host "[2/4] Adding all changes..." -ForegroundColor Yellow
git add .
Write-Host ""

Write-Host "[3/4] Committing changes..." -ForegroundColor Yellow
$commitMsg = Read-Host "Enter commit message (default: 'update')"
if ([string]::IsNullOrWhiteSpace($commitMsg)) {
    $commitMsg = "update"
}
git commit -m $commitMsg
Write-Host ""

Write-Host "[4/4] Pushing to remote (main branch)..." -ForegroundColor Yellow
git push origin main
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Done!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan