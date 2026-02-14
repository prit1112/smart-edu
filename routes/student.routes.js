import express from "express";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { isAuth } from "../middleware/auth.middleware.js";
import { getLearningPath } from "../services/learningPath.service.js";
import { uploadHomework } from "../config/upload.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import User from "../models/User.js";
import Subject from "../models/Subject.js";
import Chapter from "../models/Chapter.js";
import Note from "../models/Note.js";
import Video from "../models/Video.js";
import Attendance from "../models/Attendance.js";
import MCQ from "../models/MCQ.js";
import QuizResult from "../models/QuizResult.js";
import Notification from "../models/Notification.js";
import NotificationSeen from "../models/NotificationSeen.js";
import Homework from "../models/Homework.js";
import HomeworkSubmission from "../models/HomeworkSubmission.js";

const router = express.Router();

/* =====================================================
   STUDENT DASHBOARD
===================================================== */
router.get("/", isAuth, async (req, res) => {
  const student = await User.findById(req.session.userId).lean();

  const subjects = await Subject.find({
    classLevel: student.classLevel
  }).lean();

  const today = new Date().toISOString().slice(0, 10);

  const todayAttendance = await Attendance.findOne({
    student: student._id,
    date: today
  });

  const monthStart = new Date();
  monthStart.setDate(1);

  const monthAttendances = await Attendance.countDocuments({
    student: student._id,
    createdAt: { $gte: monthStart }
  });

  // Get learning path
  const learningPath = await getLearningPath(student._id);

  // Get all notifications for the student using the notification service
  const notificationService = (await import('../services/notification.service.js')).default;
  const { notifications: allNotifications } = await notificationService.getStudentNotifications(student._id);

  // Count unseen notifications
  const unseenCount = allNotifications.filter(n => !n.isSeen).length;

  // Get additional stats for dashboard
  const totalSubjects = subjects.length;
  const quizResults = await QuizResult.find({ student: student._id }).lean();
  const completedQuizzes = quizResults.length;
  const averageScore = completedQuizzes > 0
    ? Math.round((quizResults.reduce((sum, r) => sum + (r.score / r.totalMarks), 0) / completedQuizzes) * 100)
    : 0;

  // Get attendance stats for current month
  const currentMonthAttendances = await Attendance.find({
    student: student._id,
    createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
  }).lean();

  const attendanceRate = currentMonthAttendances.length > 0
    ? Math.round((currentMonthAttendances.filter(a => a.status === "present").length / currentMonthAttendances.length) * 100)
    : 0;

  // Get courses (subjects) with progress
  const courses = await Promise.all(subjects.map(async (subject) => {
    const subjectChapters = await Chapter.find({ subject: subject._id }).lean();
    const subjectResults = await QuizResult.find({
      student: student._id,
      chapter: { $in: subjectChapters.map(c => c._id) }
    }).lean();

    const totalChapters = subjectChapters.length;
    const completedChapters = subjectResults.length;
    const progress = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

    return {
      name: subject.name,
      progress,
      chapters: totalChapters,
      completed: completedChapters
    };
  }));

  // Calculate GPA (simplified - based on quiz performance)
  const allQuizResults = await QuizResult.find({ student: student._id }).lean();
  const gpa = allQuizResults.length > 0
    ? Math.round((allQuizResults.reduce((sum, r) => sum + (r.score / r.totalMarks), 0) / allQuizResults.length) * 4 * 10) / 10
    : 0;

  // Get pending assignments (homework)
  const pendingAssignments = await Homework.find({
    classLevel: student.classLevel,
    isActive: true,
    dueDate: { $gte: new Date() }
  }).lean();

  // Get today's schedule (mock data - you can replace with actual schedule data)
  const schedule = [
    { time: '9:00 AM', subject: 'Mathematics', location: 'Room 101', professor: 'Prof. Smith' },
    { time: '11:00 AM', subject: 'Physics Lab', location: 'Lab 203', professor: 'Prof. Johnson' },
    { time: '2:00 PM', subject: 'Chemistry', location: 'Room 105', professor: 'Prof. Davis' }
  ];

  // Get assignments with status
  const assignments = await Promise.all(pendingAssignments.slice(0, 3).map(async (hw) => {
    const submission = await HomeworkSubmission.findOne({
      homework: hw._id,
      student: student._id
    }).lean();

    let status = 'pending';
    let statusText = 'Pending';

    if (submission) {
      status = 'submitted';
      statusText = 'Submitted';
    } else if (new Date(hw.dueDate) < new Date()) {
      status = 'overdue';
      statusText = 'Overdue';
    } else if (new Date(hw.dueDate).toDateString() === new Date().toDateString()) {
      status = 'due';
      statusText = 'Due Today';
    }

    return {
      title: hw.title,
      dueDate: new Date(hw.dueDate).toLocaleDateString(),
      status,
      statusText
    };
  }));

  res.render("student/dashboard", {
    title: "Dashboard",
    user: student,
    courses,
    attendance: { percentage: attendanceRate },
    gpa,
    pendingAssignments,
    schedule,
    assignments
  });
});

/* =====================================================
   SUBJECTS LIST
===================================================== */
router.get("/subject", isAuth, async (req, res) => {
  const student = await User.findById(req.session.userId).lean();

  const subjects = await Subject.find({
    classLevel: student.classLevel
  }).lean();

  res.render("student/subjects", {
    title: "My Subjects",
    user: student,
    subjects
  });
});

/* =====================================================
   SUBJECT → CHAPTERS
===================================================== */
router.get("/subject/:id", isAuth, async (req, res) => {
  const subjectId = req.params.id;
  if (typeof subjectId !== 'string' || !subjectId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.send("Invalid subject id");
  }
  const subject = await Subject.findById(subjectId).lean();
  const chapters = await Chapter.find({ subject: subject._id }).lean();
  const student = await User.findById(req.session.userId).lean();

  // Get MCQ counts and quiz results for each chapter
  const chaptersWithData = await Promise.all(chapters.map(async (c) => {
    const mcqCount = await MCQ.countDocuments({ chapter: c._id });
    const existingResult = await QuizResult.findOne({
      student: student._id,
      chapter: c._id
    }).lean();

    return {
      ...c,
      mcqCount,
      hasAttempted: !!existingResult,
      resultId: existingResult ? existingResult._id : null,
      progress: existingResult ? 100 : (mcqCount > 0 ? 50 : 0),
      quizAvailable: true
    };
  }));

  res.render("student/subject", {
    title: subject.name,
    user: student,
    subject,
    chapters: chaptersWithData
  });
});

/* =====================================================
   STUDENT → START QUIZ
===================================================== */
router.get("/quiz/:chapterId", isAuth, async (req, res) => {
  const student = await User.findById(req.session.userId).lean();
  const chapter = await Chapter.findById(req.params.chapterId).lean();

  if (!chapter) return res.send("Chapter not found");

  // Check if student has already attempted this quiz
  const existingResult = await QuizResult.findOne({
    student: student._id,
    chapter: chapter._id
  }).lean();

  if (existingResult) {
    // Redirect to result page if already attempted
    return res.redirect(`/student/result/${existingResult._id}`);
  }

  let mcqs = await MCQ.find({ chapter: chapter._id }).lean();

  if (mcqs.length === 0) {
    return res.render("layouts/main", {
      title: "Quiz Not Available",
      user: student,
      body: `
        <h1>Quiz Not Available</h1>
        <p>No questions are available for this chapter yet.</p>
        <a href="/student/subject/${chapter.subject}"><button>← Back to Subject</button></a>
      `
    });
  }

  // Shuffle the questions randomly
  mcqs = mcqs.sort(() => Math.random() - 0.5);

  res.render("student/quiz", {
    title: `Quiz: ${chapter.title}`,
    user: student,
    chapter,
    questions: mcqs
  });
});

/* =====================================================
   STUDENT → SUBMIT QUIZ
===================================================== */
router.post("/quiz/:chapterId", isAuth, async (req, res) => {
  const studentId = req.session.userId;
  const chapterId = req.params.chapterId;

  const mcqs = await MCQ.find({ chapter: chapterId }).lean();

  let score = 0, correct = 0, wrong = 0, attempted = 0, totalMarks = 0;

  mcqs.forEach(q => {
    totalMarks += q.marks;
    const ans = req.body[`q_${q._id}`];

    if (ans !== undefined) {
      attempted++;
      if (Number(ans) === q.correctIndex) {
        correct++;
        score += q.marks;
      } else {
        wrong++;
        score -= q.negativeMarks;
      }
    }
  });

  if (score < 0) score = 0;

  const result = await QuizResult.create({
    student: studentId,
    chapter: chapterId,
    score,
    totalMarks,
    correct,
    wrong,
    attempted
  });

  res.redirect(`/student/result/${result._id}`);
});

/* =====================================================
   STUDENT → RESULT
===================================================== */
router.get("/result/:resultId", isAuth, async (req, res) => {
  const student = await User.findById(req.session.userId).lean();
  const result = await QuizResult.findById(req.params.resultId)
    .populate({
      path: "chapter",
      populate: { path: "subject" }
    })
    .lean();

  if (!result) return res.send("Result not found");

  res.render("student/result", {
    title: "Quiz Result",
    user: student,
    result
  });
});

/* =====================================================
   STUDENT → QUIZ HISTORY
===================================================== */
router.get("/history", isAuth, async (req, res) => {
  const student = await User.findById(req.session.userId).lean();
  const results = await QuizResult.find({ student: student._id })
    .populate("chapter")
    .sort({ createdAt: -1 })
    .lean();

  res.render("student/history", {
    title: "Quiz History",
    user: student,
    results
  });
});


/* =====================================================
   NOTES
===================================================== */
router.get("/notes/:chapterId", isAuth, async (req, res) => {
  const student = await User.findById(req.session.userId).lean();
  const chapter = await Chapter.findById(req.params.chapterId).lean();

  if (!chapter) return res.send("Chapter not found");

  const notes = await Note.find({ chapter: chapter._id }).lean();

  res.render("student/notes", {
    title: `Notes: ${chapter.title}`,
    user: student,
    chapter,
    notes
  });
});

/* =====================================================
   VIDEOS
===================================================== */
router.get("/videos/:chapterId", isAuth, async (req, res) => {
  const student = await User.findById(req.session.userId).lean();
  const chapter = await Chapter.findById(req.params.chapterId).populate('subject').lean();

  if (!chapter) return res.send("Chapter not found");

  const videos = await Video.find({ chapter: chapter._id }).lean();

  res.render("student/videos", {
    title: `Videos: ${chapter.title}`,
    user: student,
    chapter,
    videos
  });
});

/* =====================================================
   STUDENT → NOTIFICATIONS PAGE
===================================================== */
router.get("/notifications", isAuth, async (req, res) => {
  try {
    const student = await User.findById(req.session.userId).lean();

    if (!student) {
      return res.redirect('/auth/login');
    }

    // Use notification service to get notifications
    const notificationService = (await import('../services/notification.service.js')).default;
    const { notifications: notificationsWithSeen, grouped } = await notificationService.getStudentNotifications(student._id);

    // Filter logic
    const filter = req.query.filter || 'all';
    let filteredNotifications = notificationsWithSeen;

    if (filter === 'unread') {
      filteredNotifications = notificationsWithSeen.filter(n => !n.isSeen);
    } else if (filter === 'urgent') {
      filteredNotifications = notificationsWithSeen.filter(n => n.type === 'urgent');
    }

    // Render using dedicated notifications template
    res.render("student/notifications", {
      title: "School Updates & Notifications",
      user: student,
      notifications: notificationsWithSeen,
      filteredNotifications,
      filter,
      notificationsData: notificationsWithSeen || [] // Pass data for client-side use
    });
  } catch (error) {
    console.error('Error loading notifications:', error);
    res.status(500).send('Internal server error');
  }
});

