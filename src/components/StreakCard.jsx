import { Flame, Target, Sparkles } from "lucide-react";
import { useStore } from "../store/useStore";

export default function StreakCard() {
  const streak = useStore((s) => s.streak);
  const weeklyActivity = useStore((s) => s.weeklyActivity);
  const dailyGoal = useStore((s) => s.dailyGoal);

  const currentStreak = streak?.currentStreak || 0;
  const todayVerses = streak?.todayVerses || 0;
  const progressPercent = Math.min(100, Math.round((todayVerses / dailyGoal) * 100));
  const isGoalAchieved = todayVerses >= dailyGoal;

  return (
    <div className="streak-card">
      <div className="streak-header">
        <div className="streak-count-wrapper">
          <div className={`streak-icon-box ${currentStreak > 0 ? "streak-icon-box--active" : ""}`}>
            <Flame
              size={24}
              className={`streak-flame ${currentStreak > 0 ? "streak-flame--active" : ""}`}
            />
          </div>
          <div>
            <div className="streak-title">
              {currentStreak === 0 ? "Start a Streak" : `${currentStreak} Day Streak`}
            </div>
            <div className="streak-sub">
              {currentStreak === 0
                ? "Read a verse today to begin your streak"
                : isGoalAchieved
                  ? "Daily goal reached! Keep going ✨"
                  : `${todayVerses} of ${dailyGoal} verses read today`}
            </div>
          </div>
        </div>

        {isGoalAchieved && (
          <span className="streak-badge">
            <Sparkles size={12} /> Goal Met
          </span>
        )}
      </div>

      {/* 7-Day Activity Mini Tracker */}
      <div className="streak-week-pills">
        {weeklyActivity.map((day) => (
          <div
            key={day.dateStr}
            className={`streak-day-pill ${day.isToday ? "streak-day-pill--today" : ""} ${day.completed ? "streak-day-pill--completed" : ""
              }`}
            title={`${day.dateStr}: ${day.count} verses read`}
          >
            <span className="streak-day-name">{day.dayName}</span>
            <div className="streak-day-dot" />
          </div>
        ))}
      </div>

      {/* Daily Goal Mini Progress Bar */}
      <div className="streak-goal-bar-container">
        <div className="streak-goal-header">
          <span className="streak-goal-label">
            <Target size={12} /> Daily Goal ({todayVerses}/{dailyGoal} verses)
          </span>
          <span className="streak-goal-percent">{progressPercent}%</span>
        </div>
        <div className="streak-progress-track">
          <div
            className="streak-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
