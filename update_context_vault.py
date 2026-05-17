
import sys
import os

file_path = r'C:\Users\AUREL\JARVIS_VAULT\BRAIN\wiki\core\CONTEXT.md'
if not os.path.exists(file_path):
    print(f"File not found: {file_path}")
    sys.exit(1)

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update Last Session
new_session_details = """## Ultima sesiune
- **Data:** 2026-05-17
- **Agent:** Claude + Gemini CLI
- **Ce s-a făcut:** Audit structural vault BRAIN, reparate broken links, fixat codul engine (inference) pentru New Architecture (lazy init Animated.Value, deepReason rename)."""

# Use regex to replace the old Ultima sesiune block
import re
pattern = r"## Ultima sesiune\n- \*\*Data:.*?\n- \*\*Agent:.*?\n- \*\*Ce s-a făcut:.*"
content = re.sub(pattern, new_session_details, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("CONTEXT.md updated successfully with session info.")
