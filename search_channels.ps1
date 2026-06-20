$c = Get-Content 'C:\Users\sayed\.gemini\antigravity-ide\brain\bda2f959-1392-4558-9c1e-ae96e3fa5e15\.system_generated\steps\55\content.md' -Raw

$terms = @('TUDN','Caze','Fussball','JOJ','M6 ','TSN','RTB','RTE Sport','RTE Player','beIN Sports English')

foreach($term in $terms) {
    $lines = $c -split "`n"
    $found = $false
    for($i=0; $i -lt $lines.Count; $i++) {
        if($lines[$i] -match [regex]::Escape($term)) {
            Write-Host "=== FOUND: $term (line $i) ==="
            Write-Host $lines[$i]
            if($i+1 -lt $lines.Count) { Write-Host $lines[$i+1] }
            $found = $true
        }
    }
    if(-not $found) { Write-Host "=== $term === NOT FOUND" }
}
