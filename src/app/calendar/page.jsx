"use client";

import { useState, useMemo } from "react";
import Layout from "@/components/Layout";
import { RequireAuth } from "@/context/AuthContext";
import Button from "@/components/Button";
import { useToast } from "@/context/ToastContext";

export default function CalendarPage() {
  const { addToast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([
    { 
      id: 1,
      date: '2025-08-10', 
      time: '10:00', 
      description: 'Property Tax Due', 
      property: '30 Tretti Way',
      notify: true 
    },
    { 
      id: 2,
      date: '2025-08-15', 
      time: '14:30', 
      description: 'Insurance Renewal', 
      property: '311 Richmond St E',
      notify: true 
    },
    { 
      id: 3,
      date: '2025-08-20', 
      time: '09:00', 
      description: 'Property Inspection', 
      property: '30 Tretti Way',
      notify: false 
    },
  ]);

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    description: '',
    property: '',
    notify: false
  });

  const properties = [
    '311 Richmond St E',
    '30 Tretti Way',
    'Maple Street Duplex',
    'Willow Apartments'
  ];

  // Get current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const firstDayWeekday = firstDayOfMonth.getDay();

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(currentYear, currentMonth, i));
    }
    
    return days;
  }, [currentYear, currentMonth, firstDayWeekday, daysInMonth]);

  // Filter events for selected date
  const selectedDateEvents = useMemo(() => {
    const selectedDateString = selectedDate.toISOString().split('T')[0];
    return events.filter(event => event.date === selectedDateString);
  }, [events, selectedDate]);

  // Check if a date has events
  const hasEvents = (date) => {
    if (!date) return false;
    const dateString = date.toISOString().split('T')[0];
    return events.some(event => event.date === dateString);
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Handle date selection
  const handleDateClick = (date) => {
    if (date) {
      setSelectedDate(date);
      setFormData(prev => ({
        ...prev,
        date: date.toISOString().split('T')[0]
      }));
    }
  };

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.date || !formData.description) {
      addToast("Please fill in the required fields.", { type: "error" });
      return;
    }

    const newEvent = {
      id: Date.now(),
      date: formData.date,
      time: formData.time,
      description: formData.description,
      property: formData.property,
      notify: formData.notify
    };

    setEvents(prev => [...prev, newEvent]);
    
    // Reset form
    setFormData({
      date: selectedDate.toISOString().split('T')[0],
      time: '',
      description: '',
      property: '',
      notify: false
    });

    addToast("Event added successfully!", { type: "success" });
  };

  // Delete event
  const deleteEvent = (eventId) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
    addToast("Event deleted.", { type: "success" });
  };

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <RequireAuth>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Calendar</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Manage your property events, reminders, and important dates.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Calendar Column - Takes up 2/3 on desktop */}
            <div className="lg:col-span-2">
              <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">
                    {monthNames[currentMonth]} {currentYear}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={goToPreviousMonth}
                      className="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5"
                      aria-label="Previous month"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={goToNextMonth}
                      className="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5"
                      aria-label="Next month"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Day headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar days */}
                  {calendarDays.map((date, index) => (
                    <div key={index} className="p-1">
                      {date ? (
                        <button
                          onClick={() => handleDateClick(date)}
                          className={`w-full h-12 rounded-md text-sm font-medium transition-colors relative ${
                            selectedDate.toDateString() === date.toDateString()
                              ? 'bg-black text-white dark:bg-white dark:text-black'
                              : 'hover:bg-black/5 dark:hover:bg-white/5'
                          }`}
                        >
                          {date.getDate()}
                          {hasEvents(date) && (
                            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full"></div>
                          )}
                        </button>
                      ) : (
                        <div className="w-full h-12"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Events Column - Takes up 1/3 on desktop */}
            <div className="space-y-6">
              {/* Add Event Form */}
              <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
                <h3 className="text-lg font-semibold mb-4">Add Event/Reminder</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleFormChange}
                      required
                      className="w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
                    />
                  </div>

                  <div>
                    <label htmlFor="time" className="block text-sm font-medium mb-1">
                      Time (Optional)
                    </label>
                    <input
                      type="time"
                      id="time"
                      name="time"
                      value={formData.time}
                      onChange={handleFormChange}
                      className="w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-1">
                      Description *
                    </label>
                    <input
                      type="text"
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      placeholder="e.g., Property Tax Due"
                      required
                      className="w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
                    />
                  </div>

                  <div>
                    <label htmlFor="property" className="block text-sm font-medium mb-1">
                      Property (Optional)
                    </label>
                    <select
                      id="property"
                      name="property"
                      value={formData.property}
                      onChange={handleFormChange}
                      className="w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
                    >
                      <option value="">Select a property</option>
                      {properties.map(property => (
                        <option key={property} value={property}>{property}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="notify"
                      name="notify"
                      checked={formData.notify}
                      onChange={handleFormChange}
                      className="rounded border-black/15 dark:border-white/15"
                    />
                    <label htmlFor="notify" className="ml-2 text-sm">
                      Notify me
                    </label>
                  </div>

                  <Button type="submit" className="w-full">
                    Add Event
                  </Button>
                </form>
              </div>

              {/* Upcoming Events */}
              <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Upcoming Events - {formatDate(selectedDate)}
                </h3>
                
                {selectedDateEvents.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No upcoming events.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {selectedDateEvents.map(event => (
                      <div key={event.id} className="flex items-start justify-between p-3 rounded-md bg-gray-50 dark:bg-gray-800">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{event.description}</div>
                          {event.time && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {event.time}
                            </div>
                          )}
                          {event.property && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {event.property}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => deleteEvent(event.id)}
                          className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                          aria-label="Delete event"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </RequireAuth>
  );
}


