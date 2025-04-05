import json

def get_event_details():
    print("\n🎯 Welcome to the Event Management System!\n")
    
    # Get event type
    while True:
        event_type = input("📋 Enter event type (conference/concert/other): ").lower()
        if event_type in ['conference', 'concert', 'other']:
            break
        print("❌ Invalid event type. Please choose from: conference, concert, or other.")
    
    # Get number of attendees
    while True:
        try:
            attendees = int(input("👥 Enter expected number of attendees: "))
            if attendees > 0:
                break
            print("❌ Number of attendees must be greater than 0.")
        except ValueError:
            print("❌ Please enter a valid number.")
    
    # Initialize speakers list
    speakers = []
    
    # Get speakers for conference
    if event_type == 'conference':
        while True:
            speaker = input("🎤 Enter speaker name (or press Enter to finish): ").strip()
            if not speaker:
                break
            topic = input(f"📢 Enter topic for {speaker}: ").strip()
            bio = input(f"📝 Enter bio for {speaker}: ").strip()
            speakers.append({"name": speaker, "topic": topic, "bio": bio})
    
    # Get sponsorship requirements
    need_sponsorship = input("💼 Do you need sponsorship management? (yes/no): ").lower() == 'yes'
    
    # Get networking requirements
    networking_requirements = input("🤝 Enter any specific networking requirements (or press Enter to skip): ").strip()
    
    # Create event details dictionary
    event_details = {
        "event_type": event_type,
        "attendees": attendees,
        "speakers": speakers if speakers else [],
        "need_sponsorship": need_sponsorship,
        "networking_requirements": networking_requirements if networking_requirements else "None"
    }
    
    # Save to JSON file
    with open('event_details.json', 'w') as f:
        json.dump(event_details, f, indent=4)
    
    print("\n✅ Event details have been collected and saved!\n")
    return event_details

if __name__ == "__main__":
    event_details = get_event_details()
    print("\n📝 Collected Event Details:")
    print(json.dumps(event_details, indent=4))