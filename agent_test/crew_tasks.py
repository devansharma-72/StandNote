from crewai import Task
from crew_agents import agents

def get_event_tasks(event_details):
    """
    Generate tasks dynamically based on event details with proper dependencies.
    """
    tasks = []

    event_type = event_details.get("event_type", "custom")
    attendees = event_details.get("attendees", 0)
    speakers = event_details.get("speakers", [])

    # 🔹 Common Tasks for All Events - Initial Planning Phase
    schedule_task = Task(
        description=f"Create a detailed event schedule for {event_type} with {attendees} attendees.",
        agent=agents.get("event_planner"), 
        expected_output="A comprehensive schedule ready for distribution"
    )
    tasks.append(schedule_task)

    # Support and networking tasks
    support_task = Task(
        description=f"Provide real-time support for {attendees} attendees during registration and the event.",
        agent=agents.get("attendee_support"),
        expected_output="Support system established and ready for attendee assistance"
    )
    tasks.append(support_task)

    networking_task = Task(
        description=f"Facilitate networking connections between attendees at the {event_type} event.",
        agent=agents.get("networking_facilitator"),
        expected_output="Networking opportunities identified and connections facilitated"
    )
    tasks.append(networking_task)

    sponsorship_task = Task(
        description=f"Secure and manage sponsorships for the {event_type} event.",
        agent=agents.get("sponsorship_manager"),
        expected_output="Sponsorship agreements secured and partnerships established"
    )
    tasks.append(sponsorship_task)

    # 🔹 Conference-Specific Tasks
    if event_type == "conference":
        if speakers:
            speaker_task = Task(
                description=f"Coordinate with {len(speakers)} speakers, collect bios, and manage session materials.",
                agent=agents.get("event_planner"),
                expected_output="Complete speaker profiles and materials collected and organized"
            )
            tasks.append(speaker_task)

            networking_task = Task(
                description=f"Facilitate networking for {attendees} attendees and {len(speakers)} speakers.",
                agent=agents.get("networking_facilitator"),
                expected_output="Networking sessions planned and communication channels established"
            )
            tasks.append(networking_task)

    # 🔹 Concert-Specific Tasks
    elif event_type == "concert":
        lineup_task = Task(
            description=f"Plan the concert lineup and logistics for {attendees} attendees, ensuring smooth transitions between performances.",
            agent=agents.get("event_planner"),
            expected_output="Finalized concert lineup and logistics plan"
        )
        tasks.append(lineup_task)

        sponsorship_task = Task(
            description="Secure and manage sponsorships and artist collaborations, enhancing event visibility and engagement.",
            agent=agents.get("sponsorship_manager"),
            expected_output="Confirmed sponsorships and collaboration agreements"
        )
        tasks.append(sponsorship_task)

    # 🔹 Custom Event Tasks
    else:
        logistics_task = Task(
            description=f"Handle logistics for a custom {event_type} event with {attendees} attendees, optimizing resource allocation and venue setup.",
            agent=agents.get("event_planner"),
            expected_output="Complete logistics plan with resource allocation and venue setup details"
        )
        tasks.append(logistics_task)

    # Feedback collection task
    feedback_task = Task(
        description=f"Collect and analyze feedback from {attendees} attendees for the {event_type} event.",
        agent=agents.get("feedback_collector"),
        expected_output="Comprehensive feedback report with actionable insights"
    )
    tasks.append(feedback_task)

    return tasks
