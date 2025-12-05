import React, { useState, useEffect, useRef } from 'react';
import { Clock, Play, Pause, ZoomIn, ZoomOut, Calendar } from 'lucide-react';
import { format, addDays, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';

const InteractiveTimeline = ({ events = [], startDate, endDate, onEventClick }) => {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(startDate || new Date());
  const [zoom, setZoom] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [timeRange, setTimeRange] = useState(7); // days
  const timelineRef = useRef(null);
  const playIntervalRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setCurrentDate(prev => {
          const next = addDays(prev, 1);
          if (endDate && next > endDate) {
            setIsPlaying(false);
            return prev;
          }
          return next;
        });
      }, 1000);
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, endDate]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3));
    setTimeRange(prev => Math.max(prev - 1, 1));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
    setTimeRange(prev => Math.min(prev + 1, 30));
  };

  const handlePrevious = () => {
    setCurrentDate(prev => subDays(prev, timeRange));
  };

  const handleNext = () => {
    setCurrentDate(prev => addDays(prev, timeRange));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getEventsInRange = () => {
    const rangeStart = subDays(currentDate, Math.floor(timeRange / 2));
    const rangeEnd = addDays(currentDate, Math.floor(timeRange / 2));
    
    return events.filter(event => {
      const eventDate = new Date(event.timestamp || event.date);
      return isWithinInterval(eventDate, { start: rangeStart, end: rangeEnd });
    });
  };

  const getEventPosition = (event) => {
    const rangeStart = subDays(currentDate, Math.floor(timeRange / 2));
    const eventDate = new Date(event.timestamp || event.date);
    const daysDiff = Math.floor((eventDate - rangeStart) / (1000 * 60 * 60 * 24));
    return (daysDiff / timeRange) * 100;
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'PRODUCTION': return 'bg-accent';
      case 'MAINTENANCE': return 'bg-warning';
      case 'ALERT': return 'bg-danger';
      case 'QUALITY': return 'bg-success';
      default: return 'bg-secondary';
    }
  };

  const visibleEvents = getEventsInRange();
  const rangeStart = subDays(currentDate, Math.floor(timeRange / 2));
  const rangeEnd = addDays(currentDate, Math.floor(timeRange / 2));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg dark:text-slate-200 flex items-center gap-2">
          <Clock size={20} />
          Interactive Timeline
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-2 border dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <ZoomOut size={18} />
          </button>
          <span className="text-sm text-secondary dark:text-slate-400 min-w-[60px] text-center">
            {timeRange} days
          </span>
          <button
            onClick={handleZoomIn}
            className="p-2 border dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <ZoomIn size={18} />
          </button>
        </div>
      </div>

      {/* Timeline Controls */}
      <div className="flex items-center gap-2 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border dark:border-slate-700">
        <button
          onClick={handlePrevious}
          className="p-2 border dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          ←
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2 border dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button
          onClick={handleToday}
          className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/90"
        >
          Today
        </button>
        <button
          onClick={handleNext}
          className="p-2 border dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          →
        </button>
        <div className="flex-1 text-center">
          <div className="text-sm font-medium dark:text-slate-200">
            {format(rangeStart, 'MMM d')} - {format(rangeEnd, 'MMM d, yyyy')}
          </div>
          <div className="text-xs text-secondary dark:text-slate-400">
            Current: {format(currentDate, 'MMM d, yyyy')}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div
        ref={timelineRef}
        className="relative bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 p-4"
        style={{ minHeight: '200px' }}
      >
        {/* Time Scale */}
        <div className="flex justify-between mb-4 text-xs text-secondary dark:text-slate-400 border-b dark:border-slate-700 pb-2">
          {Array.from({ length: Math.min(timeRange, 10) }, (_, i) => {
            const date = addDays(rangeStart, Math.floor((i / Math.min(timeRange, 10)) * timeRange));
            return (
              <div key={i} className="text-center">
                {format(date, 'MMM d')}
              </div>
            );
          })}
        </div>

        {/* Events */}
        <div className="relative" style={{ height: '150px' }}>
          {visibleEvents.map((event, index) => {
            const position = getEventPosition(event);
            return (
              <div
                key={event.id || index}
                className={`absolute top-4 ${getEventColor(event.type || 'OTHER')} text-white text-xs px-2 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity`}
                style={{
                  left: `${position}%`,
                  transform: 'translateX(-50%)',
                  zIndex: selectedEvent?.id === event.id ? 10 : 1,
                }}
                onClick={() => {
                  setSelectedEvent(event);
                  if (onEventClick) onEventClick(event);
                }}
                title={`${event.title || event.type}\n${format(new Date(event.timestamp || event.date), 'PPp')}`}
              >
                <div className="font-semibold truncate max-w-[120px]">
                  {event.title || event.type}
                </div>
                <div className="text-xs opacity-90">
                  {format(new Date(event.timestamp || event.date), 'HH:mm')}
                </div>
              </div>
            );
          })}

          {/* Current Date Indicator */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-accent z-20"
            style={{ left: '50%' }}
          >
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-accent"></div>
          </div>
        </div>

        {/* Event Legend */}
        <div className="flex gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-accent rounded"></div>
            <span className="text-secondary dark:text-slate-400">Production</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-warning rounded"></div>
            <span className="text-secondary dark:text-slate-400">Maintenance</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-danger rounded"></div>
            <span className="text-secondary dark:text-slate-400">Alert</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-success rounded"></div>
            <span className="text-secondary dark:text-slate-400">Quality</span>
          </div>
        </div>
      </div>

      {/* Selected Event Details */}
      {selectedEvent && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border dark:border-slate-700">
          <h4 className="font-semibold mb-2 dark:text-slate-200">{selectedEvent.title || selectedEvent.type}</h4>
          <div className="space-y-1 text-sm">
            <div>
              <span className="text-secondary dark:text-slate-400">Date: </span>
              <span className="dark:text-slate-200">
                {format(new Date(selectedEvent.timestamp || selectedEvent.date), 'PPp')}
              </span>
            </div>
            {selectedEvent.description && (
              <div>
                <span className="text-secondary dark:text-slate-400">Description: </span>
                <span className="dark:text-slate-200">{selectedEvent.description}</span>
              </div>
            )}
            {selectedEvent.equipmentName && (
              <div>
                <span className="text-secondary dark:text-slate-400">Equipment: </span>
                <span className="dark:text-slate-200">{selectedEvent.equipmentName}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveTimeline;

