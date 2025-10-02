import React, { useState, useEffect } from 'react';
import { Sword, Zap, Clock, Plus, CheckCircle, Star, Trophy, Save, RotateCcw } from 'lucide-react';

export default function App() {
  // Load saved data or use defaults
  const loadData = () => {
    try {
      const savedHero = JSON.parse(sessionStorage.getItem('heroData') || 'null');
      const savedTasks = JSON.parse(sessionStorage.getItem('tasksData') || 'null');
      
      return {
        hero: savedHero || {
          name: "The Hero",
          level: 1,
          xp: 0,
          xpToNextLevel: 100,
          gamingMinutes: 0,
          totalTasksCompleted: 0
        },
        tasks: savedTasks || [
          { id: 1, name: "Code for 30 minutes", xp: 30, coins: 30, completed: false, category: "coding" },
          { id: 2, name: "Apply to 1 job", xp: 50, coins: 45, completed: false, category: "career" },
          { id: 3, name: "Exercise 20 minutes", xp: 25, coins: 30, completed: false, category: "health" },
          { id: 4, name: "Complete a chore", xp: 15, coins: 20, completed: false, category: "life" }
        ]
      };
    } catch (error) {
      console.error('Error loading data:', error);
      return {
        hero: {
          name: "The Hero",
          level: 1,
          xp: 0,
          xpToNextLevel: 100,
          gamingMinutes: 0,
          totalTasksCompleted: 0
        },
        tasks: [
          { id: 1, name: "Code for 30 minutes", xp: 30, coins: 30, completed: false, category: "coding" },
          { id: 2, name: "Apply to 1 job", xp: 50, coins: 45, completed: false, category: "career" },
          { id: 3, name: "Exercise 20 minutes", xp: 25, coins: 30, completed: false, category: "health" },
          { id: 4, name: "Complete a chore", xp: 15, coins: 20, completed: false, category: "life" }
        ]
      };
    }
  };

  const initialData = loadData();
  const [hero, setHero] = useState(initialData.hero);
  const [tasks, setTasks] = useState(initialData.tasks);
  const [newTaskName, setNewTaskName] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  // Auto-save whenever hero or tasks change
  useEffect(() => {
    try {
      sessionStorage.setItem('heroData', JSON.stringify(hero));
      sessionStorage.setItem('tasksData', JSON.stringify(tasks));
      setSaveStatus("✓ Saved");
      const timer = setTimeout(() => setSaveStatus(""), 2000);
      return () => clearTimeout(timer);
    } catch (error) {
      console.error('Error saving data:', error);
      setSaveStatus("✗ Save failed");
    }
  }, [hero, tasks]);

  const completeTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.completed) return;

    const newXP = hero.xp + task.xp;
    const newGamingMinutes = hero.gamingMinutes + task.coins;
    let newLevel = hero.level;
    let xpForNextLevel = hero.xpToNextLevel;

    // Level up logic
    if (newXP >= hero.xpToNextLevel) {
      newLevel += 1;
      xpForNextLevel = newLevel * 100;
    }

    setHero({
      ...hero,
      xp: newXP,
      level: newLevel,
      xpToNextLevel: xpForNextLevel,
      gamingMinutes: newGamingMinutes,
      totalTasksCompleted: hero.totalTasksCompleted + 1
    });

    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, completed: true } : t
    ));

    // Reset task after 2 seconds
    setTimeout(() => {
      setTasks(prevTasks => prevTasks.map(t => 
        t.id === taskId ? { ...t, completed: false } : t
      ));
    }, 2000);
  };

  const addCustomTask = () => {
    if (!newTaskName.trim()) return;
    
    const newTask = {
      id: Date.now(),
      name: newTaskName,
      xp: 20,
      coins: 25,
      completed: false,
      category: "custom"
    };

    setTasks([...tasks, newTask]);
    setNewTaskName("");
    setShowAddTask(false);
  };

  const deleteTask = (taskId) => {
    if (window.confirm("Delete this quest?")) {
      setTasks(tasks.filter(t => t.id !== taskId));
    }
  };

  const spendGamingTime = (minutes) => {
    if (hero.gamingMinutes >= minutes) {
      setHero({ ...hero, gamingMinutes: hero.gamingMinutes - minutes });
      alert(`Enjoy your ${minutes} minutes of gaming! 🎮`);
    }
  };

  const resetProgress = () => {
    if (window.confirm("Reset all progress? This cannot be undone!")) {
      sessionStorage.removeItem('heroData');
      sessionStorage.removeItem('tasksData');
      window.location.reload();
    }
  };

  const xpPercentage = (hero.xp / hero.xpToNextLevel) * 100;

  const getCategoryColor = (category) => {
    const colors = {
      coding: "bg-blue-500",
      career: "bg-purple-500",
      health: "bg-green-500",
      life: "bg-orange-500",
      custom: "bg-pink-500"
    };
    return colors[category] || "bg-gray-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8 pt-6">
          <div className="flex items-center justify-center gap-4 mb-2">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Hero's Journey
            </h1>
            {saveStatus && (
              <span className="text-sm text-green-400 flex items-center gap-1">
                <Save className="w-4 h-4" />
                {saveStatus}
              </span>
            )}
          </div>
          <p className="text-purple-300">Complete Tasks • Earn Rewards • Control Your Gaming</p>
          <p className="text-xs text-purple-400 mt-1">Your progress is automatically saved</p>
        </div>

        {/* Comic Panel Placeholder */}
        <div className="bg-gradient-to-r from-purple-800 to-pink-800 rounded-lg p-8 mb-6 border-4 border-yellow-400 shadow-2xl">
          <div className="text-center">
            <Sword className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
            <p className="text-xl italic">
              "Every task completed brings you closer to victory. Your journey has just begun..."
            </p>
            <p className="text-sm text-purple-300 mt-2">[ Comic panel will appear here ]</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Hero Stats Panel */}
          <div className="bg-slate-800 rounded-lg p-6 shadow-xl border border-purple-500">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Star className="text-yellow-400" />
                {hero.name}
              </h2>
              <div className="text-3xl font-bold text-yellow-400">
                Lv.{hero.level}
              </div>
            </div>

            {/* XP Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-1">
                <span>XP Progress</span>
                <span>{hero.xp} / {hero.xpToNextLevel}</span>
              </div>
              <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500"
                  style={{ width: `${xpPercentage}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-gray-300">Gaming Bank</span>
                </div>
                <div className="text-2xl font-bold text-blue-400">
                  {hero.gamingMinutes} min
                </div>
              </div>
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm text-gray-300">Tasks Done</span>
                </div>
                <div className="text-2xl font-bold text-yellow-400">
                  {hero.totalTasksCompleted}
                </div>
              </div>
            </div>

            {/* Redeem Gaming Time */}
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-700 to-pink-700 rounded-lg">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <Zap className="text-yellow-400" />
                Redeem Gaming Time
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => spendGamingTime(30)}
                  disabled={hero.gamingMinutes < 30}
                  className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed py-2 px-3 rounded transition-all"
                >
                  30 min
                </button>
                <button
                  onClick={() => spendGamingTime(60)}
                  disabled={hero.gamingMinutes < 60}
                  className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed py-2 px-3 rounded transition-all"
                >
                  60 min
                </button>
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={resetProgress}
              className="w-full mt-4 bg-red-900 hover:bg-red-800 py-2 px-4 rounded text-sm flex items-center justify-center gap-2 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Progress
            </button>
          </div>

          {/* Tasks Panel */}
          <div className="bg-slate-800 rounded-lg p-6 shadow-xl border border-purple-500">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sword className="text-purple-400" />
                Quest Log
              </h2>
              <button
                onClick={() => setShowAddTask(!showAddTask)}
                className="bg-purple-600 hover:bg-purple-500 p-2 rounded-full transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Add Task Form */}
            {showAddTask && (
              <div className="mb-4 p-4 bg-slate-700 rounded-lg">
                <input
                  type="text"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  placeholder="Enter new task..."
                  className="w-full bg-slate-600 text-white px-3 py-2 rounded mb-2 outline-none focus:ring-2 focus:ring-purple-500"
                  onKeyPress={(e) => e.key === 'Enter' && addCustomTask()}
                />
                <button
                  onClick={addCustomTask}
                  className="w-full bg-purple-600 hover:bg-purple-500 py-2 rounded transition-all"
                >
                  Add Quest
                </button>
              </div>
            )}

            {/* Task List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {tasks.map(task => (
                <div
                  key={task.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    task.completed 
                      ? 'bg-green-900 border-green-500' 
                      : 'bg-slate-700 border-slate-600 hover:border-purple-500'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${getCategoryColor(task.category)}`} />
                        <h3 className={`font-semibold ${task.completed ? 'line-through text-gray-400' : ''}`}>
                          {task.name}
                        </h3>
                      </div>
                      <div className="flex gap-3 text-sm">
                        <span className="text-green-400">+{task.xp} XP</span>
                        <span className="text-blue-400">+{task.coins} min</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => completeTask(task.id)}
                        disabled={task.completed}
                        className={`p-2 rounded-full transition-all ${
                          task.completed 
                            ? 'bg-green-600' 
                            : 'bg-purple-600 hover:bg-purple-500'
                        }`}
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      {task.category === 'custom' && (
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-2 rounded-full bg-red-900 hover:bg-red-800 transition-all text-xs"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Tips */}
        <div className="mt-6 text-center text-purple-300 text-sm">
          <p>💡 Tip: Your progress saves automatically. Complete tasks to earn gaming time!</p>
        </div>

      </div>
    </div>
  );
}
