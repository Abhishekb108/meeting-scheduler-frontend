import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import API from "../api";
import "../styles/CreateEventPage.css";

function CreateEventPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [editEventId, setEditEventId] = useState(
    location.state?.editEventId || null
  );
  const [formData, setFormData] = useState({
    title: "",
    dateTime: "",
    duration: "60",
    type: "group",
    password: "",
    description: "",
  });
  const [userName, setUserName] = useState("");
  const [existingMeetings, setExistingMeetings] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError("You are not authenticated. Please log in again.");
          navigate("/login");
          return;
        }

        const userResponse = await API.get("/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserName(userResponse.data.user.username || "User");

        const meetingsResponse = await API.get("/meetings", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setExistingMeetings(meetingsResponse.data.meetings || []);

        if (id || editEventId) {
          setIsEditing(true);
          const eventId = id || editEventId;
          const eventResponse = await API.get(`/meetings/${eventId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const event = eventResponse.data.meeting;
          if (event) {
            setFormData({
              title: event.title || "",
              dateTime: event.dateTime
                ? new Date(event.dateTime).toISOString().slice(0, 16)
                : "",
              duration: "60",
              type: "group",
              password: event.password || "",
              description: event.description || "",
            });
          }
        }
      } catch (err) {
        console.log("Error fetching data:", err);
        setError(err.response?.data?.message || "Failed to fetch data.");
      }
    };

    fetchUserData();
  }, [navigate, id, editEventId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const checkForConflict = () => {
    const newMeetingStart = new Date(formData.dateTime);
    const newMeetingEnd = new Date(
      newMeetingStart.getTime() + parseInt(formData.duration) * 60 * 1000
    );

    return existingMeetings.some((meeting) => {
      if (isEditing && meeting._id === (id || editEventId)) return false;
      const existingStart = new Date(meeting.dateTime);
      const existingEnd = new Date(existingStart.getTime() + 60 * 60 * 1000);
      return (
        (newMeetingStart >= existingStart && newMeetingStart < existingEnd) ||
        (newMeetingEnd > existingStart && newMeetingEnd <= existingEnd) ||
        (newMeetingStart <= existingStart && newMeetingEnd >= existingEnd)
      );
    });
  };

  const handleSaveAvailability = async () => {
    const token = localStorage.getItem("token");

    if (!formData.dateTime) {
      alert("Please select a date and time.");
      return;
    }

    const selectedDate = new Date(formData.dateTime);
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const day = daysOfWeek[selectedDate.getDay()];
    const startTime = selectedDate.toTimeString().slice(0, 5);
    const endTime = "18:00";

    try {
      const response = await API.post(
        "/availability",
        {
          slots: [{ day, startTime, endTime }],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Availability saved:", response.data);
    } catch (error) {
      console.error("Error saving availability:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.title || formData.title.trim().length < 3) {
      setError("Event title is required and must be at least 3 characters");
      return;
    }
    if (!formData.dateTime) {
      setError("Date and time are required");
      return;
    }

    if (checkForConflict()) {
      setError("This time slot conflicts with an existing meeting.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not authenticated. Please log in again.");
        navigate("/login");
        return;
      }

      if (isEditing) {
        await API.put(
          `/meetings/${id || editEventId}`,
          {
            title: formData.title,
            dateTime: new Date(formData.dateTime).toISOString(), // Ensure ISO format
            description: formData.description,
            password: formData.password,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        navigate(`/event-link/${id || editEventId}`, { state: { userName } });
      } else {
        const response = await API.post(
          "/meetings",
          {
            title: formData.title,
            dateTime: new Date(formData.dateTime).toISOString(), // Ensure ISO format
            description: formData.description,
            link: `https://cnnct.com/meeting/${Date.now()}`,
            status: "accepted",
            category: "upcoming",
            password: formData.password,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        navigate(`/event-link/${response.data.meeting._id}`, {
          state: { userName, editEventId },
        });
      }
    } catch (err) {
      console.log("Error saving event:", err);
      setError(
        err.response?.data?.message || "Failed to save event. Please try again."
      );
    }
  };

  return (
    <div className="create-event-container">
      <div className="create-event-card">
        <h2>{isEditing ? "Edit Event" : "Add Event"}</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Event Topic *</label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Set a conference topic before it starts"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="hostName">Host name *</label>
            <input
              type="text"
              id="hostName"
              name="hostName"
              value={userName}
              disabled
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              placeholder=""
              value={formData.description}
              onChange={handleChange}
              rows="3"
            />
          </div>
          <div className="form-group">
            <label htmlFor="dateTime">Date and time *</label>
            <div className="date-time-group">
              <input
                type="datetime-local"
                id="dateTime"
                name="dateTime"
                value={formData.dateTime}
                onChange={handleChange}
                required
              />
              <select className="timezone-select">
                <option value="UTC+5:00">UTC +5:00 Delhi</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="duration">Set duration</label>
            <select
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">90 minutes</option>
            </select>
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/dashboard", { state: { userName } })}
            >
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateEventPage;