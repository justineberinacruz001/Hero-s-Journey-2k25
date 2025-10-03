import { useState, useEffect } from 'react';
import { Sword, Zap, Clock, Plus, CheckCircle, Star, Trophy, Save, RotateCcw, Flame, Target, Award, Play, Pause, StopCircle, AlertTriangle, Skull } from 'lucide-react';

export default function App() {
  // Difficulty presets
  const difficulties = {
    easy: { label: 'Easy', xp: 10, coins: 15, color: 'bg-green-500', textColor: 'text-green-400' },
    medium: { label: 'Medium', xp: 25, coins: 30, color: 'bg-yellow-500', textColor: 'text-yellow-400' },
    hard: { label: 'Hard', xp: 50, coins: 50, color: 'bg-orange-500', textColor: 'text-orange-400' },
    epic: { label: 'Epic', xp: 100, coins: 90, color: 'bg-purple-500', textColor: 'text-purple-400' }
  };

  // Calculate XP needed for a specific level (x1.25 scaling)
  const calculateXPForLevel = (level) => {
    return Math.floor(100 * Math.pow(1.25, level - 1));
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
        xpToNextLevel: 100, // Level 1 requires 100 XP
        gamingMinutes: 0,
        totalTasksCompleted: 0,
        isWeakened: false,
        weaknessLevel: 0
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
      },
      gamingSession: {
        isActive: false,
        remainingSeconds: 0,
        totalSeconds: 0,
        isPaused: false,
        startTime: null,
        totalGamingToday: 0
      }
    };

    if (!storageAvailable) {
      return defaults;
    }

    try {
      const savedHero = localStorage.getItem('heroData');
      const savedTasks = localStorage.getItem('tasksData');
      const savedStreaks = localStorage.getItem('streakData');
      const savedSession = localStorage.getItem('gamingSession');
      
      let loadedTasks = defaults.tasks;
      
      if (savedTasks) {
        const parsed = JSON.parse(savedTasks);
        loadedTasks = parsed.map(task => {
          if ((task.xp || task.coins) && !task.difficulty) {
            return null;
          }
          return task;
        }).filter(Boolean);
        
        if (loadedTasks.length === 0) {
          loadedTasks = defaults.tasks;
        }
      }
      
      return {
        hero: savedHero ? { ...defaults.hero, ...JSON.parse(savedHero) } : defaults.hero,
        tasks: loadedTasks,
        streaks: savedStreaks ? JSON.parse(savedStreaks) : defaults.streaks,
        gamingSession: savedSession ? JSON.parse(savedSession) : defaults.gamingSession
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
  const [gamingSession, setGamingSession] = useState(initialData.gamingSession);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDifficulty, setNewTaskDifficulty] = useState("medium");
  const [newTaskCategory, setNewTaskCategory] = useState("custom");
  const [showAddTask, setShowAddTask] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [customMinutes, setCustomMinutes] = useState(30);
  const [showCustomTime, setShowCustomTime] = useState(false);

  // Gaming timer countdown
  useEffect(() => {
    if (!gamingSession.isActive || gamingSession.isPaused) return;

    const interval = setInterval(() => {
      setGamingSession(prev => {
        const newRemaining = prev.remainingSeconds - 1;

        // Time warning at 5 minutes
        if (newRemaining === 300) {
          alert("⚠️ 5 minutes of gaming time remaining!");
        }

        // Time warning at 1 minute
        if (newRemaining === 60) {
          alert("⚠️ 1 minute of gaming time remaining!");
        }

        // Time's up!
        if (newRemaining <= 0) {
          alert("⏰ Gaming time is up! Your hero needs rest.");
          return {
            ...prev,
            isActive: false,
            remainingSeconds: 0,
            isPaused: false
          };
        }

        return {
          ...prev,
          remainingSeconds: newRemaining
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gamingSession.isActive, gamingSession.isPaused]);

  // Auto-save whenever state changes
  useEffect(() => {
    if (!storageAvailable) return;
    
    try {
      localStorage.setItem('heroData', JSON.stringify(hero));
      localStorage.setItem('tasksData', JSON.stringify(tasks));
      localStorage.setItem('streakData', JSON.stringify(streaks));
      localStorage.setItem('gamingSession', JSON.stringify(gamingSession));
      setSaveStatus("✓ Saved");
      const timer = setTimeout(() => setSaveStatus(""), 2000);
      return () => clearTimeout(timer);
    } catch (error) {
      console.error('Error saving data:', error);
      setSaveStatus("✗ Save failed");
    }
  }, [hero, tasks, streaks, gamingSession, storageAvailable]);

  // Check for daily reset
  useEffect(() => {
    const checkDailyReset = () => {
      const today = new Date().toDateString();
      const lastDate = streaks.lastCompletedDate;
      
      if (lastDate && lastDate !== today) {
        setTasks(prevTasks => prevTasks.map(t => ({ ...t, completedToday: false })));
        setGamingSession(prev => ({ ...prev, totalGamingToday: 0 }));
        
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
    const streakBonus = Math.floor(streaks.current * 0.1);
    xpReward = Math.floor(xpReward * (1 + streakBonus));
    coinsReward = Math.floor(coinsReward * (1 + streakBonus));

    // Reduce weakness if hero is weakened
    let newWeaknessLevel = hero.weaknessLevel;
    let newIsWeakened = hero.isWeakened;
    if (hero.isWeakened) {
      newWeaknessLevel = Math.max(0, hero.weaknessLevel - 1);
      if (newWeaknessLevel === 0) {
        newIsWeakened = false;
        alert("Your hero has recovered from weakness!");
      }
    }

    let newXP = hero.xp + xpReward;
    let newLevel = hero.level;
    let newXPForNextLevel = hero.xpToNextLevel;

    // Check for level up (with proper XP reset)
    while (newXP >= newXPForNextLevel) {
      newXP -= newXPForNextLevel; // Reset XP to overflow amount
      newLevel += 1;
      newXPForNextLevel = calculateXPForLevel(newLevel);
      alert(`Level Up! You are now Level ${newLevel}!`);
    }

    const newGamingMinutes = hero.gamingMinutes + coinsReward;

    setHero({
      ...hero,
      xp: newXP,
      level: newLevel,
      xpToNextLevel: newXPForNextLevel,
      gamingMinutes: newGamingMinutes,
      totalTasksCompleted: hero.totalTasksCompleted + 1,
      isWeakened: newIsWeakened,
      weaknessLevel: newWeaknessLevel
    });

    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, completed: true, completedToday: true } : t
    ));

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

    setTimeout(() => {
      setTasks(prevTasks => prevTasks.map(t => 
        t.id === taskId ? { ...t, completed: false } : t
      ));
    }, 2000);
  };

  const startGamingSession = (minutes) => {
    if (hero.gamingMinutes < minutes) {
      alert("Not enough gaming minutes! Complete more tasks first.");
      return;
    }

    setHero({ ...hero, gamingMinutes: hero.gamingMinutes - minutes });
    setGamingSession({
      isActive: true,
      remainingSeconds: minutes * 60,
      totalSeconds: minutes * 60,
      isPaused: false,
      startTime: new Date().toISOString(),
      totalGamingToday: gamingSession.totalGamingToday + minutes
    });
    setShowCustomTime(false);
  };

  const pauseGamingSession = () => {
    setGamingSession(prev => ({ ...prev, isPaused: true }));
  };

  const resumeGamingSession = () => {
    setGamingSession(prev => ({ ...prev, isPaused: false }));
  };

  const endGamingSession = () => {
    if (window.confirm("End gaming session early? Unused time will be returned.")) {
      const minutesUsed = Math.ceil((gamingSession.totalSeconds - gamingSession.remainingSeconds) / 60);
      const minutesUnused = Math.floor(gamingSession.remainingSeconds / 60);
      
      setHero(prev => ({ ...prev, gamingMinutes: prev.gamingMinutes + minutesUnused }));
      setGamingSession({
        isActive: false,
        remainingSeconds: 0,
        totalSeconds: 0,
        isPaused: false,
        startTime: null,
        totalGamingToday: gamingSession.totalGamingToday - minutesUnused
      });
    }
  };

  const reportUnauthorizedGaming = (minutes) => {
    if (!window.confirm(`Report ${minutes} minutes of unauthorized gaming? This will severely punish your hero.`)) {
      return;
    }

    const xpPenalty = minutes * 5; // Lose 5 XP per minute
    const timePenalty = Math.floor(minutes * 1.2); // Lose 1.2x time from bank
    
    let newXP = hero.xp - xpPenalty;
    let newLevel = hero.level;
    let newXPForNextLevel = hero.xpToNextLevel;

    // Handle level demotion if XP goes negative
    while (newXP < 0 && newLevel > 1) {
      newLevel -= 1;
      newXPForNextLevel = calculateXPForLevel(newLevel);
      newXP += newXPForNextLevel; // Add previous level's max XP
    }

    // If still negative at level 1, set to 0
    if (newXP < 0) {
      newXP = 0;
    }

    const newGamingMinutes = Math.max(0, hero.gamingMinutes - timePenalty);
    const newWeaknessLevel = hero.weaknessLevel + Math.ceil(minutes / 30);

    setHero({
      ...hero,
      xp: newXP,
      level: newLevel,
      xpToNextLevel: newXPForNextLevel,
      gamingMinutes: newGamingMinutes,
      isWeakened: true,
      weaknessLevel: newWeaknessLevel
    });

    let message = `⚠️ Penalty Applied:\n`;
    message += `- Lost ${xpPenalty} XP\n`;
    message += `- Lost ${timePenalty} minutes from gaming bank\n`;
    message += `- Weakness increased to level ${newWeaknessLevel}`;
    
    if (hero.level !== newLevel) {
      message += `\n- DEMOTED to Level ${newLevel}!`;
    }

    alert(message);
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

  const resetProgress = () => {
    if (window.confirm("Reset all progress? This cannot be undone!")) {
      if (storageAvailable) {
        localStorage.removeItem('heroData');
        localStorage.removeItem('tasksData');
        localStorage.removeItem('streakData');
        localStorage.removeItem('gamingSession');
      }
      window.location.reload();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const xpPercentage = (hero.xp / hero.xpToNextLevel) * 100;
  const dailyProgress = (streaks.tasksCompletedToday / streaks.dailyGoal) * 100;
  const timerPercentage = gamingSession.totalSeconds > 0 
    ? (gamingSession.remainingSeconds / gamingSession.totalSeconds) * 100 
    : 0;

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
          <p className="text-purple-300">Complete Tasks • Earn Rewards • Control Your Gaming</p>
        </div>

        {/* Active Gaming Timer */}
        {gamingSession.isActive && (
          <div className="bg-gradient-to-r from-red-900 to-orange-900 rounded-lg p-6 mb-6 border-4 border-red-500 shadow-2xl animate-pulse">
            <div className="text-center mb-4">
              <h2 className="text-3xl font-bold mb-2">🎮 GAMING SESSION ACTIVE</h2>
              <div className="text-6xl font-mono font-bold text-yellow-400 mb-4">
                {formatTime(gamingSession.remainingSeconds)}
              </div>
              <div className="h-6 bg-red-950 rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 transition-all duration-1000"
                  style={{ width: `${timerPercentage}%` }}
                />
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              {!gamingSession.isPaused ? (
                <button
                  onClick={pauseGamingSession}
                  className="bg-yellow-600 hover:bg-yellow-500 px-6 py-3 rounded-lg font-bold flex items-center gap-2"
                >
                  <Pause className="w-5 h-5" />
                  Pause
                </button>
              ) : (
                <button
                  onClick={resumeGamingSession}
                  className="bg-green-600 hover:bg-green-500 px-6 py-3 rounded-lg font-bold flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Resume
                </button>
              )}
              <button
                onClick={endGamingSession}
                className="bg-red-600 hover:bg-red-500 px-6 py-3 rounded-lg font-bold flex items-center gap-2"
              >
                <StopCircle className="w-5 h-5" />
                End Session
              </button>
            </div>
          </div>
        )}

        {/* Weakness Warning */}
        {hero.isWeakened && (
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-4 mb-6 border-2 border-gray-600">
            <div className="flex items-center gap-3">
              <Skull className="w-8 h-8 text-red-400" />
              <div className="flex-1">
                <div className="font-bold text-red-400">⚠️ Hero is Weakened!</div>
                <div className="text-sm text-gray-400">
                  Weakness Level: {hero.weaknessLevel} | Complete {hero.weaknessLevel} task(s) to recover
                </div>
              </div>
            </div>
          </div>
        )}

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
                {hero.isWeakened && <Skull className="w-6 h-6 text-red-400" />}
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
              <div className="text-xs text-gray-400 mt-1 text-right">
                Next level: {calculateXPForLevel(hero.level + 1)} XP required
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
            {!gamingSession.isActive && (
              <div className="p-4 bg-gradient-to-r from-purple-700 to-pink-700 rounded-lg mb-4">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <Zap className="text-yellow-400" />
                  Start Gaming Session
                </h3>
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => startGamingSession(30)}
                    disabled={hero.gamingMinutes < 30}
                    className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed py-2 px-3 rounded transition-all"
                  >
                    30 min
                  </button>
                  <button
                    onClick={() => startGamingSession(60)}
                    disabled={hero.gamingMinutes < 60}
                    className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed py-2 px-3 rounded transition-all"
                  >
                    60 min
                  </button>
                  <button
                    onClick={() => setShowCustomTime(!showCustomTime)}
                    className="bg-purple-600 hover:bg-purple-500 py-2 px-3 rounded transition-all"
                  >
                    Custom
                  </button>
                </div>
                {showCustomTime && (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      max={hero.gamingMinutes}
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(parseInt(e.target.value) || 1)}
                      className="flex-1 bg-slate-600 text-white px-3 py-2 rounded outline-none"
                    />
                    <button
                      onClick={() => startGamingSession(customMinutes)}
                      disabled={hero.gamingMinutes < customMinutes}
                      className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 py-2 px-4 rounded transition-all"
                    >
                      Start
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Report Unauthorized Gaming */}
            <div className="p-4 bg-red-900 rounded-lg mb-4">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <AlertTriangle className="text-yellow-400" />
                Honesty Check
              </h3>
              <p className="text-sm text-red-200 mb-2">Gamed without earning time?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => reportUnauthorizedGaming(30)}
                  className="flex-1 bg-red-700 hover:bg-red-600 py-2 px-3 rounded text-sm transition-all"
                >
                  Report 30m
                </button>
                <button
                  onClick={() => reportUnauthorizedGaming(60)}
                  className="flex-1 bg-red-700 hover:bg-red-600 py-2 px-3 rounded text-sm transition-all"
                >
                  Report 60m
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

        {/* Footer Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4 text-center text-sm">
          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
            <div className="text-gray-400">Gaming Today</div>
            <div className="text-xl font-bold text-blue-400">{gamingSession.totalGamingToday} min</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
            <div className="text-gray-400">Daily Goal</div>
            <div className="text-xl font-bold text-purple-400">{streaks.tasksCompletedToday}/{streaks.dailyGoal}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
            <div className="text-gray-400">Hero Status</div>
            <div className="text-xl font-bold text-yellow-400">
              {hero.isWeakened ? "Weakened" : "Strong"}
            </div>
          </div>
        </div>

        {/* Footer Tips */}
        <div className="mt-6 text-center text-purple-300 text-sm">
          <p>💡 Complete tasks to earn gaming time. Be honest - report unauthorized gaming to maintain accountability!</p>
        </div>

      </div>
    </div>
  );
}