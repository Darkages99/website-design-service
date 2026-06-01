# Sync the Brand-Alchemy theme into the Studio WordPress site.
# We develop on E: (git repo + docs) and deploy to C: where the PHP-WASM runtime can read it.
# Usage:  ./sync.ps1      (run after `npm run build` if JS/CSS changed)

$src  = "E:\Website design service\brand-alchemy"
$dest = "C:\Users\SARANG RAJGOPAUL\Studio\brand-alchemyinfo\wp-content\themes\brand-alchemy"

if (-not (Test-Path $src)) { Write-Error "Source theme not found: $src"; exit 1 }

# /MIR mirrors src -> dest (deletes stale files in dest). Exclude dev-only dirs/files.
robocopy $src $dest /MIR /XD node_modules .git /XF *.map .DS_Store Thumbs.db /NFL /NDL /NJH /NJS /NP

# robocopy exit codes: 0-7 = success (8+ = failure)
if ($LASTEXITCODE -ge 8) {
  Write-Error "robocopy failed with code $LASTEXITCODE"
  exit 1
} else {
  Write-Host "Theme synced to Studio (robocopy code $LASTEXITCODE)."
  exit 0
}
