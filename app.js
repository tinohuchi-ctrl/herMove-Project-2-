/*
  herMove prototype JavaScript.
  This file controls form actions, activity cards, buddy search, and joining.
  Data is saved in this browser with localStorage. It is not a shared online database.
*/

const STORAGE_KEYS = {
    profile: "herMoveProfile",
    activities: "herMoveActivities",
    joined: "herMoveJoined"
};

const starterActivities = [
    {
        id: "activity-1",
        name: "Morning Run",
        sport: "Running",
        location: "Eindhoven",
        date: "2026-10-24",
        time: "10:00",
        participants: ["Marcus", "Tanatswa", "Patricia"],
        maxParticipants: 5,
        description: "A relaxed morning run for beginners."
    },
    {
        id: "activity-2",
        name: "Beginner Gym",
        sport: "Gym",
        location: "Tilburg",
        date: "2026-10-25",
        time: "14:00",
        participants: ["Lina", "Maya"],
        maxParticipants: 4,
        description: "A beginner-friendly gym session to build confidence."
    },
    {
        id: "activity-3",
        name: "Tennis Meetup",
        sport: "Tennis",
        location: "Eindhoven",
        date: "2026-10-26",
        time: "18:00",
        participants: ["Aisha", "Noor", "Sophie"],
        maxParticipants: 4,
        description: "A friendly tennis meetup for people who want to practise together."
    }
];

const sampleBuddies = [
    { name: "Patricia", sport: "Running, Tennis", skill: "Beginner", location: "Eindhoven", availability: "Saturday mornings", bio: "I enjoy relaxed runs and learning new sports." },
    { name: "Maya", sport: "Gym, Yoga", skill: "Intermediate", location: "Tilburg", availability: "Friday evenings", bio: "Looking for a workout buddy to stay consistent." },
    { name: "Aisha", sport: "Tennis, Running", skill: "Beginner", location: "Eindhoven", availability: "Monday evenings", bio: "I like social sports and meeting new people." },
    { name: "Noor", sport: "Yoga, Gym", skill: "Advanced", location: "Best", availability: "Friday mornings", bio: "Happy to share tips and train together." }
];

function readStorage(key, fallback) {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    } catch (error) {
        return fallback;
    }
}

function saveStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getActivities() {
    const saved = readStorage(STORAGE_KEYS.activities, null);
    if (Array.isArray(saved) && saved.length > 0) return saved;
    saveStorage(STORAGE_KEYS.activities, starterActivities);
    return [...starterActivities];
}

function getProfile() {
    return readStorage(STORAGE_KEYS.profile, null);
}

function getJoined() {
    return readStorage(STORAGE_KEYS.joined, {});
}

function formatDate(dateString) {
    if (!dateString) return "Date not set";
    const date = new Date(dateString + "T12:00:00");
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-GB", {
        weekday: "short", day: "numeric", month: "short", year: "numeric"
    });
}

function showFeedback(element, text, type) {
    if (!element) return;
    element.textContent = text;
    element.className = "feedback " + type;
}

function createTextElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = text;
    return element;
}

/* ---------- Registration page ---------- */
function setupRegistration() {
    const form = document.getElementById("profileForm");
    if (!form) return;

    const existingProfile = getProfile();
    if (existingProfile) {
        document.getElementById("fullName").value = existingProfile.fullName || "";
        document.getElementById("email").value = existingProfile.email || "";
        document.getElementById("location").value = existingProfile.location || "";
        document.getElementById("sports").value = existingProfile.sports || "";
        document.getElementById("skillLevel").value = existingProfile.skillLevel || "";
        document.getElementById("availability").value = existingProfile.availability || "";
        document.getElementById("bio").value = existingProfile.bio || "";
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const profile = {
            fullName: document.getElementById("fullName").value.trim(),
            email: document.getElementById("email").value.trim(),
            // Deliberately do not save the password in this front-end prototype.
            location: document.getElementById("location").value.trim(),
            sports: document.getElementById("sports").value.trim(),
            skillLevel: document.getElementById("skillLevel").value,
            availability: document.getElementById("availability").value.trim(),
            bio: document.getElementById("bio").value.trim()
        };

        if (!profile.fullName || !profile.email || !profile.location ||
            !profile.sports || !profile.skillLevel || !profile.availability) {
            showFeedback(document.getElementById("profileMessage"),
                "Please complete all required fields.", "error");
            return;
        }

        saveStorage(STORAGE_KEYS.profile, profile);
        showFeedback(document.getElementById("profileMessage"),
            "Profile saved successfully! Taking you to the home page…", "success");

        window.setTimeout(() => {
            window.location.href = "index.html";
        }, 900);
    });
}

