import sys
import json
sys.path.append('.')
from graph.agent_graph import agent_app

state_input = {
    "goal": "Learn Python",
    "level": "Beginner",
    "progress": {},
    "feedback": ""
}
try:
    final = agent_app.invoke(state_input)
    print(final)
except Exception as e:
    import traceback
    with open("traceback_output.txt", "w", encoding="utf-8") as f:
        traceback.print_exc(file=f)
    print("Traceback written to traceback_output.txt")
