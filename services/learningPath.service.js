import QuizResult from "../models/QuizResult.js";
import Attendance from "../models/Attendance.js";
import Chapter from "../models/Chapter.js";

// Simple in-memory cache for learning paths (10 minutes TTL)
const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export const getLearningPath = async (studentId) => {
  // Check cache first
  const cacheKey = `learningPath_${studentId}`;
  const cached = cache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.data;
  }

  try {
    // 1. Analyze quiz results per chapter
    const quizResults = await QuizResult.find({ student: studentId })
      .populate('chapter')
      .lean();

    // Group quiz results by chapter and calculate averages
    const chapterScores = {};
    quizResults.forEach(result => {
      const chapterId = result.chapter._id.toString();
      if (!chapterScores[chapterId]) {
        chapterScores[chapterId] = {
          chapter: result.chapter,
          scores: [],
          totalAttempts: 0
        };
      }
      chapterScores[chapterId].scores.push((result.score / result.totalMarks) * 100);
      chapterScores[chapterId].totalAttempts++;
    });

    // Identify weak chapters (average score < 40%)
    const weakChapters = [];
    Object.values(chapterScores).forEach(chapterData => {
      const avgScore = chapterData.scores.reduce((a, b) => a + b, 0) / chapterData.scores.length;
      if (avgScore < 40) {
        weakChapters.push({
          chapterId: chapterData.chapter._id,
          title: chapterData.chapter.title,
          averageScore: Math.round(avgScore),
          attempts: chapterData.totalAttempts
        });
      }
    });

    // 2. Calculate attendance for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 10);

    const recentAttendance = await Attendance.find({
      student: studentId,
      date: { $gte: sevenDaysAgoStr }
    }).lean();

    const presentDays = recentAttendance.filter(a => a.status === 'present').length;
    const totalDays = recentAttendance.length;
    const attendancePercent = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
    const attendanceWarning = attendancePercent < 60;

    // 3. Check inactivity (last activity > 5 days)
    const lastActivity = quizResults.length > 0
      ? new Date(Math.max(...quizResults.map(r => new Date(r.createdAt))))
      : null;

    const inactivityDays = lastActivity
      ? Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // 4. Generate recommendations
    const recommendations = [];

    // Weak chapter recommendations
    weakChapters.forEach(chapter => {
      recommendations.push(`Revise Chapter ${chapter.title} (Low Score: ${chapter.averageScore}%)`);
    });

    // Attendance warning
    if (attendanceWarning) {
      recommendations.push(`Attendance is low this week (${attendancePercent}%)`);
    }

    // Inactivity alert
    if (inactivityDays && inactivityDays > 5) {
      recommendations.push(`You haven't studied for ${inactivityDays} days`);
    }

    // If no issues, add positive message
    if (recommendations.length === 0) {
      recommendations.push("Great job! Keep up the good work!");
    }

    const result = {
      weakChapters,
      attendanceWarning,
      inactivityDays,
      recommendations
    };

    // Cache the result
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return result;
  } catch (error) {
    console.error('Error in getLearningPath:', error);
    return {
      weakChapters: [],
      attendanceWarning: false,
      inactivityDays: null,
      recommendations: ["Unable to load learning path at this time"]
    };
  }
};

// Clear expired cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      cache.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean every 5 minutes

export default { getLearningPath };
