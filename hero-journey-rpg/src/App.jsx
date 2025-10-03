import { useState, useEffect } from 'react';
import { Sword, Zap, Clock, Plus, CheckCircle, Star, Trophy, Save, RotateCcw, Flame, Target, Award } from 'lucide-react';

export default function App() {
  // Difficulty presets
  const difficulties = {
    easy: { label: 'Easy', xp: 10, coins: 15, color: 'bg-green-500', textColor: 'text-green-400' },
    medium: { label: 'Medium', xp: 25, coins: 30, color: 'bg-yellow-500', textColor: 'text-yellow-400' },
    hard: { label: 'Hard', xp: 50, coins: 50, color: 'bg-orange-500', textColor: 'text-orange-400' },
    epic: { label: 'Epic', xp: 100, coins: 90, color: 'bg-purple-500', textColor: 'text-purple-400' }
  };

  // Check if localStorage is available
  let storageAvailable = false;
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }

  // Load saved data or use defaults
  const loadData = () => {
    const defaults = {
      hero: {
        name: "The Hero",
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        gamingMinutes: 0,
        totalTasksCompleted: 0
      },
      tasks: [
        { id: 1, name: "Code for 30 minutes", difficulty: 'medium', completed: false, category: "coding", completedToday: false },
        { id: 2, name: "Apply to 1 job", difficulty: 'hard', completed: false, category: "career", completedToday: false },
        { id: 3, name: "Exercise 20 minutes", difficulty: 'medium', completed: false, category: "health", completedToday: false },
        { id: 4, name: "Complete a chore", difficulty: 'easy', completed: false, category: "life", completedToday: false }
      ],
      streaks: {
        current: 0,
        longest: 0,
        lastCompletedDate: null,
        tasksCompletedToday: 0,
        dailyGoal: 4
      }
    };

    if (!storageAvailable) {
      return defaults;
    }

    try {
      const savedHero = localStorage.getItem('heroData');
      const savedTasks = localStorage.getItem('tasksData');
      const savedStreaks = localStorage.getItem('streakData');
      
      let loadedTasks = defaults.tasks;
      
      // Handle old task format that had xp/coins directly on tasks
      if (savedTasks) {
        const parsed = JSON.parse(savedTasks);
        loadedTasks = parsed.map(task => {
          // If task has xp/coins but no difficulty, it's old format - reset to defaults
          if ((task.xp || task.coins) && !task.difficulty) {
            return null;
          }
          return task;
        }).filter(Boolean);
        
        // If all tasks were invalid, use defaults
        if (loadedTasks.length === 0) {
          loadedTasks = defaults.tasks;
        }
      }
      
      return {
        hero: savedHero ? JSON.parse(savedHero) : defaults.hero,
        tasks: loadedTasks,
        streaks: savedStreaks ? JSON.parse(savedStreaks) : defaults.streaks
      };
    } catch (error) {
      console.error('Error loading data:', error);
      return defaults;
    }
  };

  const initialData = loadData();
  const [hero, setHero] = useState(initialData.hero);
  const [tasks, setTasks] = useState(initialData.tasks);
  const [streaks, setStreaks] = useState(initialData.streaks);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDifficulty, setNewTaskDifficulty] = useState("medium");
  const [newTaskCategory, setNewTaskCategory] = useState("custom");
  const [showAddTask, setShowAddTask] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  // Auto-save whenever hero, tasks, or streaks change
  useEffect(() => {
    if (!storageAvailable) {
      return;
    }
    
    try {
      localStorage.setItem('heroData', JSON.stringify(hero));
      localStorage.setItem('tasksData', JSON.stringify(tasks));
      localStorage.setItem('streakData', JSON.stringify(streaks));
      setSaveStatus("✓ Saved");
      const timer = setTimeout(() => setSaveStatus(""), 2000);
      return () => clearTimeout(timer);
    } catch (error) {
      console.error('Error saving data:', error);
      setSaveStatus("✗ Save failed");
    }
  }, [hero, tasks, streaks, storageAvailable]);

  // Check for daily reset
  useEffect(() => {
    const checkDailyReset = () => {
      const today = new Date().toDateString();
      const lastDate = streaks.lastCompletedDate;
      
      if (lastDate && lastDate !== today) {
        // Reset daily completions
        setTasks(prevTasks => prevTasks.map(t => ({ ...t, completedToday: false })));
        
        // Check if streak should break
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastDate !== yesterday.toDateString()) {
          setStreaks(prev => ({ ...prev, current: 0, tasksCompletedToday: 0 }));
        } else {
          setStreaks(prev => ({ ...prev, tasksCompletedToday: 0 }));
        }
      }
    };
    
    checkDailyReset();
  }, [streaks.lastCompletedDate]);

  const completeTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.completed) return;

    const diff = difficulties[task.difficulty];
    if (!diff) {
      console.error('Invalid difficulty for task:', task);
      return;
    }

    let xpReward = diff.xp;
    let coinsReward = diff.coins;

    // Streak bonus
    const streakBonus = Math.floor(streaks.current * 0.1); // 10% bonus per streak day
    xpReward = Math.floor(xpReward * (1 + streakBonus));
    coinsReward = Math.floor(coinsReward * (1 + streakBonus));

    const newXP = hero.xp + xpReward;
    const newGamingMinutes = hero.gamingMinutes + coinsReward;
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

    // Update task completion
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, completed: true, completedToday: true } : t
    ));

    // Update streaks
    const newTasksToday = streaks.tasksCompletedToday + 1;
    const today = new Date().toDateString();
    
    let newStreak = streaks.current;
    if (newTasksToday >= streaks.dailyGoal && streaks.lastCompletedDate !== today) {
      newStreak = streaks.current + 1;
    }

    setStreaks({
      ...streaks,
      current: newStreak,
      longest: Math.max(newStreak, streaks.longest),
      lastCompletedDate: today,
      tasksCompletedToday: newTasksToday
    });

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
      difficulty: newTaskDifficulty,
      completed: false,
      category: newTaskCategory,
      completedToday: false
    };

    setTasks([...tasks, newTask]);
    setNewTaskName("");
    setNewTaskDifficulty("medium");
    setNewTaskCategory("custom");
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
      if (storageAvailable) {
        localStorage.removeItem('heroData');
        localStorage.removeItem('tasksData');
        localStorage.removeItem('streakData');
      }
      window.location.reload();
    }
  };

  const xpPercentage = (hero.xp / hero.xpToNextLevel) * 100;
  const dailyProgress = (streaks.tasksCompletedToday / streaks.dailyGoal) * 100;

  const getCategoryColor = (category) => {
    const colors = {
      coding: "bg-blue-500",
      career: "bg-purple-500",
      health: "bg-green-500",
      life: "bg-orange-500",
      learning: "bg-pink-500",
      custom: "bg-gray-500"
    };
    return colors[category] || "bg-gray-500";
  };

  const getCategoryStats = () => {
    const stats = {};
    tasks.forEach(task => {
      if (!stats[task.category]) {
        stats[task.category] = { completed: 0, total: 0 };
      }
      stats[task.category].total++;
      if (task.completedToday) {
        stats[task.category].completed++;
      }
    });
    return stats;
  };

  const categoryStats = getCategoryStats();

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
          <p className="text-purple-300">Complete Tasks • Earn Rewards • Build Streaks • Control Your Gaming</p>
          {!storageAvailable && (
            <p className="text-xs text-yellow-400 mt-2">⚠️ Storage unavailable - progress won't save in this environment</p>
          )}
        </div>

        {/* Streak Banner */}
        <div className="bg-gradient-to-r from-orange-800 to-red-800 rounded-lg p-4 mb-6 border-2 border-orange-400">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Flame className="w-10 h-10 text-orange-400" />
              <div>
                <div className="text-2xl font-bold">{streaks.current} Day Streak! 🔥</div>
                <div className="text-sm text-orange-200">Longest: {streaks.longest} days</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-orange-200 mb-1">Daily Progress</div>
              <div className="text-xl font-bold">{streaks.tasksCompletedToday} / {streaks.dailyGoal} tasks</div>
              <div className="w-32 h-2 bg-orange-900 rounded-full mt-2">
                <div 
                  className="h-full bg-orange-400 rounded-full transition-all"
                  style={{ width: `${Math.min(dailyProgress, 100)}%` }}
                />
              </div>
            </div>
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
            <div className="grid grid-cols-2 gap-4 mb-4">
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

            {/* Category Progress */}
            <div className="bg-slate-700 rounded-lg p-4 mb-4">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" />
                Category Progress (Today)
              </h3>
              <div className="space-y-2 text-sm">
                {Object.entries(categoryStats).map(([category, stats]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getCategoryColor(category)}`} />
                      <span className="capitalize">{category}</span>
                    </div>
                    <span className="text-gray-400">{stats.completed}/{stats.total}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Redeem Gaming Time */}
            <div className="p-4 bg-gradient-to-r from-purple-700 to-pink-700 rounded-lg mb-4">
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
              className="w-full bg-red-900 hover:bg-red-800 py-2 px-4 rounded text-sm flex items-center justify-center gap-2 transition-all"
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
                
                {/* Difficulty Select */}
                <select
                  value={newTaskDifficulty}
                  onChange={(e) => setNewTaskDifficulty(e.target.value)}
                  className="w-full bg-slate-600 text-white px-3 py-2 rounded mb-2 outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {Object.entries(difficulties).map(([key, diff]) => (
                    <option key={key} value={key}>
                      {diff.label} (+{diff.xp} XP, +{diff.coins} min)
                    </option>
                  ))}
                </select>

                {/* Category Select */}
                <select
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value)}
                  className="w-full bg-slate-600 text-white px-3 py-2 rounded mb-2 outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="coding">Coding</option>
                  <option value="career">Career</option>
                  <option value="health">Health</option>
                  <option value="life">Life</option>
                  <option value="learning">Learning</option>
                  <option value="custom">Custom</option>
                </select>

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
              {tasks.map(task => {
                const diff = difficulties[task.difficulty] || difficulties.medium;
                return (
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
                          <span className={`text-xs px-2 py-0.5 rounded ${diff.color} text-white`}>
                            {diff.label}
                          </span>
                          {task.completedToday && !task.completed && (
                            <Award className="w-4 h-4 text-green-400" title="Completed today!" />
                          )}
                        </div>
                        <div className="flex gap-3 text-sm">
                          <span className="text-green-400">+{diff.xp} XP</span>
                          <span className="text-blue-400">+{diff.coins} min</span>
                          {streaks.current > 0 && (
                            <span className="text-orange-400">+{Math.floor(streaks.current * 10)}% streak bonus</span>
                          )}
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
                        {(task.category === 'custom' || task.id > 10) && (
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
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer Tips */}
        <div className="mt-6 text-center text-purple-300 text-sm">
          <p>💡 Complete {streaks.dailyGoal} tasks daily to maintain your streak! Higher streaks = bigger rewards!</p>
        </div>

      </div>
    </div>
  );
}