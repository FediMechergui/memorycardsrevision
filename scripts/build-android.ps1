param([switch]$Release)
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $taskRoot
if (-not $env:JAVA_HOME) {
    $candidates = @('C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot', 'C:\Program Files\Eclipse Adoptium\jdk-21')
    foreach ($candidate in $candidates) { if (Test-Path -LiteralPath $candidate) { $env:JAVA_HOME = $candidate; break } }
}
if (-not $env:ANDROID_HOME -and (Test-Path -LiteralPath "$env:LOCALAPPDATA\Android\Sdk")) { $env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk" }
if (-not $env:JAVA_HOME) { throw 'Définir JAVA_HOME vers un JDK 21.' }
if (-not $env:ANDROID_HOME) { throw 'Définir ANDROID_HOME vers le SDK Android.' }
npm run android:sync
if ($LASTEXITCODE -ne 0) { throw 'La compilation web ou la synchronisation a échoué.' }
$task = 'assembleDebug'
if ($Release) {
    $signingDir = Join-Path $taskRoot '.signing'
    $keyFile = Join-Path $signingDir 'memora-release.jks'
    $passwordFile = Join-Path $signingDir 'keystore-password.txt'
    if (-not (Test-Path -LiteralPath $signingDir)) { New-Item -ItemType Directory -Path $signingDir | Out-Null }
    if (-not (Test-Path -LiteralPath $keyFile)) {
        if (Test-Path -LiteralPath $passwordFile) { throw 'Un fichier de mot de passe existe sans clé. Vérifier .signing avant de créer une nouvelle clé.' }
        $randomBytes = New-Object byte[] 36
        $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
        $rng.GetBytes($randomBytes)
        $rng.Dispose()
        $env:MEMORA_STORE_PASSWORD = [Convert]::ToBase64String($randomBytes)
        $env:MEMORA_KEY_PASSWORD = $env:MEMORA_STORE_PASSWORD
        [System.IO.File]::WriteAllText($passwordFile, $env:MEMORA_STORE_PASSWORD)
        & "$env:JAVA_HOME\bin\keytool.exe" -genkeypair -keystore $keyFile -alias memora -keyalg RSA -keysize 3072 -validity 10000 -storetype PKCS12 -storepass:env MEMORA_STORE_PASSWORD -keypass:env MEMORA_KEY_PASSWORD -dname 'CN=Memora, OU=Android, O=Memora, C=FR'
        if ($LASTEXITCODE -ne 0) { throw 'Création de la clé impossible. Ne pas supprimer les fichiers existants sans vérification.' }
    }
    if (-not (Test-Path -LiteralPath $passwordFile)) { throw 'Le mot de passe de la clé locale est introuvable.' }
    $env:MEMORA_KEYSTORE = $keyFile
    $env:MEMORA_STORE_PASSWORD = [System.IO.File]::ReadAllText($passwordFile).Trim()
    $env:MEMORA_KEY_PASSWORD = $env:MEMORA_STORE_PASSWORD
    $env:MEMORA_KEY_ALIAS = 'memora'
    $task = 'assembleRelease'
}
try {
    Push-Location -LiteralPath (Join-Path $taskRoot 'android')
    .\gradlew.bat $task --no-daemon --max-workers=2
    if ($LASTEXITCODE -ne 0) { throw 'La compilation Android a échoué.' }
} finally {
    Pop-Location
    $env:MEMORA_STORE_PASSWORD = $null
    $env:MEMORA_KEY_PASSWORD = $null
}
$variant = if ($Release) { 'release' } else { 'debug' }
$artifactDir = Join-Path $taskRoot 'artifacts'
New-Item -ItemType Directory -Path $artifactDir -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $taskRoot "android\app\build\outputs\apk\$variant\app-$variant.apk") -Destination (Join-Path $artifactDir "memora-$variant.apk")
Write-Output "APK prêt : artifacts/memora-$variant.apk"
