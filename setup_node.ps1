$nodeVersion = "v20.11.0"
$zipFile = "node-$nodeVersion-win-x64.zip"
$downloadUrl = "https://nodejs.org/dist/$nodeVersion/$zipFile"
$targetDir = "$PWD\.node"

if (!(Test-Path $targetDir)) {
    New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
}

$zipPath = "$targetDir\$zipFile"

if (!(Test-Path "$targetDir\node-$nodeVersion-win-x64\node.exe")) {
    Write-Host "Downloading Node.js $nodeVersion..."
    Invoke-WebRequest -Uri $downloadUrl -OutFile $zipPath
    
    Write-Host "Extracting Node.js..."
    Expand-Archive -Path $zipPath -DestinationPath $targetDir -Force
    
    Write-Host "Cleaning up ZIP..."
    Remove-Item $zipPath
}

Write-Host "Node.js is ready!"
$nodeExe = "$targetDir\node-$nodeVersion-win-x64\node.exe"
& $nodeExe -v
