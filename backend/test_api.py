import requests

print("--- Test 1: Off-topic question (should be rejected) ---")
r = requests.post("http://localhost:8000/chat/", json={"message": "tell me about videogames", "mode": "Quick Answer Mode"})
print(r.status_code, ":", r.json()["answer"][:150])

print("\n--- Test 2: On-topic question from notes (should answer) ---")
r2 = requests.post("http://localhost:8000/chat/", json={"message": "What is locking in databases?", "mode": "Quick Answer Mode"})
print(r2.status_code, ":", r2.json()["answer"][:300])
