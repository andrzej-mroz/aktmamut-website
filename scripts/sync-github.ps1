$ErrorActionPreference = "Stop"

$repo = Split-Path -Parent $PSScriptRoot
Set-Location $repo

Write-Host ""
Write-Host "=== AKT Mamut - GitHub sync ==="
Write-Host ""

# Upewnij się, że jesteśmy na main
$branch = git branch --show-current

if ($branch -ne "main") {
    Write-Host "UWAGA: jestes na branchu: $branch"
    exit 1
}

# Najpierw sprawdz GitHub
Write-Host "Sprawdzam GitHub..."
git fetch origin

Write-Host ""

# Sprawdz lokalne zmiany
$changes = git status --porcelain

if ($changes) {
    Write-Host "Masz lokalne, niezapisane zmiany:"
    Write-Host ""
    git status
    Write-Host ""
    Write-Host "Nie wykonuje pull. Najpierw zdecyduj co z tymi zmianami."
    exit 1
}

# Porownaj lokalny main z origin/main
$local  = git rev-parse HEAD
$remote = git rev-parse origin/main
$base   = git merge-base HEAD origin/main

if ($local -eq $remote) {

    Write-Host "OK - komputer jest zsynchronizowany z GitHub."
    exit 0
}

if ($local -eq $base) {

    Write-Host "Ten komputer jest z tylu."
    Write-Host ""
    Write-Host "Do pobrania:"
    git log --oneline HEAD..origin/main
    Write-Host ""

    git pull --ff-only

    Write-Host ""
    Write-Host "OK - pobrano zmiany z GitHub."
    exit 0
}

if ($remote -eq $base) {

    Write-Host "UWAGA: ten komputer ma lokalne commity, ktorych nie ma na GitHub."
    Write-Host ""
    Write-Host "Do wyslania:"
    git log --oneline origin/main..HEAD
    Write-Host ""
    Write-Host "Wykonaj:"
    Write-Host "git push"
    exit 0
}

Write-Host "UWAGA: historia lokalna i GitHub sie rozeszly."
Write-Host "Nie wykonuje automatycznej synchronizacji."
git status -sb
exit 1