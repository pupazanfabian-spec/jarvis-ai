import json
import os
import sys

REGISTRY_PATH = os.path.join(os.path.dirname(__file__), "account_registry.json")

def load_registry():
    with open(REGISTRY_PATH, "r") as f:
        return json.load(f)

def save_registry(data):
    with open(REGISTRY_PATH, "w") as f:
        json.dump(data, f, indent=2)

def get_status(data):
    acc_idx = data["current_account"]
    mod_idx = data["current_model"]
    
    if acc_idx >= len(data["accounts"]):
        return "🛑 ALL QUOTAS EXHAUSTED. Run 'reset' to start over."

    acc = data["accounts"][acc_idx]
    model = acc["models"][mod_idx]
    
    total_slots = sum(len(a["models"]) for a in data["accounts"])
    used_slots = sum(len(a["quota_exhausted_models"]) for a in data["accounts"])
    remaining = total_slots - used_slots
    
    status_msg = (
        f"👤 Account: {acc['email']} ({acc['alias']})\n"
        f"🤖 Model: {model}\n"
        f"🔋 Remaining Slots: {remaining}/{total_slots}"
    )
    return status_msg

def rotate(data):
    acc_idx = data["current_account"]
    mod_idx = data["current_model"]
    
    # Mark current as exhausted
    acc = data["accounts"][acc_idx]
    current_model = acc["models"][mod_idx]
    if current_model not in acc["quota_exhausted_models"]:
        acc["quota_exhausted_models"].append(current_model)
    
    # Find next available
    found = False
    start_acc = acc_idx
    start_mod = mod_idx
    
    # Try next models on same account
    for m_idx in range(mod_idx + 1, len(acc["models"])):
        if acc["models"][m_idx] not in acc["quota_exhausted_models"]:
            data["current_model"] = m_idx
            found = True
            break
            
    if not found:
        # Try next accounts
        for a_idx in range(acc_idx + 1, len(data["accounts"])):
            next_acc = data["accounts"][a_idx]
            for m_idx in range(len(next_acc["models"])):
                if next_acc["models"][m_idx] not in next_acc["quota_exhausted_models"]:
                    data["current_account"] = a_idx
                    data["current_model"] = m_idx
                    found = True
                    break
            if found: break

    if found:
        new_acc = data["accounts"][data["current_account"]]
        new_model = new_acc["models"][data["current_model"]]
        print(f"🔄 Rotated to: {new_acc['alias']} | {new_model}")
        if data["current_account"] != acc_idx:
            print(f"\n👉 RUN THIS COMMAND:\ngemini auth --account {new_acc['email']}\n")
    else:
        data["current_account"] = len(data["accounts"]) # Sentinel for STOP
        print("🛑 STOP: All accounts and models exhausted.")
    
    save_registry(data)

def reset(data):
    for acc in data["accounts"]:
        acc["quota_exhausted_models"] = []
    data["current_account"] = 0
    data["current_model"] = 0
    save_registry(data)
    print("♻️ Registry reset. All quotas cleared.")

if __name__ == "__main__":
    if not os.path.exists(REGISTRY_PATH):
        print(f"Error: {REGISTRY_PATH} not found.")
        sys.exit(1)
        
    data = load_registry()
    cmd = sys.argv[1] if len(sys.argv) > 1 else "status"
    
    if cmd == "status":
        print(get_status(data))
    elif cmd == "exhausted":
        rotate(data)
    elif cmd == "reset":
        reset(data)
    else:
        print("Usage: python gemini_rotator.py [status|exhausted|reset]")
