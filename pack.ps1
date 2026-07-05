$root = "C:\Users\Administrator\lobsterai\project\psych-quiz"
$out = "$env:USERPROFILE\Desktop\psych-quiz.zip"
$tmp = "$env:TEMP\psych-pack"

# Clean up
if (Test-Path $out) { Remove-Item $out -Force -ErrorAction SilentlyContinue }
if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue }

# Use robocopy to copy with exclusion (/XD = exclude directories)
robocopy $root $tmp /E /XD node_modules .git dist uploads /XF *.db temp_* package-lock.json /NDL /NFL /NJH /NJS

$count = (Get-ChildItem $tmp -Recurse -File | Measure-Object).Count
Write-Host "Files copied: $count"

# Zip
Compress-Archive -Path "$tmp\*" -DestinationPath $out -CompressionLevel Optimal
Remove-Item $tmp -Recurse -Force

$size = (Get-Item $out).Length
Write-Host "Zip created: $([math]::Round($size/1KB)) KB"
