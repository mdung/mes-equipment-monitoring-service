import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import api from '../../services/api';
import Modal from '../Modal';
import Toast from '../Toast';

function MaintenanceCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchSchedules();
    fetchTasks();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await api.get('/maintenance/schedules');
      setSchedules(response.data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await api.get('/maintenance/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getTasksForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task => {
      const taskDate = new Date(task.scheduledDate).toISOString().split('T')[0];
      return taskDate === dateStr;
    });
  };

  const getSchedulesForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.nextMaintenanceDate).toISOString().split('T')[0];
      return scheduleDate === dateStr;
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="bg-white rounded-lg shadow">
        {/* Calendar Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">{monthName}</h2>
          <div className="flex gap-2">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-4">
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
            {days.map((date, index) => {
              const dayTasks = date ? getTasksForDate(date) : [];
              const daySchedules = date ? getSchedulesForDate(date) : [];
              const isToday = date && date.toDateString() === new Date().toDateString();

              return (
                <div
                  key={index}
                  className={`
                    min-h-24 p-2 border rounded
                    ${date ? 'bg-white hover:bg-gray-50 cursor-pointer' : 'bg-gray-50'}
                    ${isToday ? 'border-blue-500 border-2' : 'border-gray-200'}
                  `}
                  onClick={() => date && setSelectedDate(date)}
                >
                  {date && (
                    <>
                      <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                        {date.getDate()}
                      </div>
                      <div className="mt-1 space-y-1">
                        {dayTasks.slice(0, 2).map(task => (
                          <div
                            key={task.id}
                            className={`text-xs p-1 rounded border ${getPriorityColor(task.priority)}`}
                          >
                            {task.taskTitle.substring(0, 15)}...
                          </div>
                        ))}
                        {daySchedules.slice(0, 1).map(schedule => (
                          <div
                            key={schedule.id}
                            className="text-xs p-1 rounded bg-purple-100 text-purple-800 border border-purple-300"
                          >
                            {schedule.scheduleName.substring(0, 15)}...
                          </div>
                        ))}
                        {(dayTasks.length + daySchedules.length) > 3 && (
                          <div className="text-xs text-gray-500">
                            +{dayTasks.length + daySchedules.length - 3} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Date Details Modal */}
      {selectedDate && (
        <Modal
          isOpen={!!selectedDate}
          onClose={() => setSelectedDate(null)}
          title={`Maintenance for ${selectedDate.toLocaleDateString()}`}
        >
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Scheduled Tasks</h3>
              {getTasksForDate(selectedDate).length > 0 ? (
                <div className="space-y-2">
                  {getTasksForDate(selectedDate).map(task => (
                    <div key={task.id} className="p-3 border rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{task.taskTitle}</div>
                          <div className="text-sm text-gray-600">{task.equipmentName}</div>
                          <div className="text-sm text-gray-500 mt-1">{task.description}</div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No tasks scheduled</p>
              )}
            </div>

            <div>
              <h3 className="font-semibold mb-2">Preventive Maintenance</h3>
              {getSchedulesForDate(selectedDate).length > 0 ? (
                <div className="space-y-2">
                  {getSchedulesForDate(selectedDate).map(schedule => (
                    <div key={schedule.id} className="p-3 border rounded bg-purple-50">
                      <div className="font-medium">{schedule.scheduleName}</div>
                      <div className="text-sm text-gray-600">{schedule.equipmentName}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        Frequency: {schedule.frequency} - Every {schedule.frequencyValue} {schedule.frequency.toLowerCase()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No preventive maintenance scheduled</p>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default MaintenanceCalendar;
