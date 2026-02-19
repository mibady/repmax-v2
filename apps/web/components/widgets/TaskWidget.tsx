'use client';

import { useState } from 'react';

interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  completed: boolean;
}

interface TaskWidgetProps {
  tasks?: Task[];
  onAddTask?: (title: string) => void;
}

export default function TaskWidget({ tasks: initialTasks = [], onAddTask }: TaskWidgetProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTask, setNewTask] = useState('');

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const getPriorityStyles = (priority: string, completed: boolean) => {
    if (completed) {
      return { dot: 'bg-white/50', label: 'Done', labelColor: 'text-gray-500' };
    }
    switch (priority) {
      case 'high':
        return { dot: 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.4)]', label: 'High', labelColor: 'text-gray-400' };
      case 'medium':
        return { dot: 'bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.4)]', label: 'Med', labelColor: 'text-gray-400' };
      default:
        return { dot: 'bg-white shadow-[0_0_6px_rgba(255,255,255,0.4)]', label: 'Low', labelColor: 'text-gray-400' };
    }
  };

  const activeTasks = tasks.filter(t => !t.completed).length;

  return (
    <div className="w-[280px] flex flex-col gap-4">
      {/* Widget Card */}
      <div className="flex flex-col w-full bg-[#1F1F22] rounded-xl border border-[#333238] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#333238]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#D4AF37]" style={{ fontSize: '20px' }}>assignment</span>
            <h2 className="text-sm font-semibold tracking-wide text-white">Tasks</h2>
            <span className="flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-[#333238] text-[10px] font-bold text-gray-300">
              {activeTasks}
            </span>
          </div>
          <button
            onClick={() => onAddTask?.("New task")}
            className="text-xs font-medium text-[#D4AF37] hover:text-[#e5c14d] transition-colors duration-200 flex items-center gap-0.5"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span>
            Add
          </button>
        </div>

        {/* Task List */}
        <div className="flex flex-col max-h-[400px] overflow-y-auto">
          {tasks.length === 0 && (
            <div className="p-6 text-center">
              <p className="text-gray-500 text-xs">No tasks</p>
            </div>
          )}
          {tasks.map((task) => {
            const styles = getPriorityStyles(task.priority, task.completed);
            return (
              <div
                key={task.id}
                className="group flex items-start gap-3 p-3 hover:bg-[#2a2a2e] transition-colors border-b border-[#2a2a2e]/50 cursor-pointer"
              >
                <div className="mt-0.5 relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="peer h-4 w-4 appearance-none rounded-sm border border-[#4a4a50] bg-transparent checked:border-[#D4AF37] checked:bg-[#D4AF37] focus:ring-0 focus:ring-offset-0 hover:border-[#D4AF37] transition-all cursor-pointer"
                  />
                  <span
                    className="material-symbols-outlined absolute text-black opacity-0 peer-checked:opacity-100 pointer-events-none"
                    style={{ fontSize: '12px', fontWeight: 800 }}
                  >
                    check
                  </span>
                </div>
                <div className={`flex flex-col gap-1 w-full ${task.completed ? 'opacity-50 group-hover:opacity-75 transition-opacity' : ''}`}>
                  <p className={`text-[13px] leading-tight group-hover:text-white font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-gray-100'}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${styles.dot}`}></div>
                      <span className={`text-[10px] font-medium ${styles.labelColor}`}>{styles.label}</span>
                    </div>
                    <span className={`text-[10px] font-mono ${task.priority === 'high' && !task.completed ? 'text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded' : 'text-gray-500'}`}>
                      {task.dueDate}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer: Add Task Input */}
        <div className="p-3 border-t border-[#333238] bg-[#252529]">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-2 text-gray-500" style={{ fontSize: '16px' }}>add_circle</span>
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a task..."
              className="w-full bg-[#1A1A1D] text-xs text-white placeholder-gray-500 rounded border border-[#333238] pl-8 pr-3 py-2 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 transition-all placeholder:font-normal"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
