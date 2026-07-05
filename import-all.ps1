# Import all courseware Word documents
$token = (Invoke-RestMethod -Uri http://localhost:3000/api/auth/login -Method POST -ContentType "application/json" -Body '{"phone":"13800000000","password":"admin123"}').data.token

$baseDir = "C:\Users\25338\Desktop\三级心理咨询师培训-理论练习题（word版） (3)\三级心理咨询师培训-理论练习题（word版）"
$files = @(
    @{path="$baseDir\理论第一章心理学导论练习题.docx"; ch=1; name="心理学导论"}
    @{path="$baseDir\理论第二章社会心理学练习题.docx"; ch=2; name="社会心理学"}
    @{path="$baseDir\理论第三章人格心理学练习题.docx"; ch=11; name="人格心理学"}
    @{path="$baseDir\理论第四章发展心理学练习题.docx"; ch=3; name="发展心理学"}
    @{path="$baseDir\理论第五章异常心理学练习题.docx"; ch=12; name="异常心理学"}
    @{path="$baseDir\理论第六章咨询心理学练习题.docx"; ch=6; name="咨询心理学"}
)

# Use node.js to do the upload with node's built-in fetch
$script = @"
const fs = require('fs');
const path = require('path');
const token = `"$token`";

const files = `"$($files | ConvertTo-Json -Compress)`";
"@

foreach ($f in $files) {
    Write-Host "`n>>> 导入 $($f.name)..." -ForegroundColor Yellow
    
    # Build node script for this file
    $nodeScript = @"
const fs = require('fs');
const path = require('path');

async function upload() {
  const filePath = `"$($f.path)`";
  const url = `"http://localhost:3000/api/questions/import?chapterId=$($f.ch)`";
  
  const buffer = fs.readFileSync(filePath);
  const boundary = '----' + Math.random().toString(36).substring(2);
  
  let body = '';
  body += '--' + boundary + '\r\n';
  body += 'Content-Disposition: form-data; name="file"; filename="' + path.basename(filePath) + '"\r\n';
  body += 'Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document\r\n\r\n';
  
  const bodyStart = Buffer.from(body, 'utf-8');
  const bodyEnd = Buffer.from('\r\n--' + boundary + '--\r\n', 'utf-8');
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer `"$token`"',
      'Content-Type': 'multipart/form-data; boundary=' + boundary,
    },
    body: Buffer.concat([bodyStart, buffer, bodyEnd]),
  });
  
  const text = await response.text();
  console.log(text);
}

upload().catch(e => console.error(JSON.stringify({error: e.message})));
"@

    $tempFile = [System.IO.Path]::GetTempFileName() + ".js"
    $nodeScript | Out-File -FilePath $tempFile -Encoding utf8
    $result = node $tempFile 2>&1
    Remove-Item $tempFile -Force
    
    try {
        $parsed = $result | ConvertFrom-Json
        if ($parsed.data.imported) {
            Write-Host "  成功: 导入 $($parsed.data.imported) 题, 失败 $($parsed.data.failed) (共 $($parsed.data.total))" -ForegroundColor Green
            if ($parsed.data.errors) {
                Write-Host "  警告: $($parsed.data.errors.Count) 个错误" -ForegroundColor Yellow
                $parsed.data.errors | Select-Object -First 5 | ForEach-Object { Write-Host "    - $($_.message)" }
            }
        } else {
            Write-Host "  返回: $result" -ForegroundColor Magenta
        }
    } catch {
        Write-Host "  输出: $result" -ForegroundColor Magenta
    }
}
