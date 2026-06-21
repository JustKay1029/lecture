# Image Copy Helper Script
# Usage: Right-click -> Run with PowerShell
# OR in terminal: powershell -ExecutionPolicy Bypass -File copy-images.ps1
#
# This script copies image files from a source folder into src/assets/
# using proper BINARY mode to prevent corruption.

param(
    [string]$SourceFolder = ""
)

$targetDir = Join-Path $PSScriptRoot "src\assets"

if (-not $SourceFolder) {
    # If no source folder provided, prompt user
    Add-Type -AssemblyName System.Windows.Forms
    $dialog = New-Object System.Windows.Forms.FolderBrowserDialog
    $dialog.Description = "Select the folder containing your photos"
    $dialog.ShowNewFolderButton = $false
    
    if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
        $SourceFolder = $dialog.SelectedPath
    } else {
        Write-Host "No folder selected. Exiting." -ForegroundColor Yellow
        exit
    }
}

Write-Host "`n=== Image Copy Helper ===" -ForegroundColor Cyan
Write-Host "Source: $SourceFolder" -ForegroundColor Green
Write-Host "Target: $targetDir" -ForegroundColor Green
Write-Host ""

# Get all image files from source
$imageFiles = Get-ChildItem $SourceFolder -File | Where-Object {
    $_.Extension -match '\.(jpg|jpeg|png|gif|webp)$'
}

if ($imageFiles.Count -eq 0) {
    Write-Host "No image files found in source folder!" -ForegroundColor Red
    exit
}

Write-Host "Found $($imageFiles.Count) image files to copy." -ForegroundColor Cyan

$copied = 0
$skipped = 0

foreach ($file in $imageFiles) {
    $destPath = Join-Path $targetDir $file.Name
    
    # Use .NET binary copy to ensure no encoding corruption
    try {
        [System.IO.File]::Copy($file.FullName, $destPath, $true)
        
        # Verify the copy
        $srcBytes = [System.IO.File]::ReadAllBytes($file.FullName)
        $dstBytes = [System.IO.File]::ReadAllBytes($destPath)
        
        if ($srcBytes.Length -eq $dstBytes.Length) {
            $isJpeg = ($dstBytes[0] -eq 0xFF -and $dstBytes[1] -eq 0xD8)
            $isPng = ($dstBytes[0] -eq 0x89 -and $dstBytes[1] -eq 0x50)
            
            if ($isJpeg -or $isPng) {
                Write-Host "  OK: $($file.Name) ($($file.Length) bytes)" -ForegroundColor Green
                $copied++
            } else {
                Write-Host "  WARNING: $($file.Name) - source file may not be a valid image" -ForegroundColor Yellow
                $copied++
            }
        } else {
            Write-Host "  ERROR: $($file.Name) - size mismatch after copy!" -ForegroundColor Red
            $skipped++
        }
    } catch {
        Write-Host "  ERROR: $($file.Name) - $($_.Exception.Message)" -ForegroundColor Red
        $skipped++
    }
}

Write-Host "`n=== Complete ===" -ForegroundColor Cyan
Write-Host "Copied: $copied files" -ForegroundColor Green
if ($skipped -gt 0) { Write-Host "Errors: $skipped files" -ForegroundColor Red }
Write-Host "`nNow run 'npm run dev' to see your images!" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to exit"
