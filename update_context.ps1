$path = "C:\Users\AUREL\JARVIS_VAULT\BRAIN\wiki\core\CONTEXT.md"
$content = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)
$newContent = New-Object System.Collections.Generic.List[string]

# UTF-8 characters for replacement
$agentLine = "- **Gemini CLI** — execuție cod, disponibil în terminal, cont activ: sabrinaanghel1@gmail.com (cont4)"
$decisionLine = "- [2026-05-15] gemini-mcp-tool funcțional după rotație la cont4 (sabrinaanghel1@gmail.com) — oauth_creds.json schimbat manual prin login interactiv"

foreach ($line in $content) {
    if ($line -match "- \*\*Gemini CLI\*\*") {
        $newContent.Add($agentLine)
    } elseif ($line -match "Actualizare BRAIN") {
        $newContent.Add($line)
        $newContent.Add($decisionLine)
    } else {
        $newContent.Add($line)
    }
}

[System.IO.File]::WriteAllLines($path, $newContent, [System.Text.Encoding]::UTF8)
