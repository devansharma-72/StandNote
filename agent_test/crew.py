import json
from crewai import Crew, Process
from crew_agents import agents
from crew_tasks import get_event_tasks

# 📌 Get event details from user input
from event_input import get_event_details


event_details = get_event_details()

# 🔹 Get the Event Manager (Super Agent)
event_manager = agents["event_manager"]

# 🔹 Use the Super Agent to divide tasks dynamically
print("🔹 Assigning tasks based on event details...\n")
tasks = get_event_tasks(event_details)  

# 🔹 Create the AI-powered event management crew
event_crew = Crew(
    agents=[task.agent for task in tasks],  # Assign only required agents
    process=Process.sequential,
    tasks=tasks,
    verbose=True
)

# 🔹 Run the system
if __name__ == "__main__":
    print("🔹 Event tasks have been successfully assigned!\n")
    event_crew.kickoff()