/* ---------- Activities list page ---------- */
function setupActivitiesPage() {
    const list = document.getElementById("activitiesList");
    if (!list) return;

    const activities = getActivities();
    const emptyMessage = document.getElementById("activitiesEmpty");
    list.innerHTML = "";

    if (activities.length === 0) {
        emptyMessage?.classList.remove("hidden");
        return;
    }
    emptyMessage?.classList.add("hidden");

    activities.forEach(activity => {
        const card = document.createElement("article");
        card.className = "activity-card";

        card.appendChild(createTextElement("div", "card-emoji", sportEmoji(activity.sport)));
        card.appendChild(createTextElement("span", "tag", activity.sport));
        card.appendChild(createTextElement("h3", "", activity.name));
        card.appendChild(createTextElement("p", "card-meta", "📍 Location: " + activity.location));
        card.appendChild(createTextElement("p", "card-meta", "📅 " + formatDate(activity.date)));
        card.appendChild(createTextElement("p", "card-meta", "🕒 " + activity.time));
        card.appendChild(createTextElement("p", "card-meta", "👥 " + activity.participants.length + "/" + activity.maxParticipants + " participants"));
        card.appendChild(createTextElement("p", "card-description", activity.description));

        const actions = document.createElement("div");
        actions.className = "card-actions";
        const viewButton = document.createElement("a");
        viewButton.className = "button button-yellow";
        viewButton.href = "activity-detail.html?id=" + encodeURIComponent(activity.id);
        viewButton.textContent = "View Activity";
        actions.appendChild(viewButton);
        card.appendChild(actions);
        list.appendChild(card);
    });
}

function sportEmoji(sport) {
    const name = (sport || "").toLowerCase();
    if (name.includes("run")) return "🏃‍♀️";
    if (name.includes("gym") || name.includes("fitness")) return "🏋️‍♀️";
    if (name.includes("tennis")) return "🎾";
    if (name.includes("yoga")) return "🧘‍♀️";
    if (name.includes("volley")) return "🏐";
    if (name.includes("basket")) return "🏀";
    if (name.includes("swim")) return "🏊‍♀️";
    return "🤸‍♀️";
}

/* ---------- Activity details and Join Activity button ---------- */
function setupActivityDetail() {
    const container = document.getElementById("activityDetail");
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const activityId = params.get("id");
    const activities = getActivities();
    const activity = activities.find(item => item.id === activityId);

    if (!activity) {
        container.appendChild(createTextElement("h1", "", "Activity not found"));
        container.appendChild(createTextElement("p", "", "This activity may have been removed."));
        return;
    }

    const profile = getProfile();
    const joined = getJoined();
    const memberName = profile?.fullName || "Guest";
    const alreadyJoined = Array.isArray(joined[activity.id]) && joined[activity.id].includes(memberName);
    const isFull = activity.participants.length >= Number(activity.maxParticipants);

    const panel = document.createElement("section");
    panel.className = "detail-panel";
    panel.appendChild(createTextElement("div", "card-emoji", sportEmoji(activity.sport)));
    panel.appendChild(createTextElement("span", "tag", activity.sport));
    panel.appendChild(createTextElement("h1", "detail-title", activity.name));

    const details = document.createElement("div");
    details.className = "detail-grid";
    [
        ["Sport", activity.sport],
        ["Location", activity.location],
        ["Date", formatDate(activity.date)],
        ["Time", activity.time],
        ["Participants", activity.participants.length + "/" + activity.maxParticipants]
    ].forEach(([label, value]) => {
        const item = document.createElement("p");
        item.className = "detail-item";
        item.textContent = label + ": " + value;
        details.appendChild(item);
    });
    panel.appendChild(details);
    panel.appendChild(createTextElement("h2", "", "About this activity"));
    panel.appendChild(createTextElement("p", "", activity.description));
    panel.appendChild(createTextElement("h3", "", "Participants"));

    const participantList = document.createElement("ul");
    participantList.className = "participant-list";
    activity.participants.forEach(name => participantList.appendChild(createTextElement("li", "", name)));
    if (activity.participants.length === 0) {
        participantList.appendChild(createTextElement("li", "", "Be the first to join!"));
    }
    panel.appendChild(participantList);

    const joinButton = document.createElement("button");
    joinButton.className = "button button-pink";
    joinButton.type = "button";
    const feedback = createTextElement("p", "join-feedback", "");
    feedback.setAttribute("aria-live", "polite");

    if (alreadyJoined) {
        joinButton.textContent = "Joined ✓";
        joinButton.disabled = true;
        feedback.textContent = "You have successfully joined this activity!";
    } else if (isFull) {
        joinButton.textContent = "Activity Full";
        joinButton.disabled = true;
    } else {
        joinButton.textContent = "Join Activity";
        joinButton.addEventListener("click", function () {
            if (!getProfile()) {
                feedback.textContent = "Please create your profile before joining an activity.";
                feedback.className = "join-feedback";
                const registerLink = document.createElement("a");
                registerLink.href = "register.html";
                registerLink.className = "text-link";
                registerLink.textContent = " Create your profile";
                feedback.appendChild(registerLink);
                return;
            }

            const currentProfile = getProfile();
            const currentName = currentProfile.fullName;
            const latestActivities = getActivities();
            const latestActivity = latestActivities.find(item => item.id === activity.id);
            if (!latestActivity) return;

            const latestJoined = getJoined();
            latestJoined[activity.id] = Array.isArray(latestJoined[activity.id]) ? latestJoined[activity.id] : [];

            if (latestJoined[activity.id].includes(currentName)) {
                feedback.textContent = "You have already joined this activity.";
                return;
            }
            if (latestActivity.participants.length >= Number(latestActivity.maxParticipants)) {
                feedback.textContent = "Sorry, this activity is now full.";
                joinButton.textContent = "Activity Full";
                joinButton.disabled = true;
                return;
            }

            latestActivity.participants.push(currentName);
            latestJoined[activity.id].push(currentName);
            saveStorage(STORAGE_KEYS.activities, latestActivities);
            saveStorage(STORAGE_KEYS.joined, latestJoined);

            feedback.textContent = "You have successfully joined this activity!";
            joinButton.textContent = "Joined ✓";
            joinButton.disabled = true;
            window.setTimeout(() => window.location.reload(), 650);
        });
    }

    panel.appendChild(joinButton);
    panel.appendChild(feedback);
    container.appendChild(panel);
}

/* ---------- Create activity page ---------- */
function setupCreateActivity() {
    const form = document.getElementById("createActivityForm");
    if (!form) return;

    const dateInput = document.getElementById("activityDate");
    const today = new Date();
    const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
        .toISOString().split("T")[0];
    dateInput.min = localToday;

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const activity = {
            id: "activity-" + Date.now(),
            name: document.getElementById("activityName").value.trim(),
            sport: document.getElementById("activitySport").value.trim(),
            location: document.getElementById("activityLocation").value.trim(),
            date: document.getElementById("activityDate").value,
            time: document.getElementById("activityTime").value,
            maxParticipants: Number(document.getElementById("activityMax").value),
            participants: [],
            description: document.getElementById("activityDescription").value.trim()
        };

        if (!activity.name || !activity.sport || !activity.location ||
            !activity.date || !activity.time || !activity.description ||
            activity.maxParticipants < 2 || activity.maxParticipants > 50) {
            showFeedback(document.getElementById("createActivityMessage"),
                "Please complete every required field and choose a participant limit between 2 and 50.", "error");
            return;
        }

        const activities = getActivities();
        activities.unshift(activity);
        saveStorage(STORAGE_KEYS.activities, activities);

        showFeedback(document.getElementById("createActivityMessage"),
            "Activity created successfully! Opening the activities page…", "success");
        window.setTimeout(() => {
            window.location.href = "activities.html";
        }, 800);
    });
}

/* ---------- Find buddy page ---------- */
function setupBuddySearch() {
    const form = document.getElementById("buddySearchForm");
    const results = document.getElementById("buddyResults");
    if (!form || !results) return;

    const profile = getProfile();
    const buddies = [...sampleBuddies];
    if (profile) {
        buddies.unshift({
            name: profile.fullName + " (you)",
            sport: profile.sports,
            skill: profile.skillLevel,
            location: profile.location,
            availability: profile.availability,
            bio: profile.bio || "New to herMove."
        });
    }

    function renderBuddies(filtered) {
        results.innerHTML = "";
        document.getElementById("buddyResultCount").textContent =
            filtered.length + (filtered.length === 1 ? " profile found" : " profiles found");

        if (filtered.length === 0) {
            results.appendChild(createTextElement("p", "empty-state", "No profiles match those filters. Try changing your search."));
            return;
        }

        filtered.forEach(buddy => {
            const card = document.createElement("article");
            card.className = "buddy-card";
            card.appendChild(createTextElement("div", "card-emoji", "👩"));
            card.appendChild(createTextElement("h3", "", buddy.name));
            card.appendChild(createTextElement("p", "card-meta", "🏅 Sports: " + buddy.sport));
            card.appendChild(createTextElement("p", "card-meta", "📊 Skill level: " + buddy.skill));
            card.appendChild(createTextElement("p", "card-meta", "📍 Location: " + buddy.location));
            card.appendChild(createTextElement("p", "card-meta", "🗓 Availability: " + buddy.availability));
            card.appendChild(createTextElement("p", "card-description", buddy.bio));
            results.appendChild(card);
        });
    }

    function applySearch() {
        const sport = document.getElementById("searchSport").value.trim().toLowerCase();
        const skill = document.getElementById("searchSkill").value.toLowerCase();
        const location = document.getElementById("searchLocation").value.trim().toLowerCase();
        const availability = document.getElementById("searchAvailability").value.trim().toLowerCase();

        const filtered = buddies.filter(buddy =>
            (!sport || buddy.sport.toLowerCase().includes(sport)) &&
            (!skill || buddy.skill.toLowerCase() === skill) &&
            (!location || buddy.location.toLowerCase().includes(location)) &&
            (!availability || buddy.availability.toLowerCase().includes(availability))
        );
        renderBuddies(filtered);
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        applySearch();
    });

    document.getElementById("clearBuddySearch").addEventListener("click", function () {
        form.reset();
        renderBuddies(buddies);
    });

    renderBuddies(buddies);
}

/* Start only the code needed by the current page. */
document.addEventListener("DOMContentLoaded", function () {
    setupRegistration();
    setupActivitiesPage();
    setupActivityDetail();
    setupCreateActivity();
    setupBuddySearch();
});
