from crewai import Agent
import os
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv

load_dotenv()


chat_model = ChatOpenAI(
    model_name="mistral/mistral-small",
    openai_api_key=os.getenv("MISTRAL_API_KEY"),
    openai_api_base="https://api.mistral.ai/v1",
    temperature=0.7,
    max_tokens=2000
)
# 🔹 Super Agent: Event Manager
class EventManager(Agent):
    def __init__(self):
        super().__init__(
            role="Event Manager",
            goal="Coordinate the event planning process, assign tasks, and manage agents.",
            backstory="A highly organized AI managing multiple agents, ensuring the event runs smoothly.",
            llm=chat_model,  
            verbose=True
        )

    def divide_tasks(self, event_details, agents):
        """
        Divide the event-related tasks among agents dynamically based on event details.
        """
        event_type = event_details.get("event_type")
        attendees = event_details.get("attendees", 0)
        speakers = event_details.get("speakers", [])

        tasks = []

        # 🔹 Assign tasks based on event type
        if event_type == "conference":
            tasks.extend([
                {"agent": agents["event_planner"], "task": "Create event schedule and session times."},
                {"agent": agents["attendee_support"], "task": f"Prepare for {attendees} attendees."},
                {"agent": agents["sponsorship_manager"], "task": "Handle sponsorships and brand collaborations."}
            ])
        elif event_type == "concert":
            tasks.extend([
                {"agent": agents["event_planner"], "task": "Plan concert timings and artist lineups."},
                {"agent": agents["sponsorship_manager"], "task": "Handle sponsorships and brand collaborations."}
            ])
        else:
            tasks.extend([
                {"agent": agents["event_planner"], "task": "Create a general event plan."},
                {"agent": agents["feedback_collector"], "task": "Prepare feedback forms for attendees."},
            ])

        # Track completed tasks to avoid duplication
        completed_tasks = set()

        # 🔹 Execute tasks
        print("\n🔄 Starting Task Execution...\n")
        for task in tasks:
            task_key = f"{task['agent'].role}:{task['task']}"
            if task_key not in completed_tasks:
                agent = task["agent"]
                print(f"📋 Task: {task['task']}")
                print(f"👤 Agent: {agent.role}")
                result = agent.run(task["task"])
                print(f"✅ Completed\n")
                completed_tasks.add(task_key)

        return "Tasks have been successfully assigned."

# 🔹 Define All Agents
event_planner = Agent(
    role="Event Planner",
    goal="Create event schedules and manage logistics.",
    backstory="An expert in handling large-scale event logistics and schedules.",
    llm=chat_model,  
    verbose=True
)

attendee_support = Agent(
    role="Attendee Support",
    goal="Provide real-time responses to attendee questions.",
    backstory="A friendly chatbot ensuring smooth event participation.",
    llm=chat_model,  
    verbose=True
)

networking_facilitator = Agent(
    role="Networking Facilitator",
    goal="Recommend connections between attendees based on their interests.",
    backstory="AI-powered assistant helping attendees make valuable connections.",
    llm=chat_model,  
    verbose=True
)

sponsorship_manager = Agent(
    role="Sponsorship Manager",
    goal="Secure sponsorships and manage brand partnerships.",
    backstory="Expert in securing sponsorship deals and maximizing brand exposure.",
    llm=chat_model, 
    verbose=True
)

feedback_collector = Agent(
    role="Feedback Collector",
    goal="Collect post-event feedback and generate reports.",
    backstory="Specialist in analyzing attendee feedback to improve future events.",
    llm=chat_model,  
    verbose=True
)


agents = {
    "event_manager": EventManager(),
    "event_planner": event_planner,
    "attendee_support": attendee_support,
    "networking_facilitator": networking_facilitator,
    "sponsorship_manager": sponsorship_manager,
    "feedback_collector": feedback_collector
}
