import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "../styles/AvailabilityPage.css";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

function AvailabilityPage() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("Availability");
  const [availabilitySlots, setAvailabilitySlots] = useState({
    Sun: { available: false, slots: [] },
    Mon: { available: false, slots: [] },
    Tue: { available: false, slots: [] },
    Wed: { available: false, slots: [] },
    Thu: { available: false, slots: [] },
    Fri: { available: false, slots: [] },
    Sat: { available: false, slots: [] },
  });
  const [calendarView, setCalendarView] = useState("week");
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [activity, setActivity] = useState("Event type");
  const [timeZone, setTimeZone] = useState("Indian Standard Time");
  const [userName, setUserName] = useState(null);
  const [showSignOut, setShowSignOut] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const userResponse = await API.get("/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserName(userResponse.data.user.username || "User");

        const availabilityResponse = await API.get("/availability", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const newAvailability = {
          Sun: { available: false, slots: [] },
          Mon: { available: false, slots: [] },
          Tue: { available: false, slots: [] },
          Wed: { available: false, slots: [] },
          Thu: { available: false, slots: [] },
          Fri: { available: false, slots: [] },
          Sat: { available: false, slots: [] },
        };

        if (availabilityResponse.data.slots?.length > 0) {
          availabilityResponse.data.slots.forEach((slot) => {
            if (newAvailability[slot.day]) {
              newAvailability[slot.day].slots.push({
                startTime: slot.startTime,
                endTime: slot.endTime,
              });
              newAvailability[slot.day].available = true;
            }
          });
        }

        setAvailabilitySlots(newAvailability);

        const eventsResponse = await API.get("/meetings/bookings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(eventsResponse.data.meetings || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const toggleDayAvailability = (day) => {
    setAvailabilitySlots((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        available: !prev[day].available,
        slots: !prev[day].available ? [{ startTime: "", endTime: "" }] : [],
      },
    }));
  };

  const addAvailabilitySlot = (day) => {
    setAvailabilitySlots((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: [...prev[day].slots, { startTime: "", endTime: "" }],
      },
    }));
  };

  const updateAvailabilitySlot = (day, index, field, value) => {
    const newSlots = [...availabilitySlots[day].slots];
    newSlots[index][field] = value;
    setAvailabilitySlots((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: newSlots,
      },
    }));
  };

  const removeAvailabilitySlot = (day, index) => {
    const newSlots = availabilitySlots[day].slots.filter((_, i) => i !== index);
    setAvailabilitySlots((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: newSlots,
      },
    }));
  };

  const validateSlots = (slots) => {
    for (const slot of slots) {
      if (!slot.startTime || !slot.endTime) {
        return "Start and end times are required for all slots.";
      }
      const start = moment(slot.startTime, "HH:mm");
      const end = moment(slot.endTime, "HH:mm");
      if (end.isSameOrBefore(start)) {
        return "End time must be after start time.";
      }
    }
    return null;
  };

  const saveAvailability = async () => {
    try {
      const token = localStorage.getItem("token");
      const slotsToSave = [];
      
      Object.keys(availabilitySlots).forEach((day) => {
        if (availabilitySlots[day].available) {
          availabilitySlots[day].slots.forEach((slot) => {
            if (slot.startTime && slot.endTime) {
              slotsToSave.push({
                day,
                startTime: slot.startTime,
                endTime: slot.endTime,
              });
            }
          });
        }
      });

      const validationError = validateSlots(slotsToSave);
      if (validationError) {
        setError(validationError);
        return;
      }

      await API.post(
        "/availability",
        { slots: slotsToSave },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setError("");
      alert("Availability updated successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save availability");
    }
  };

  const renderCalendarEvents = () => {
    const availabilityEvents = [];
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const currentDate = moment();
    
    // Show availability for current week and next 3 weeks
    for (let weekOffset = 0; weekOffset < 4; weekOffset++) {
      const weekStart = moment().startOf('week').add(weekOffset, 'weeks');
      
      daysOfWeek.forEach((day, dayIndex) => {
        if (availabilitySlots[day].available) {
          availabilitySlots[day].slots.forEach(slot => {
            if (slot.startTime && slot.endTime) {
              const [startHours, startMinutes] = slot.startTime.split(':').map(Number);
              const [endHours, endMinutes] = slot.endTime.split(':').map(Number);
              
              const startDate = weekStart.clone()
                .add(dayIndex, 'days')
                .set({ hour: startHours, minute: startMinutes, second: 0 })
                .toDate();
                
              const endDate = weekStart.clone()
                .add(dayIndex, 'days')
                .set({ hour: endHours, minute: endMinutes, second: 0 })
                .toDate();
              
              availabilityEvents.push({
                title: "Available",
                start: startDate,
                end: endDate,
                className: "event-available",
                allDay: false
              });
            }
          });
        }
      });
    }

    const bookedEvents = events.map((event) => {
      const date = new Date(event.dateTime);
      const status = event.status === "Accepted" ? "accepted" : "rejected";
      return {
        title: event.title,
        start: date,
        end: new Date(date.getTime() + 60 * 60 * 1000),
        className: `event-${status}`,
        allDay: false
      };
    });

    return [...availabilityEvents, ...bookedEvents];
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleSignOut = () => {
    setShowSignOut((prev) => !prev);
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="availability-container">
      <div className="sidebar">
        <div className="sidebar-logo">
          <img src="/logo.png" alt="CNNCT Logo" />
        </div>
        <nav className="sidebar-nav">
          <div className="nav-item" onClick={() => navigate("/dashboard")}>
            Events
          </div>
          <div className="nav-item" onClick={() => navigate("/booking")}>
            Booking
          </div>
          <div className="nav-item active">Availability</div>
          <div className="nav-item" onClick={() => navigate("/settings")}>
            Settings
          </div>
        </nav>
        {userName && (
          <div className="profile-badge" onClick={toggleSignOut}>
            <img src="/boy.png" alt="Profile" />
            <span>{userName}</span>
            {showSignOut && (
              <div className="signout-dropdown">
                <button onClick={handleSignOut}>Sign Out</button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="availability-content">
        <h1>Availability</h1>
        <p>Configure times when you are available for bookings</p>

        <div className="availability-tabs">
          <button
            className={activeView === "Availability" ? "active" : ""}
            onClick={() => setActiveView("Availability")}
          >
            Availability
          </button>
          <button
            className={activeView === "Calendar View" ? "active" : ""}
            onClick={() => setActiveView("Calendar View")}
          >
            Calendar View
          </button>
        </div>

        <div className="availability-controls">
          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
          >
            <option>Event type</option>
            <option>Meeting</option>
            <option>Interview</option>
          </select>
          <select
            value={timeZone}
            onChange={(e) => setTimeZone(e.target.value)}
          >
            <option>Indian Standard Time</option>
            <option>UTC</option>
            <option>Pacific Standard Time</option>
          </select>
        </div>

        {error && <p className="error-message">{error}</p>}

        {activeView === "Availability" && (
          <div className="availability-settings">
            {Object.keys(availabilitySlots).map((day) => (
              <div key={day} className="day-section">
                <div className="day-header">
                  <input
                    type="checkbox"
                    checked={availabilitySlots[day].available}
                    onChange={() => toggleDayAvailability(day)}
                  />
                  <span>{day}</span>
                  {!availabilitySlots[day].available && (
                    <span className="unavailable-label">Unavailable</span>
                  )}
                </div>
                {availabilitySlots[day].available && (
                  <div className="day-slots">
                    {availabilitySlots[day].slots.map((slot, index) => (
                      <div key={index} className="availability-slot">
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) =>
                            updateAvailabilitySlot(
                              day,
                              index,
                              "startTime",
                              e.target.value
                            )
                          }
                        />
                        <span>-</span>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) =>
                            updateAvailabilitySlot(
                              day,
                              index,
                              "endTime",
                              e.target.value
                            )
                          }
                        />
                        <button
                          className="remove-slot-btn"
                          onClick={() => removeAvailabilitySlot(day, index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      className="add-slot-btn"
                      onClick={() => addAvailabilitySlot(day)}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            ))}
            <div className="save-button-container">
              <button
                className="save-availability-btn"
                onClick={saveAvailability}
              >
                Save Availability
              </button>
            </div>
          </div>
        )}

        {activeView === "Calendar View" && (
          <div className="calendar-view">
            <div className="calendar-controls">
              <button 
                onClick={() => setCalendarView("day")}
                className={calendarView === "day" ? "active" : ""}
              >
                Day
              </button>
              <button
                onClick={() => setCalendarView("week")}
                className={calendarView === "week" ? "active" : ""}
              >
                Week
              </button>
              <button 
                onClick={() => setCalendarView("month")}
                className={calendarView === "month" ? "active" : ""}
              >
                Month
              </button>
            </div>
            <div className="calendar-container">
              <Calendar
                localizer={localizer}
                events={renderCalendarEvents()}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 600 }}
                view={calendarView}
                onView={setCalendarView}
                defaultView={calendarView}
                defaultDate={new Date()}
                min={new Date(0, 0, 0, 6, 0, 0)} // 6:00 AM
                max={new Date(0, 0, 0, 22, 0, 0)} // 10:00 PM
                step={15} // 15 minute increments
                timeslots={4} // 4 timeslots per hour
                eventPropGetter={(event) => ({
                  className: event.className,
                  style: {
                    backgroundColor: event.className === "event-available" ? "#e3fcef" : 
                                    event.className === "event-accepted" ? "#e3fcef" : "#ffebeb",
                    border: `1px solid ${
                      event.className === "event-available" ? "#abf5d1" : 
                      event.className === "event-accepted" ? "#abf5d1" : "#ffbdad"
                    }`,
                    borderRadius: '4px',
                    color: '#000',
                    opacity: 0.8
                  }
                })}
              />
            </div>
            <div className="calendar-legend">
              <div className="legend-item">
                <div className="legend-color available"></div>
                <span>Available Slots</span>
              </div>
              <div className="legend-item">
                <div className="legend-color accepted"></div>
                <span>Accepted Bookings</span>
              </div>
              <div className="legend-item">
                <div className="legend-color rejected"></div>
                <span>Rejected Bookings</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AvailabilityPage;