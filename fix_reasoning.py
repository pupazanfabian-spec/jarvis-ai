
import sys
import os

file_path = r'C:\Users\AUREL\JARVIS_VAULT\BRAIN\wiki\core\REASONING.md'
if not os.path.exists(file_path):
    print(f"File not found: {file_path}")
    sys.exit(1)

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = '### [DEBATE] Implementare Task 2: Dynamic M...'
end_marker = '## 🔗 Conexiuni'

start_idx = content.find(start_marker)
if start_idx != -1:
    end_idx = content.find(end_marker, start_idx)
    if end_idx == -1:
        end_idx = len(content)
    
    block = content[start_idx:end_idx]
    
    # Order matters: more specific/longer patterns first
    replacements = [
        ('Ã¢â‚¬â€', '—'),
        ('Ã¢â‚¬â„¢', '’'),
        ('Ã„Æ’', 'ă'),
        ('Ãˆâ„¢', 'ș'),
        ('Ãˆâ„º', 'ț'),
        ('Ãˆâ€º', 'ț'),
        ('ÃƒÂ®', 'î'),
        ('ÃƒÂ¢', 'â'),
        ('Ãˆâ€', 'ț'),
        ('Ãˆâ„', 'ș'),
        ('ÃƒÂ', 'â'),
        ('Äƒ', 'ă'),
        ('È™', 'ș'),
        ('Ã®', 'î'),
        ('â€"', '—'),
        ('È›', 'ț'),
        ('Ã¢', 'â'),
        ('ÄƒÈ™', 'ași'),
    ]
    
    # Specific words to be sure
    word_replacements = [
        ('automatÃ„Æ’', 'automată'),
        ('SemanticÃ„Æ’', 'Semantică'),
        ('eficienÃˆâ€ºa', 'eficiența'),
        ('cognitivÃ„Æ’', 'cognitivă'),
        ('ÃƒÂ®n', 'în'),
        ('asigurÃƒÂ¢nd', 'asigurând'),
        ('Ãˆâ„¢i', 'și'),
        ('TehnicÃ„Æ’', 'Tehnică'),
        ('riscÃ„Æ’', 'riscă'),
        ('sintezÃ„Æ’', 'sinteză'),
        ('IntegritÃ„Æ’Ãˆâ€ºii', 'Integrității'),
        ('bidirecÃˆâ€ºionale', 'bidirecționale'),
        ('apariÃˆâ€ºia', 'apariția'),
        ('cunoÃˆâ„¢tinÃˆâ€ºe', 'cunoștințe'),
        ('operaÃˆâ€ºionalÃ„Æ’', 'operațională'),
        ('informaÃˆâ€ºional', 'informațional'),
        ('relevanÃˆâ€ºÃ„Æ’', 'relevanță'),
        ('ridicatÃ„Æ’', 'ridicată'),
        ('ireversibilÃ„Æ’', 'ireversibilă'),
        ('eÃˆâ„¢ec', 'eșec'),
        ('greÃˆâ„¢it', 'greșit'),
    ]
    
    for old, new in word_replacements:
        block = block.replace(old, new)
    for old, new in replacements:
        block = block.replace(old, new)
        
    new_content = content[:start_idx] + block + content[end_idx:]
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("REASONING.md updated successfully.")
else:
    print("Start marker not found in REASONING.md")