/* =====================================================
   GET NOTIFICATION COUNT
===================================================== */
router.get("/notifications/count", isAuth, async (req, res) => {
  try {
    const student = await User.findById(req.session.userId).lean();

    if (!student) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Use notification service to get notifications
    const notificationService = (await import('../services/notification.service.js')).default;
    const { notifications } = await notificationService.getStudentNotifications(student._id);

    // Count unseen notifications
    const unread = notifications.filter(n => !n.isSeen).length;

    res.json({ unread });
  } catch (error) {
    console.error('Error fetching notification count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* =====================================================
   MARK NOTIFICATION AS SEEN
===================================================== */
router.post("/notifications/mark-seen", isAuth, async (req, res) => {
  try {
    const { notificationId } = req.body;
    const studentId = req.session.userId;

    // Check if already marked as seen
    const existing = await NotificationSeen.findOne({
      notification: notificationId,
      student: studentId
    });

    if (!existing) {
      await NotificationSeen.create({
        notification: notificationId,
        student: studentId
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

/* =====================================================
   MARK NOTIFICATION AS UNSEEN (Mark as Unread)
===================================================== */
router.post("/notifications/mark-unseen", isAuth, async (req, res) => {
  try {
    const { notificationId } = req.body;
    const studentId = req.session.userId;

    // Delete the notification seen record to mark as unseen
    await NotificationSeen.findOneAndDelete({
      notification: notificationId,
      student: studentId
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/* =====================================================
   DELETE NOTIFICATION
===================================================== */
router.post("/notifications/delete", isAuth, async (req, res) => {
  try {
    const { notificationId } = req.body;
    const studentId = req.session.userId;

    // Delete the notification seen record
    await NotificationSeen.findOneAndDelete({
      notification: notificationId,
      student: studentId
    });

    // Note: We don't delete the actual notification as it may be shared with other students
    // We just remove the student's view of it

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/* =====================================================
   MARK ALL NOTIFICATIONS AS SEEN
===================================================== */
router.post("/notifications/mark-all-seen", isAuth, async (req, res) => {
  try {
    const studentId = req.session.userId;

    // Get all notifications for the student
    const notificationService = (await import('../services/notification.service.js')).default;
    const { notifications } = await notificationService.getStudentNotifications(studentId);

    // Get all unseen notification IDs
    const unseenNotifications = notifications.filter(n => !n.isSeen);
    const notificationIds = unseenNotifications.map(n => n._id);

    // Create notification seen records for all unseen notifications
    const seenRecords = notificationIds.map(notificationId => ({
      notification: notificationId,
      student: studentId
    }));

    // Use bulk insert with ordered: false for better performance
    if (seenRecords.length > 0) {
      await NotificationSeen.insertMany(seenRecords, { ordered: false }).catch(err => {
        // Ignore duplicate key errors (already seen)
        if (err.code !== 11000) {
          throw err;
        }
      });
    }

    res.json({ success: true, count: seenRecords.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/* =====================================================
   STUDENT → HOMEWORK
===================================================== */
router.get("/homework", isAuth, async (req, res) => {
  const student = await User.findById(req.session.userId).lean();

  // Get all active homework for student's class
  const homeworks = await Homework.find({
    classLevel: student.classLevel,
    isActive: true
  })
  .populate('subject', 'name')
  .populate('chapter', 'title')
  .sort({ dueDate: 1 })
  .lean();

  // Get submissions for these homeworks
  const submissions = await HomeworkSubmission.find({
    student: student._id,
    homework: { $in: homeworks.map(h => h._id) }
  }).lean();

  // Create submission map
  const submissionMap = {};
  submissions.forEach(sub => {
    submissionMap[sub.homework.toString()] = sub;
  });

  // Add submission status to homeworks
  const homeworksWithStatus = homeworks.map(hw => {
    const submission = submissionMap[hw._id.toString()];
    const now = new Date();
    const dueDate = new Date(hw.dueDate);
    const isOverdue = now > dueDate;

    let status = 'pending';
    let statusColor = 'yellow';
    let statusText = 'Pending';

    if (submission) {
      if (submission.status === 'late') {
        status = 'late';
        statusColor = 'red';
        statusText = 'Late Submission';
      } else {
        status = 'submitted';
        statusColor = 'green';
        statusText = 'Submitted';
      }
    } else if (isOverdue) {
      status = 'overdue';
      statusColor = 'red';
      statusText = 'Overdue';
    }

    // Calculate countdown
    const timeDiff = dueDate - now;
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    let countdownText = '';

    if (daysLeft > 0) {
      countdownText = `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`;
    } else if (daysLeft === 0) {
      countdownText = 'Due today';
    } else {
      countdownText = `${Math.abs(daysLeft)} day${Math.abs(daysLeft) > 1 ? 's' : ''} overdue`;
    }

    return {
      ...hw,
      submission,
      status,
      statusColor,
      statusText,
      countdownText,
      isOverdue
    };
  });

  res.render("student/homework", {
    title: "My Homework",
    user: student,
    homeworksWithStatus
  });
});

router.get("/homework/:homeworkId", isAuth, async (req, res) => {
  const student = await User.findById(req.session.userId).lean();
  const homework = await Homework.findById(req.params.homeworkId)
    .populate('subject', 'name')
    .populate('chapter', 'title')
    .populate('createdBy', 'name')
    .lean();

  if (!homework || homework.classLevel !== student.classLevel) {
    return res.redirect('/student/homework');
  }

  // Get existing submission
  const submission = await HomeworkSubmission.findOne({
    homework: homework._id,
    student: student._id
  }).populate('gradedBy', 'name').lean();

  // Calculate status
  const now = new Date();
  const dueDate = new Date(homework.dueDate);
  const isOverdue = now > dueDate;
  const canSubmit = !submission || submission.status === 'not_submitted';

  let status = 'pending';
  let statusColor = 'yellow';
  let statusText = 'Pending';

  if (submission) {
    if (submission.status === 'late') {
      status = 'late';
      statusColor = 'red';
      statusText = 'Late Submission';
    } else {
      status = 'submitted';
      statusColor = 'green';
      statusText = 'Submitted';
    }
  } else if (isOverdue) {
    status = 'overdue';
    statusColor = 'red';
    statusText = 'Overdue';
  }

  res.render("student/homework-detail", {
    title: `Homework: ${homework.title}`,
    user: student,
    homework,
    submission,
    status,
    statusText,
    canSubmit,
    isOverdue
  });
});

/* =====================================================
   STUDENT → SUBMIT HOMEWORK
===================================================== */
router.post("/homework/:homeworkId/submit", isAuth, uploadHomework.single('homeworkFile'), async (req, res) => {
  try {
    const { homeworkId } = req.params;
    const studentId = req.session.userId;
    const { textAnswer } = req.body;
    const file = req.file;

    const homework = await Homework.findById(homeworkId);
    if (!homework) {
      return res.status(404).send("Homework not found");
    }

    // Check if submission is late
    const isLate = new Date() > new Date(homework.dueDate);

    // Create new submission
    const newSubmission = new HomeworkSubmission({
      homework: homeworkId,
      student: studentId,
      submittedAt: new Date(),
      status: isLate ? 'late' : 'submitted',
      file: file ? file.filename : null,
      textAnswer: textAnswer || null
    });

    await newSubmission.save();

    res.redirect(`/student/homework/${homeworkId}`);
  } catch (error) {
    console.error("Error submitting homework:", error);
    res.status(500).send("Error submitting homework");
  }
});


/* =====================================================
   STUDENT → PERFORMANCE DASHBOARD
===================================================== */
router.get("/performance", isAuth, async (req, res) => {
  const student = await User.findById(req.session.userId).lean();

  // Get all quiz results for the student
  const quizResults = await QuizResult.find({ student: student._id })
    .populate({
      path: "chapter",
      populate: { path: "subject" }
    })
    .sort({ createdAt: -1 })
    .lean();

  // Get all attendance records for the student
  const attendances = await Attendance.find({ student: student._id }).lean();

  // Get all subjects for the student's class level
  const subjects = await Subject.find({ classLevel: student.classLevel }).lean();

  // Get all chapters for these subjects
  const chapters = await Chapter.find({
    subject: { $in: subjects.map(s => s._id) }
  }).populate("subject").lean();

  // Compute summary metrics
  const validQuizResults = quizResults.filter(r => r.totalMarks > 0);
  const totalQuizzes = validQuizResults.length;
  const overallScorePercent = totalQuizzes > 0
    ? Math.round((validQuizResults.reduce((sum, r) => sum + (r.score / r.totalMarks), 0) / totalQuizzes) * 100)
    : 0;

  const totalAttendanceDays = attendances.length;
  const presentDays = attendances.filter(a => a.status === "present").length;
  const averageAttendancePercent = totalAttendanceDays > 0
    ? Math.round((presentDays / totalAttendanceDays) * 100)
    : 0;

  const lastQuizDate = validQuizResults.length > 0
    ? new Date(validQuizResults[0].createdAt).toLocaleDateString()
    : "No quizzes attempted";

  // Subject-wise performance
  const subjectPerformance = subjects.map(subject => {
    const subjectChapters = chapters.filter(c => c.subject._id.toString() === subject._id.toString());
    const subjectResults = validQuizResults.filter(r =>
      subjectChapters.some(c => c._id.toString() === r.chapter._id.toString())
    );

    const avgScore = subjectResults.length > 0
      ? Math.round((subjectResults.reduce((sum, r) => sum + (r.score / r.totalMarks), 0) / subjectResults.length) * 100)
      : 0;

    return {
      name: subject.name,
      averageScore: avgScore,
      quizzesTaken: subjectResults.length,
      totalChapters: subjectChapters.length
    };
  });

  // Chapter-wise progress
  const chapterProgress = await Promise.all(chapters.map(async (chapter) => {
    const chapterResults = quizResults.filter(r => r.chapter._id.toString() === chapter._id.toString());
    const mcqCount = await MCQ.countDocuments({ chapter: chapter._id });

    let status = "Not Started";
    let progressPercent = 0;
    let bestScore = 0;
    let totalMarks = 0;

    if (chapterResults.length > 0) {
      status = "Completed";
      bestScore = Math.max(...chapterResults.map(r => r.score));
      totalMarks = chapterResults[0].totalMarks;
      progressPercent = Math.round((bestScore / totalMarks) * 100);
    } else if (mcqCount > 0) {
      status = "In Progress";
      progressPercent = 0;
    }

    // Weighted progress: Quiz Avg % × 0.7 + Attendance % × 0.3
    const quizAvgPercent = chapterResults.length > 0
      ? (chapterResults.reduce((sum, r) => sum + (r.score / r.totalMarks), 0) / chapterResults.length) * 100
      : 0;
    const weightedProgress = Math.round((quizAvgPercent * 0.7) + (averageAttendancePercent * 0.3));

    return {
      title: chapter.title,
      subject: chapter.subject.name,
      attempts: chapterResults.length,
      bestScore,
      totalMarks,
      status,
      progressPercent: weightedProgress,
      mcqCount
    };
  }));

  // Chart data
  const subjectChartData = {
    labels: subjectPerformance.map(s => s.name),
    data: subjectPerformance.map(s => s.averageScore)
  };

  const doughnutChartData = {
    labels: ["Score (%)", "Attendance (%)"],
    data: [overallScorePercent, averageAttendancePercent]
  };

  // Advanced chart data
  const radarData = {
    labels: subjectPerformance.map(s => s.name),
    data: subjectPerformance.map(s => s.averageScore)
  };

  const gpaTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    data: [3.2, 3.4, 3.1, 3.6, 3.8, 3.7] // Mock historical GPA data
  };

  const gradeDistributionData = {
    labels: ['A', 'B', 'C', 'D'],
    data: [45, 35, 15, 5] // Mock grade distribution
  };

  const comparisonData = {
    labels: ['You', 'Class Avg', 'Top 10%', 'Top Performer'],
    data: [overallScorePercent / 20, 3.2, 3.8, 3.9] // GPA-like comparison
  };

  // Performance trends data
  const performanceTrends = {
    data: [75, 78, 82, 79, 85, overallScorePercent],
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  };

  // Attendance vs Score Chart Data - Real data grouped by time period (last 8 weeks)
  const now = new Date();
  const eightWeeksAgo = new Date(now.getTime() - 56 * 24 * 60 * 60 * 1000); // 8 weeks ago
  
  // Filter quiz results and attendances for last 8 weeks
  const recentQuizResults = quizResults.filter(r => r.createdAt >= eightWeeksAgo && r.totalMarks > 0);
  const recentAttendances = attendances.filter(a => a.createdAt >= eightWeeksAgo);
  
  // Group by week
  const attendanceVsScoreData = [];
  for (let i = 0; i < 8; i++) {
    const weekStart = new Date(now.getTime() - (7 - i) * 7 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(now.getTime() - (6 - i) * 7 * 24 * 60 * 60 * 1000);
    
    // Get quiz results for this week
    const weekQuizResults = recentQuizResults.filter(r => {
      const quizDate = new Date(r.createdAt);
      return quizDate >= weekStart && quizDate < weekEnd;
    });
    
    // Get attendance for this week
    const weekAttendances = recentAttendances.filter(a => {
      const attDate = new Date(a.createdAt);
      return attDate >= weekStart && attDate < weekEnd;
    });
    
    // Calculate attendance percentage for this week
    const presentCount = weekAttendances.filter(a => a.status === "present").length;
    const attendancePercent = weekAttendances.length > 0 
      ? Math.round((presentCount / weekAttendances.length) * 100) 
      : 0;
    
    // Calculate score percentage for this week
    const scorePercent = weekQuizResults.length > 0
      ? Math.round((weekQuizResults.reduce((sum, r) => sum + (r.score / r.totalMarks), 0) / weekQuizResults.length) * 100)
      : 0;
    
    attendanceVsScoreData.push({
      week: `Week ${i + 1}`,
      attendance: attendancePercent,
      score: scorePercent,
      quizCount: weekQuizResults.length,
      attendanceCount: weekAttendances.length
    });
  }

  // If no data exists for recent weeks, use all-time data divided into periods
  const hasRecentData = attendanceVsScoreData.some(d => d.quizCount > 0 || d.attendanceCount > 0);
  
  if (!hasRecentData) {
    // Use all-time data split into 8 periods
    const allTimeQuizResults = quizResults.filter(r => r.totalMarks > 0);
    const allTimeAttendances = attendances;
    
    // Sort by date
    allTimeQuizResults.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    allTimeAttendances.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    // Split into 8 groups
    const quizStep = Math.ceil(allTimeQuizResults.length / 8) || 1;
    const attStep = Math.ceil(allTimeAttendances.length / 8) || 1;
    
    for (let i = 0; i < 8; i++) {
      const startIdx = i * quizStep;
      const endIdx = Math.min(startIdx + quizStep, allTimeQuizResults.length);
      const weekQuizzes = allTimeQuizResults.slice(startIdx, endIdx);
      
      const attStartIdx = i * attStep;
      const attEndIdx = Math.min(attStartIdx + attStep, allTimeAttendances.length);
      const weekAtts = allTimeAttendances.slice(attStartIdx, attEndIdx);
      
      const presentCount = weekAtts.filter(a => a.status === "present").length;
      const attendancePercent = weekAtts.length > 0 
        ? Math.round((presentCount / weekAtts.length) * 100) 
        : 0;
      
      const scorePercent = weekQuizzes.length > 0
        ? Math.round((weekQuizzes.reduce((sum, r) => sum + (r.score / r.totalMarks), 0) / weekQuizzes.length) * 100)
        : 0;
      
      attendanceVsScoreData[i] = {
        week: `Week ${i + 1}`,
        attendance: attendancePercent,
        score: scorePercent,
        quizCount: weekQuizzes.length,
        attendanceCount: weekAtts.length
      };
    }
  }

  // Extract arrays for chart
  const attendanceChartData = attendanceVsScoreData.map(d => d.attendance);
  const scoreChartData = attendanceVsScoreData.map(d => d.score);
  const chartLabels = attendanceVsScoreData.map(d => d.week);

  // Strengths and weaknesses analysis
  const strengths = subjectPerformance && subjectPerformance.length > 0 ? subjectPerformance
    .filter(s => s.averageScore >= 80)
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 3)
    .map(s => ({
      subject: s.name,
      score: s.averageScore,
      topic: 'Overall Performance'
    })) : [];

  const weaknesses = subjectPerformance && subjectPerformance.length > 0 ? subjectPerformance
    .filter(s => s.averageScore < 70)
    .sort((a, b) => a.averageScore - b.averageScore)
    .slice(0, 3)
    .map(s => ({
      subject: s.name,
      score: s.averageScore,
      topic: 'Needs Improvement'
    })) : [];

  res.render("student/performance", {
    title: "My Performance",
    user: student,
    summary: {
      overallScorePercent: overallScorePercent || 0,
      totalQuizzes: totalQuizzes || 0,
      averageAttendancePercent: averageAttendancePercent || 0,
      lastQuizDate: lastQuizDate || "No quizzes attempted"
    },
    subjectPerformance: subjectPerformance || [],
    chapterProgress: chapterProgress || [],
    subjectChartData: subjectChartData || { labels: [], data: [] },
    doughnutChartData: doughnutChartData || { labels: [], data: [] },
    performanceTrends,
    strengths,
    weaknesses,
    radarData,
    gpaTrendData,
    gradeDistributionData,
    comparisonData,
    attendanceVsScoreData: {
      labels: chartLabels,
      attendance: attendanceChartData,
      score: scoreChartData
    }
  });
});

// Push notification subscription
router.post("/push/subscribe", isAuth, async (req, res) => {
  try {
    const { subscription } = req.body;
    const studentId = req.session.userId;

    // Import notification service
    const notificationService = (await import('../services/notification.service.js')).default;

    // Update push subscription
    await notificationService.updatePushSubscription(studentId, subscription);

    res.json({ success: true });
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    res.status(500).json({ success: false, error: 'Failed to subscribe' });
  }
});

// Update notification preferences
router.post("/notification-preferences", isAuth, async (req, res) => {
  try {
    const { inApp, push, whatsapp } = req.body;
    const studentId = req.session.userId;

    // Import notification service
    const notificationService = (await import('../services/notification.service.js')).default;

    // Update preferences
    await notificationService.updateNotificationPreferences(studentId, {
      inApp: inApp === 'true',
      push: push === 'true',
      whatsapp: whatsapp === 'true'
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ success: false, error: 'Failed to update preferences' });
  }
});

// Service Worker registration for push notifications
router.get("/sw.js", (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`
    self.addEventListener('install', event => {
      console.log('Service Worker installing.');
    });

    self.addEventListener('activate', event => {
      console.log('Service Worker activating.');
    });

    self.addEventListener('push', event => {
      const data = event.data.json();
      const options = {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        data: data.data,
        requireInteraction: true
      };

      event.waitUntil(
        self.registration.showNotification(data.title, options)
      );
    });

    self.addEventListener('notificationclick', event => {
      event.notification.close();
      event.waitUntil(
        clients.openWindow(event.notification.data.url || '/student/notifications')
      );
    });
  `);
});

export default router;
