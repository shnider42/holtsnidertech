param(
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Write-Step($Message) {
    Write-Host "==> $Message"
}

$repoRoot = Get-Location
$basePath = Join-Path $repoRoot "app/templates/base.html"
$bostonPath = Join-Path $repoRoot "app/templates/style_variants/boston_practical.html"
$cssPath = Join-Path $repoRoot "app/static/css/boston-practical-staging-background.css"

if (!(Test-Path $basePath)) {
    throw "Could not find app/templates/base.html. Run this script from the repo root."
}

if (!(Test-Path $bostonPath)) {
    throw "Could not find app/templates/style_variants/boston_practical.html. Run this script from the repo root."
}

if (!(Test-Path $cssPath)) {
    throw "Could not find app/static/css/boston-practical-staging-background.css. Extract the ZIP into the repo root first."
}

Write-Step "Removing failed Boston-only background override links from base.html"

$base = Get-Content $basePath -Raw

$baseOriginal = $base

$base = $base -replace '(?m)^\s*<link rel="stylesheet" href="\{\{ url_for\(''static'', filename=''css/boston-practical-raster-logo\.css''\) \}\}" />\r?\n?', ''
$base = $base -replace '(?m)^\s*<link rel="stylesheet" href="\{\{ url_for\(''static'', filename=''css/boston-practical-background-layer\.css''\) \}\}" />\r?\n?', ''

if ($base -ne $baseOriginal) {
    if ($DryRun) {
        Write-Host "Dry run: base.html would be updated."
    } else {
        Set-Content -Path $basePath -Value $base -NoNewline
        Write-Host "Updated base.html."
    }
} else {
    Write-Host "No failed Boston-only links found in base.html. That is okay."
}

Write-Step "Adding Boston Practical staging-background CSS link after inline style"

$boston = Get-Content $bostonPath -Raw
$bostonOriginal = $boston
$link = '<link rel="stylesheet" href="{{ url_for(''static'', filename=''css/boston-practical-staging-background.css'') }}" />'

if ($boston -match [regex]::Escape("boston-practical-staging-background.css")) {
    Write-Host "Boston Practical staging background link already exists."
} else {
    $needle = "</style>`r`n{% endblock %}"
    if ($boston.Contains($needle)) {
        $replacement = "</style>`r`n$link`r`n{% endblock %}"
        $boston = $boston.Replace($needle, $replacement)
    } else {
        $needleLf = "</style>`n{% endblock %}"
        if ($boston.Contains($needleLf)) {
            $replacement = "</style>`n$link`n{% endblock %}"
            $boston = $boston.Replace($needleLf, $replacement)
        } else {
            throw "Could not find '</style>' immediately before '{% endblock %}' in boston_practical.html. Add the link manually after the inline </style>."
        }
    }

    if ($DryRun) {
        Write-Host "Dry run: boston_practical.html would be updated."
    } else {
        Set-Content -Path $bostonPath -Value $boston -NoNewline
        Write-Host "Updated boston_practical.html."
    }
}

Write-Step "Done"

Write-Host ""
Write-Host "Next:"
Write-Host "  1. Restart Flask if needed."
Write-Host "  2. Hard refresh /style-lab/boston-practical."
Write-Host "  3. Inspect git diff:"
Write-Host "       git diff -- app/templates/base.html app/templates/style_variants/boston_practical.html app/static/css/boston-practical-staging-background.css"
