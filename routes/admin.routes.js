 import express from "express";
import { isAuth } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";
import upload from "../config/upload.js";

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
import { uploadHomework } from "../config/upload.js";

const router = express.Router();

/* =====================================================
   ADMIN DASHBOARD → STD 1–12
===================================================== */
router.get("/", isAuth, isAdmin, async (req, res) => {
  try {
    // Fetch dashboard statistics
    const subjectsCount = await Subject.countDocuments();
    const studentsCount = await User.countDocuments({ role: 'student' });
    const notificationsCount = await Notification.countDocuments();

    res.render("admin/dashboard", {
      title: "Admin Dashboard",
      user: { role: "admin" },
      subjectsCount,
      studentsCount,
      notificationsCount
    });
  } catch (error) {
    console.error('Error loading admin dashboard:', error);
    res.render("admin/dashboard", {
      title: "Admin Dashboard",
      user: { role: "admin" },
      subjectsCount: 0,
      studentsCount: 0,
      notificationsCount: 0
    });
  }
});

/* =====================================================
   ADD SUBJECT
===================================================== */
router.post("/add-subject", isAuth, isAdmin, async (req, res) => {
  await Subject.create(req.body);
  res.redirect(`/admin/class/${req.body.classLevel}`);
});

/* =====================================================
   DELETE SUBJECT (with chapters)
===================================================== */
router.post("/delete-subject/:subjectId", isAuth, isAdmin, async (req, res) => {
  const subject = await Subject.findById(req.params.subjectId);
  if (!subject) return res.redirect("/admin");

  await Chapter.deleteMany({ subject: subject._id });
  await Subject.findByIdAndDelete(subject._id);

  res.redirect(`/admin/class/${subject.classLevel}`);
});

/* =====================================================
   CLASS → SUBJECTS
===================================================== */
router.get("/class/:classLevel", isAuth, isAdmin, async (req, res) => {
  const classLevel = Number(req.params.classLevel);
  const subjects = await Subject.find({ classLevel }).lean();

  res.render("admin/class-subjects", {
    title: `STD ${classLevel} - Subjects`,
    user: { role: "admin" },
    classLevel,
    subjects
  });
});

/* =====================================================
   CHAPTERS
===================================================== */
router.get("/chapters/:subjectId", isAuth, isAdmin, async (req, res) => {
  const subject = await Subject.findById(req.params.subjectId).lean();
  const chapters = await Chapter.find({ subject: subject._id }).lean();

  res.render("admin/chapters", {
    title: "Chapters",
    user: { role: "admin" },
    subject,
    chapters
  });
});

/* =====================================================
   ADD / DELETE CHAPTER
===================================================== */
router.post("/add-chapter", isAuth, isAdmin, async (req, res) => {
  const { title, subjectId } = req.body;
  await Chapter.create({ title, subject: subjectId });
  res.redirect(`/admin/chapters/${subjectId}`);
});

router.post("/delete-chapter/:chapterId/:subjectId", isAuth, isAdmin, async (req, res) => {
  const { chapterId, subjectId } = req.params;

  await Note.deleteMany({ chapter: chapterId });
  await Video.deleteMany({ chapter: chapterId });
  await MCQ.deleteMany({ chapter: chapterId });

  await Chapter.findByIdAndDelete(chapterId);

  res.redirect(`/admin/chapters/${subjectId}`);
});

/* =====================================================
   NOTES
===================================================== */
router.get("/notes/:chapterId", isAuth, isAdmin, async (req, res) => {
  const chapter = await Chapter.findById(req.params.chapterId).lean();
  const notes = await Note.find({ chapter: chapter._id }).lean();

  res.render("admin/notes", {
    title: "Notes",
    user: { role: "admin" },
    chapter,
    notes
  });
});

router.post("/add-note", isAuth, isAdmin, upload.single("pdf"), async (req, res) => {
  await Note.create({
    title: req.body.title,
    file: req.file.filename,
    chapter: req.body.chapterId
  });
  res.redirect(`/admin/notes/${req.body.chapterId}`);
});

router.post("/delete-note/:noteId", isAuth, isAdmin, async (req, res) => {
  const note = await Note.findById(req.params.noteId);
  if (!note) return res.redirect("/admin");

  const chapterId = note.chapter;
  await Note.findByIdAndDelete(req.params.noteId);
  res.redirect(`/admin/notes/${chapterId}`);
});

/* =====================================================
   VIDEOS
===================================================== */
router.get("/videos/:chapterId", isAuth, isAdmin, async (req, res) => {
  const chapter = await Chapter.findById(req.params.chapterId).lean();
  const videos = await Video.find({ chapter: chapter._id }).lean();

  res.render("admin/videos", {
    title: "Videos",
    user: { role: "admin" },
    chapter,
    videos
  });
});

router.post("/add-video", isAuth, isAdmin, async (req, res) => {
  await Video.create(req.body);
  res.redirect(`/admin/videos/${req.body.chapterId}`);
});

router.post("/delete-video/:videoId", isAuth, isAdmin, async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    if (!video) return res.redirect("/admin");

    const chapterId = video.chapter;
    await Video.findByIdAndDelete(req.params.videoId);
    res.redirect(`/admin/videos/${chapterId}`);
  } catch (error) {
    console.error(error);
    res.redirect("/admin");
  }
});

/* =====================================================
   MCQs
===================================================== */
router.get("/mcq/:chapterId", isAuth, isAdmin, async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.chapterId).lean();
    if (!chapter) return res.redirect("/admin");

    const mcqs = await MCQ.find({ chapter: chapter._id }).lean();

    res.render("admin/mcq", {
      title: "MCQs",
      user: { role: "admin" },
      chapter,
      mcqs
    });
  } catch (error) {
    console.error(error);
    res.redirect("/admin");
  }
});

router.post("/add-mcq", isAuth, isAdmin, async (req, res) => {
  try {
    const { chapterId, question, option1, option2, option3, option4, correctIndex, marks, negativeMarks } = req.body;

    if (!question || !option1 || !option2 || !option3 || !option4 || correctIndex === undefined) {
      return res.redirect(`/admin/mcq/${chapterId}`);
    }

    const options = [option1, option2, option3, option4];
    const mcqData = {
      chapter: chapterId,
      question,
      options,
      correctIndex: parseInt(correctIndex),
      marks: marks ? parseInt(marks) : 1,
      negativeMarks: negativeMarks ? parseInt(negativeMarks) : 0
    };

    await MCQ.create(mcqData);
    res.redirect(`/admin/mcq/${chapterId}`);
  } catch (error) {
    console.error(error);
    res.redirect("/admin");
  }
});

router.get("/edit-mcq/:mcqId", isAuth, isAdmin, async (req, res) => {
  try {
    const mcq = await MCQ.findById(req.params.mcqId).populate('chapter').lean();
    if (!mcq) return res.redirect("/admin");

    res.render("layouts/main", {
      title: "Edit MCQ",
      user: { role: "admin" },
      body: `
        <h2>Edit MCQ</h2>

        <form method="POST" action="/admin/update-mcq/${mcq._id}">
          <input type="hidden" name="chapterId" value="${mcq.chapter._id}">
          <input name="question" value="${mcq.question}" required />
          <input name="option1" value="${mcq.options[0]}" required />
          <input name="option2" value="${mcq.options[1]}" required />
          <input name="option3" value="${mcq.options[2]}" required />
          <input name="option4" value="${mcq.options[3]}" required />
          <select name="correctIndex" required>
            <option value="0" ${mcq.correctIndex === 0 ? 'selected' : ''}>Option 1</option>
            <option value="1" ${mcq.correctIndex === 1 ? 'selected' : ''}>Option 2</option>
            <option value="2" ${mcq.correctIndex === 2 ? 'selected' : ''}>Option 3</option>
            <option value="3" ${mcq.correctIndex === 3 ? 'selected' : ''}>Option 4</option>
          </select>
          <input name="marks" type="number" value="${mcq.marks}" />
          <input name="negativeMarks" type="number" value="${mcq.negativeMarks}" />
          <button>Update MCQ</button>
        </form>

        <a href="/admin/mcq/${mcq.chapter._id}">⬅ Back</a>
      `
    });
  } catch (error) {
    console.error(error);
    res.redirect("/admin");
  }
});

router.post("/update-mcq/:mcqId", isAuth, isAdmin, async (req, res) => {
  try {
    const { chapterId, question, option1, option2, option3, option4, correctIndex, marks, negativeMarks } = req.body;

    if (!question || !option1 || !option2 || !option3 || !option4 || correctIndex === undefined) {
      return res.redirect(`/admin/mcq/${chapterId}`);
    }

    const options = [option1, option2, option3, option4];
    const updateData = {
      question,
      options,
      correctIndex: parseInt(correctIndex),
      marks: marks ? parseInt(marks) : 1,
      negativeMarks: negativeMarks ? parseInt(negativeMarks) : 0
    };

    await MCQ.findByIdAndUpdate(req.params.mcqId, updateData);
    res.redirect(`/admin/mcq/${chapterId}`);
  } catch (error) {
    console.error(error);
    res.redirect("/admin");
  }
});

router.post("/delete-mcq/:mcqId", isAuth, isAdmin, async (req, res) => {
  try {
    const mcq = await MCQ.findById(req.params.mcqId);
    if (!mcq) return res.redirect("/admin");

    const chapterId = mcq.chapter;
    await MCQ.findByIdAndDelete(req.params.mcqId);
    res.redirect(`/admin/mcq/${chapterId}`);
  } catch (error) {
    console.error(error);
    res.redirect("/admin");
  }
});

/* =====================================================
   ATTENDANCE - ADVANCED SYSTEM
===================================================== */
router.get("/attendance/:classLevel", isAuth, isAdmin, async (req, res) => {
  const classLevel = Number(req.params.classLevel);
  const selectedDate = req.query.date || new Date().toISOString().slice(0, 10);

  const students = (await User.find({ role: "student", classLevel }).lean()).filter(s => s && s._id);

  const records = await Attendance.find({ date: selectedDate }).lean();

  const map = {};
  records.forEach(r => (map[r.student] = r.status));

  // Get attendance statistics for the month
  const currentMonth = new Date(selectedDate);
  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

  const monthlyRecords = await Attendance.find({
    classLevel,
    date: { $gte: startOfMonth.toISOString().slice(0, 10), $lte: endOfMonth.toISOString().slice(0, 10) }
  }).lean();

  // Calculate attendance stats for each student
  const studentStats = students.map(student => {
    const studentRecords = monthlyRecords.filter(r => r.student.toString() === student._id.toString());
    const presentCount = studentRecords.filter(r => r.status === 'present').length;
    const totalDays = studentRecords.length;
    const attendancePercent = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 0;

    return {
      _id: student._id,
      name: student.name,
      presentCount,
      totalDays,
      attendancePercent,
      status: map[student._id] || 'absent'
    };
  });

  // Overall class statistics
  const totalStudents = students.length;
  const presentToday = records.filter(r => r.status === 'present').length;
  const attendanceRate = totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0;

  // Generate calendar days
  const calendarDays = Array.from({ length: endOfMonth.getDate() }, (_, i) => {
    const day = i + 1;
    const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().slice(0, 10);
    const dayRecords = monthlyRecords.filter(r => r.date === dateStr);
    const dayPresentCount = dayRecords.filter(r => r.status === 'present').length;
    const dayTotalCount = dayRecords.length;
    const rate = dayTotalCount > 0 ? Math.round((dayPresentCount / dayTotalCount) * 100) : 0;

    return {
      day,
      dateStr,
      rate
    };
  });

  res.render("admin/attendance", {
    title: "Attendance",
    user: { role: "admin" },
    classLevel,
    selectedDate,
    totalStudents,
    presentToday,
    attendanceRate,
    studentStats,
    calendarDays
  });
});

router.post("/attendance/:classLevel", isAuth, isAdmin, async (req, res) => {
  const classLevel = Number(req.params.classLevel);
  const today = new Date().toISOString().slice(0, 10);

  const students = await User.find({ role: "student", classLevel }).lean();

  for (const s of students) {
    const status = req.body[`status_${s._id}`] || "absent";
    await Attendance.findOneAndUpdate(
      { student: s._id, date: today },
      { student: s._id, classLevel, date: today, status },
      { upsert: true }
    );
  }

  res.redirect(`/admin/attendance/${classLevel}`);
});

/* =====================================================
   ANALYTICS
===================================================== */

// Analytics - Class Selection Page
router.get("/analytics", isAuth, isAdmin, async (req, res) => {
  res.render("admin/analytics", {
    title: "Analytics - Select Class",
    user: { role: "admin" }
  });
});

// Analytics - Class Performance Data
router.get("/analytics/class/:classLevel", isAuth, isAdmin, async (req, res) => {
  const classLevel = Number(req.params.classLevel);
  const students = (await User.find({ classLevel }).lean()).filter(s => s && s._id);

  const data = [];
  for (const s of students) {
    const results = await QuizResult.find({ student: s._id });
    const total = results.reduce((a, r) => a + r.score, 0);

    // Calculate average score percentage
    const avgScorePercent = results.length > 0
      ? Math.round((results.reduce((sum, r) => sum + (r.score / r.totalMarks), 0) / results.length) * 100)
      : 0;

    // Get attendance percentage for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 10);

    const recentAttendance = await Attendance.find({
      student: s._id,
      date: { $gte: sevenDaysAgoStr }
    }).lean();

    const presentDays = recentAttendance.filter(a => a.status === 'present').length;
    const totalDays = recentAttendance.length;
    const attendancePercent = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    // Determine if student is at risk
    const isAtRisk = attendancePercent < 60 || avgScorePercent < 40;

    data.push({
      name: s.name,
      score: total,
      avgScorePercent,
      attendancePercent,
      isAtRisk
    });
  }

  // Calculate summary statistics
  const totalStudents = students.length;
  const atRiskCount = data.filter(d => d.isAtRisk).length;
  const avgScore = data.length > 0 ? Math.round(data.reduce((sum, d) => sum + d.avgScorePercent, 0) / data.length) : 0;

  res.render("admin/analytics", {
    title: `Analytics - STD ${classLevel}`,
    user: { role: "admin" },
    classLevel,
    studentData: data,
    totalStudents,
    atRiskCount,
    avgScore
  });
});

/* =====================================================
   SCHOOL NOTIFICATIONS
===================================================== */
router.get("/notifications", isAuth, isAdmin, async (req, res) => {
  // Redirect to send-notification page which uses send-notification.ejs
  res.redirect("/admin/send-notification");
});



// API endpoint to get students for dropdown
router.get("/api/students", isAuth, isAdmin, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('name classLevel')
      .sort({ classLevel: 1, name: 1 })
      .lean();

    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load students' });
  }
});

/* =====================================================
   NOTIFICATION HISTORY - With Pagination, Search, and Filter
===================================================== */
router.get("/notifications/history", isAuth, isAdmin, async (req, res) => {
  try {
    // Get query parameters for pagination, search, and filtering
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const typeFilter = req.query.type || '';
    const dateFrom = req.query.dateFrom || '';
    const dateTo = req.query.dateTo || '';

    // Build filter query
    let filter = {};

    // Search filter (title or message)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    // Type filter
    if (typeFilter) {
      filter.type = typeFilter;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) {
        filter.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = toDate;
      }
    }

    // Get total count for pagination (without pagination limit)
    const totalNotifications = await Notification.countDocuments(filter);

    // Calculate pagination
    const totalPages = Math.ceil(totalNotifications / limit);
    const skip = (page - 1) * limit;

    // Get paginated notifications
    const notifications = await Notification.find(filter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get overall counts for stats (unfiltered)
    const allNotifications = await Notification.find().lean();
    const infoCount = allNotifications.filter(n => n.type === 'info').length;
    const warningCount = allNotifications.filter(n => n.type === 'warning').length;
    const urgentCount = allNotifications.filter(n => n.type === 'urgent').length;

    res.render("admin/notifications-history", {
      title: "Notification History",
      user: { role: "admin" },
      notifications,
      totalNotifications,
      infoCount,
      warningCount,
      urgentCount,
      // Pagination data
      currentPage: page,
      totalPages,
      limit,
      // Filter data
      search,
      typeFilter,
      dateFrom,
      dateTo
    });
  } catch (error) {
    console.error('Error loading notification history:', error);
    res.render("admin/notifications-history", {
      title: "Notification History",
      user: { role: "admin" },
      notifications: [],
      totalNotifications: 0,
      infoCount: 0,
      warningCount: 0,
      urgentCount: 0,
      currentPage: 1,
      totalPages: 1,
      limit: 10,
      search: '',
      typeFilter: '',
      dateFrom: '',
      dateTo: ''
    });
  }
});

// Delete single notification
router.post("/notifications/delete/:notificationId", isAuth, isAdmin, async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.notificationId);
    await NotificationSeen.deleteMany({ notification: req.params.notificationId });
    
    // Redirect back with current query params to preserve filters
    const queryString = new URLSearchParams(req.query).toString();
    res.redirect(`/admin/notifications/history${queryString ? '?' + queryString : ''}`);
  } catch (error) {
    console.error(error);
    res.redirect('/admin/notifications/history');
  }
});

// Bulk delete notifications
router.post("/notifications/bulk-delete", isAuth, isAdmin, async (req, res) => {
  try {
    const { notificationIds } = req.body;
    
    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.redirect('/admin/notifications/history');
    }

    // Delete all selected notifications
    await Notification.deleteMany({ _id: { $in: notificationIds } });
    
    // Delete all related NotificationSeen records
    await NotificationSeen.deleteMany({ notification: { $in: notificationIds } });
    
    // Redirect back with current query params to preserve filters
    const queryString = new URLSearchParams(req.query).toString();
    res.redirect(`/admin/notifications/history${queryString ? '?' + queryString : ''}`);
  } catch (error) {
    console.error('Error bulk deleting notifications:', error);
    res.redirect('/admin/notifications/history');
  }
});

/* =====================================================
   HOMEWORK MANAGEMENT
===================================================== */

// List all homework with filters
router.get("/homework", isAuth, isAdmin, async (req, res) => {
  try {
    const { classLevel, subject, status } = req.query;

    // Build filter query
    let filter = {};
    if (classLevel) filter.classLevel = parseInt(classLevel);
    if (subject) filter.subject = subject;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;

    const homeworks = (await Homework.find(filter)
      .populate('subject', 'name')
      .populate('chapter', 'title')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .lean()).filter(hw => hw && hw._id && hw.subject);

    // Get submission counts for each homework
    const homeworksWithStats = (await Promise.all(homeworks.map(async (hw) => {
      try {
        if (!hw || !hw._id || !hw.subject || !hw.title || !hw.classLevel) {
          return null;
        }

        const submissions = await HomeworkSubmission.find({ homework: hw._id }).lean();
        const totalStudents = await User.countDocuments({ role: 'student', classLevel: hw.classLevel });

        const submitted = submissions.filter(s => s.status !== 'not_submitted').length;
        const late = submissions.filter(s => s.status === 'late').length;
        const pending = totalStudents - submitted;

        return {
          ...hw,
          stats: {
            total: totalStudents,
            submitted,
            pending,
            late,
            completionRate: totalStudents > 0 ? Math.round((submitted / totalStudents) * 100) : 0
          }
        };
      } catch (error) {
        console.error(`Error processing homework ${hw._id}:`, error);
        return null;
      }
    }))).filter(hw => hw && typeof hw === 'object' && hw._id && hw.subject && hw.title && hw.classLevel);

    // Get filter options
    const subjects = (await Subject.find().lean()).filter(sub => sub && typeof sub === 'object' && sub._id && sub.name && sub.classLevel);

    res.render("admin/homework", {
      title: "Homework Management",
      user: { role: "admin" },
      homeworksWithStats,
      subjects,
      classLevel: classLevel ? parseInt(classLevel) : null,
      subject: subject || '',
      status: status || ''
    });
  } catch (error) {
    console.error(error);
    res.redirect('/admin');
  }
});

// Create homework form
router.get("/homework/create", isAuth, isAdmin, async (req, res) => {
  try {
    const subjects = await Subject.find().lean();
    const chapters = await Chapter.find().populate('subject', 'name classLevel').lean();

    res.render("admin/homework-create", {
      title: "Create Homework",
      user: { role: "admin" },
      subjects,
      chapters
    });
  } catch (error) {
    console.error(error);
    res.redirect('/admin/homework');
  }
});

// Create homework
router.post("/homework", isAuth, isAdmin, uploadHomework.array("attachments", 10), async (req, res) => {
  try {
    const { title, subject, chapter, description, dueDate, maxMarks, isActive } = req.body;

    // Validation
    if (!title || !subject || !description || !dueDate || !maxMarks) {
      return res.redirect('/admin/homework/create');
    }

    const subjectDoc = await Subject.findById(subject);
    if (!subjectDoc) {
      return res.redirect('/admin/homework/create');
    }

    const homeworkData = {
      title,
      subject: subject,
      chapter: chapter || null,
      description,
      dueDate: new Date(dueDate),
      maxMarks: parseInt(maxMarks),
      classLevel: subjectDoc.classLevel,
      isActive: isActive !== 'false',
      createdBy: req.session.userId,
      attachments: req.files ? req.files.map(file => file.filename) : []
    };

    await Homework.create(homeworkData);

    // Create submission records for all students in the class
    const students = await User.find({ role: 'student', classLevel: subjectDoc.classLevel });
    const submissions = students.map(student => ({
      homework: homeworkData._id,
      student: student._id,
      status: 'not_submitted'
    }));

    await HomeworkSubmission.insertMany(submissions);

    res.redirect('/admin/homework');
  } catch (error) {
    console.error(error);
    res.redirect('/admin/homework/create');
  }
});

// View homework details
router.get("/homework/:homeworkId", isAuth, isAdmin, async (req, res) => {
  try {
    const homework = await Homework.findById(req.params.homeworkId)
      .populate('subject', 'name classLevel')
      .populate('chapter', 'title')
      .populate('createdBy', 'name')
      .lean();

    if (!homework) return res.redirect('/admin/homework');

    const submissions = await HomeworkSubmission.find({ homework: homework._id })
      .populate('student', 'name')
      .lean();

    const validSubmissions = submissions.filter(sub => sub && sub._id && sub.student && typeof sub.student === 'object' && sub.student.name);

    const totalStudents = await User.countDocuments({ role: 'student', classLevel: homework.classLevel });

    res.render("layouts/main", {
      title: "Homework Details",
      user: { role: "admin" },
      body: `
        <div class="homework-details">
          <div class="page-header">
            <h1><i class="fas fa-book"></i> ${homework.title}</h1>
            <div class="header-actions">
              <a href="/admin/homework" class="btn-secondary">
                <i class="fas fa-arrow-left"></i> Back
              </a>
              <a href="/admin/homework/${homework._id}/edit" class="btn-primary">
                <i class="fas fa-edit"></i> Edit
              </a>
              <form method="POST" action="/admin/homework/${homework._id}/delete" onsubmit="return confirm('Delete this homework and all submissions?');" style="display: inline;">
                <button type="submit" class="btn-danger">
                  <i class="fas fa-trash"></i> Delete
                </button>
              </form>
            </div>
          </div>

          <div class="homework-info">
            <div class="info-grid">
              <div class="info-card">
                <i class="fas fa-graduation-cap"></i>
                <div>
                  <h4>Subject</h4>
                  <p>${homework.subject.name} (STD ${homework.subject.classLevel})</p>
                </div>
              </div>
${homework.chapter ? `<div class="info-card">
                <i class="fas fa-file-alt"></i>
                <div>
                  <h4>Chapter</h4>
                  <p>${homework.chapter.title}</p>
                </div>
              </div>` : ''}
              <div class="info-card">
                <i class="fas fa-calendar"></i>
                <div>
                  <h4>Due Date</h4>
                  <p>${new Date(homework.dueDate).toLocaleString()}</p>
                </div>
              </div>
              <div class="info-card">
                <i class="fas fa-star"></i>
                <div>
                  <h4>Max Marks</h4>
                  <p>${homework.maxMarks}</p>
                </div>
              </div>
            </div>

            <div class="description-section">
              <h3>Description</h3>
              <p>${homework.description}</p>
            </div>

${homework.attachments && homework.attachments.length > 0 ? '<div class="attachments-section"><h3>Attachments</h3><div class="attachments-list">' + homework.attachments.map(file => '<a href="/uploads/homework/' + file + '" target="_blank" class="attachment-link"><i class="fas fa-file"></i> ' + file + '</a>').join('') + '</div></div>' : ''}
          </div>

          <div class="submissions-section">
            <h2>Submissions (${validSubmissions.length}/${totalStudents})</h2>

${validSubmissions.length === 0 ? '<div class="no-submissions"><i class="fas fa-inbox"></i><p>No submissions yet</p></div>' : '<div class="submissions-table-container"><table class="submissions-table"><thead><tr><th>Student</th><th>Status</th><th>Submitted At</th><th>Marks</th><th>Actions</th></tr></thead><tbody>' + validSubmissions.filter(sub => sub && sub.student && sub.student.name && sub._id).map(sub => '<tr><td>' + sub.student.name + '</td><td><span class="status-badge status-' + sub.status.replace('_', '-') + '">' + sub.status.replace('_', ' ').toUpperCase() + '</span></td><td>' + (sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : '-') + '</td><td>' + (sub.marks !== undefined ? sub.marks : '-') + '</td><td>' + (sub.status !== 'not_submitted' ? '<a href="/admin/homework/submission/' + sub._id + '" class="btn-sm btn-primary"><i class="fas fa-eye"></i> View</a>' : '-') + '</td></tr>').join('') + '</tbody></table></div>'}
          </div>
        </div>
      `
    });
  } catch (error) {
    console.error(error);
    res.redirect('/admin/homework');
  }
});

// Edit homework form
router.get("/homework/:homeworkId/edit", isAuth, isAdmin, async (req, res) => {
  try {
    const homework = await Homework.findById(req.params.homeworkId)
      .populate('subject', 'name classLevel')
      .populate('chapter', 'title')
      .lean();

    if (!homework) return res.redirect('/admin/homework');

    const subjects = await Subject.find().lean();
    const chapters = await Chapter.find().populate('subject', 'name classLevel').lean();

    res.render("layouts/main", {
      title: "Edit Homework",
      user: { role: "admin" },
      body: `
        <div class="homework-form-container">
          <div class="page-header">
            <h1><i class="fas fa-edit"></i> Edit Homework Assignment</h1>
            <a href="/admin/homework/${homework._id}" class="btn-secondary">
              <i class="fas fa-arrow-left"></i> Back to Homework
            </a>
          </div>

          <form method="POST" action="/admin/homework/${homework._id}" enctype="multipart/form-data" class="homework-form">
            <div class="form-section">
              <h3>Basic Information</h3>
              <div class="form-row">
                <div class="form-group">
                  <label for="title">Title *</label>
                  <input type="text" id="title" name="title" required placeholder="Homework title" value="${homework.title}" />
                </div>
                <div class="form-group">
                  <label for="subject">Subject *</label>
                  <select id="subject" name="subject" required>
                    <option value="">Select Subject</option>
${subjects.filter(sub => sub && sub._id && sub.classLevel && sub.name).map(sub => '<option value="' + sub._id + '" ' + (homework.subject._id.toString() === sub._id.toString() ? 'selected' : '') + '>STD ' + sub.classLevel + ' - ' + sub.name + '</option>').join("")}
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="chapter">Chapter (Optional)</label>
                  <select id="chapter" name="chapter">
                    <option value="">Select Chapter</option>
${chapters.filter(ch => ch && ch._id && ch.subject && ch.subject._id && ch.subject.name).map(ch => '<option value="' + ch._id + '" data-subject="' + ch.subject._id + '" ' + (homework.chapter && homework.chapter._id.toString() === ch._id.toString() ? 'selected' : '') + '>' + ch.subject.name + ' - ' + ch.title + '</option>').join("")}
                  </select>
                </div>
                <div class="form-group">
                  <label for="maxMarks">Maximum Marks *</label>
                  <input type="number" id="maxMarks" name="maxMarks" required min="1" placeholder="100" value="${homework.maxMarks}" />
                </div>
              </div>

              <div class="form-group">
                <label for="description">Description *</label>
                <textarea id="description" name="description" required rows="4" placeholder="Detailed homework instructions">${homework.description}</textarea>
              </div>
            </div>

            <div class="form-section">
              <h3>Schedule & Settings</h3>
              <div class="form-row">
                <div class="form-group">
                  <label for="dueDate">Due Date *</label>
                  <input type="datetime-local" id="dueDate" name="dueDate" required value="${new Date(homework.dueDate).toISOString().slice(0, 16)}" />
                </div>
                <div class="form-group">
                  <label for="isActive">Status</label>
                  <select id="isActive" name="isActive">
                    <option value="true" ${homework.isActive ? 'selected' : ''}>Active</option>
                    <option value="false" ${!homework.isActive ? 'selected' : ''}>Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="form-section">
              <h3>Attachments</h3>
              <div class="file-upload-section">
                <div class="upload-area" id="uploadArea">
                  <div class="upload-content">
                    <i class="fas fa-cloud-upload-alt upload-icon"></i>
                    <h4>Upload Files</h4>
                    <p>Drag & drop files here or click to browse</p>
                    <input type="file" name="attachments" id="fileInput" multiple accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png" />
                  </div>
                </div>
                <div id="fileList" class="file-list">
                  ${homework.attachments && homework.attachments.length > 0 ? homework.attachments.map(file => '<div class="file-item"><i class="fas fa-file"></i><span>' + file + '</span><button type="button" class="remove-file" onclick="removeAttachment(\'' + file + '\')"><i class="fas fa-times"></i></button></div>').join('') : ''}
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-primary">
                <i class="fas fa-save"></i> Update Homework
              </button>
              <a href="/admin/homework/${homework._id}" class="btn-secondary">Cancel</a>
            </div>
          </form>
        </div>

        <script>
          document.addEventListener('DOMContentLoaded', function() {
            const subjectSelect = document.getElementById('subject');
            const chapterSelect = document.getElementById('chapter');
            const fileInput = document.getElementById('fileInput');
            const uploadArea = document.getElementById('uploadArea');
            const fileList = document.getElementById('fileList');

            // Filter chapters based on selected subject
            subjectSelect.addEventListener('change', function() {
              const selectedSubject = this.value;
              const options = chapterSelect.querySelectorAll('option');

              options.forEach(option => {
                if (option.value === '' || option.dataset.subject === selectedSubject) {
                  option.style.display = 'block';
                } else {
                  option.style.display = 'none';
                }
              });

              chapterSelect.value = '';
            });

            // File upload handling
            uploadArea.addEventListener('click', function() {
              fileInput.click();
            });

            fileInput.addEventListener('change', function(e) {
              handleFiles(e.target.files);
            });

            uploadArea.addEventListener('dragover', function(e) {
              e.preventDefault();
              uploadArea.classList.add('dragover');
            });

            uploadArea.addEventListener('dragleave', function(e) {
              uploadArea.classList.remove('dragover');
            });

            uploadArea.addEventListener('drop', function(e) {
              e.preventDefault();
              uploadArea.classList.remove('dragover');
              handleFiles(e.dataTransfer.files);
            });

            function handleFiles(files) {
              Array.from(files).forEach(file => {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                fileItem.innerHTML = '<i class="fas fa-file"></i><span>' + file.name + '</span><span>(' + formatFileSize(file.size) + ')</span>';
                fileList.appendChild(fileItem);
              });
            }

            function formatFileSize(bytes) {
              if (bytes === 0) return '0 Bytes';
              const k = 1024;
              const sizes = ['Bytes', 'KB', 'MB', 'GB'];
              const i = Math.floor(Math.log(bytes) / Math.log(k));
              return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
            }
          });

          function removeAttachment(filename) {
            if (confirm('Remove this attachment?')) {
              // This would need a separate endpoint to remove attachments
              // For now, just remove from UI
              event.target.closest('.file-item').remove();
            }
          }
        </script>
      `
    });
  } catch (error) {
    console.error(error);
    res.redirect('/admin/homework');
  }
});

// Update homework
router.post("/homework/:homeworkId", isAuth, isAdmin, uploadHomework.array("attachments", 10), async (req, res) => {
  try {
    const { title, subject, chapter, description, dueDate, maxMarks, isActive } = req.body;

    // Validation
    if (!title || !subject || !description || !dueDate || !maxMarks) {
      return res.redirect(`/admin/homework/${req.params.homeworkId}/edit`);
    }

    const subjectDoc = await Subject.findById(subject);
    if (!subjectDoc) {
      return res.redirect(`/admin/homework/${req.params.homeworkId}/edit`);
    }

    const updateData = {
      title,
      subject: subject,
      chapter: chapter || null,
      description,
      dueDate: new Date(dueDate),
      maxMarks: parseInt(maxMarks),
      classLevel: subjectDoc.classLevel,
      isActive: isActive !== 'false'
    };

    // Handle new attachments
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map(file => file.filename);
      updateData.attachments = [...(await Homework.findById(req.params.homeworkId).select('attachments')).attachments, ...newAttachments];
    }

    await Homework.findByIdAndUpdate(req.params.homeworkId, updateData);

    res.redirect(`/admin/homework/${req.params.homeworkId}`);
  } catch (error) {
    console.error(error);
    res.redirect(`/admin/homework/${req.params.homeworkId}/edit`);
  }
});

// Delete homework
router.post("/homework/:homeworkId/delete", isAuth, isAdmin, async (req, res) => {
  try {
    const homeworkId = req.params.homeworkId;

    // Delete all submissions for this homework
    await HomeworkSubmission.deleteMany({ homework: homeworkId });

    // Delete the homework
    await Homework.findByIdAndDelete(homeworkId);

    res.redirect('/admin/homework');
  } catch (error) {
    console.error(error);
    res.redirect('/admin/homework');
  }
});



// View homework submission details
router.get("/homework/submission/:submissionId", isAuth, isAdmin, async (req, res) => {
  try {
    const submission = await HomeworkSubmission.findById(req.params.submissionId)
      .populate('student', 'name')
      .populate({
        path: 'homework',
        populate: [
          { path: 'subject', select: 'name' },
          { path: 'chapter', select: 'title' },
          { path: 'createdBy', select: 'name' }
        ]
      })
      .lean();

    if (!submission) return res.redirect('/admin/homework');

    res.render("layouts/main", {
      title: "Homework Submission",
      user: { role: "admin" },
      body: `
        <div class="submission-details">
          <div class="page-header">
            <h1><i class="fas fa-file-alt"></i> Homework Submission</h1>
            <div class="header-actions">
              <a href="/admin/homework/${submission.homework._id}" class="btn-secondary">
                <i class="fas fa-arrow-left"></i> Back to Homework
              </a>
            </div>
          </div>

          <div class="submission-info">
            <div class="info-grid">
              <div class="info-card">
                <i class="fas fa-user"></i>
                <div>
                  <h4>Student</h4>
                  <p>${submission.student.name}</p>
                </div>
              </div>
              <div class="info-card">
                <i class="fas fa-book"></i>
                <div>
                  <h4>Homework</h4>
                  <p>${submission.homework.title}</p>
                </div>
              </div>
              <div class="info-card">
                <i class="fas fa-calendar"></i>
                <div>
                  <h4>Submitted At</h4>
                  <p>${submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'Not submitted'}</p>
                </div>
              </div>
              <div class="info-card">
                <i class="fas fa-star"></i>
                <div>
                  <h4>Status</h4>
                  <p><span class="status-badge status-${submission.status.replace('_', '-')}">${submission.status.replace('_', ' ').toUpperCase()}</span></p>
                </div>
              </div>
            </div>
          </div>

          ${submission.file ? `
            <div class="submission-file">
              <h3>Submitted File</h3>
              <div class="file-display">
                <a href="/uploads/homework/${submission.file}" target="_blank" class="file-link">
                  <i class="fas fa-file"></i>
                  <span>${submission.file}</span>
                </a>
              </div>
            </div>
          ` : ''}

          <div class="grading-section">
            <h3>Grading</h3>
            <form method="POST" action="/admin/homework/submission/${submission._id}/grade" class="grading-form">
              <div class="form-row">
                <div class="form-group">
                  <label for="marks">Marks (Max: ${submission.homework.maxMarks})</label>
                  <input type="number" id="marks" name="marks" min="0" max="${submission.homework.maxMarks}" value="${submission.marks || ''}" required />
                </div>
                <div class="form-group">
                  <label for="feedback">Feedback (Optional)</label>
                  <textarea id="feedback" name="feedback" rows="3" placeholder="Provide feedback to the student">${submission.feedback || ''}</textarea>
                </div>
              </div>
              <button type="submit" class="btn-primary">
                <i class="fas fa-save"></i> Save Grade
              </button>
            </form>
          </div>
        </div>
      `
    });
  } catch (error) {
    console.error(error);
    res.redirect('/admin/homework');
  }
});

// Grade homework submission
router.post("/homework/submission/:submissionId/grade", isAuth, isAdmin, async (req, res) => {
  try {
    const { marks, feedback } = req.body;
    const submissionId = req.params.submissionId;

    const updateData = {
      marks: parseInt(marks),
      feedback: feedback || '',
      gradedAt: new Date(),
      gradedBy: req.session.userId
    };

    await HomeworkSubmission.findByIdAndUpdate(submissionId, updateData);

    res.redirect(`/admin/homework/submission/${submissionId}`);
  } catch (error) {
    console.error(error);
    res.redirect('/admin/homework');
  }
});

router.post("/notifications", isAuth, isAdmin, async (req, res) => {
  try {
    const { title, message, type, target, classLevel, student } = req.body;

    // Handle channels from form - channels[inApp], channels[push], channels[whatsapp]
    const channels = {
      inApp: req.body['channels[inApp]'] === 'true',
      push: req.body['channels[push]'] === 'true',
      whatsapp: req.body['channels[whatsapp]'] === 'true'
    };

    // Validation
    if (!title || !message) {
      return res.redirect('/admin/notifications?error=Title and message are required');
    }

    if (target === 'class' && !classLevel) {
      return res.redirect('/admin/notifications?error=Please select a class');
    }

    if (target === 'student' && !student) {
      return res.redirect('/admin/notifications?error=Please select a student');
    }

    // Prepare notification data
    const notificationData = {
      title,
      message,
      type: type || 'info',
      channels
    };

    // Map target to notification target format
    if (target === 'all') {
      notificationData.target = { scope: 'all' };
    } else if (target === 'class') {
      notificationData.target = {
        scope: 'class',
        classLevels: [parseInt(classLevel)]
      };
    } else if (target === 'student') {
      notificationData.target = { scope: 'student' };
      if (student) {
        notificationData.student = student;
      }
    }

    // Import notification service
    const notificationService = (await import('../services/notification.service.js')).default;

    // Create and send notification
    const result = await notificationService.createAndSendNotification(notificationData, req.session.userId);

    res.redirect('/admin/notifications?success=1');
  } catch (error) {
    console.error('Error sending notification:', error);
    res.redirect('/admin/notifications?error=Failed to send notification');
  }
});

/* =====================================================
   SEND NOTIFICATION PAGE (Standalone)
===================================================== */
router.get("/send-notification", isAuth, isAdmin, async (req, res) => {
  try {
    // Get notification statistics
    const notificationService = (await import('../services/notification.service.js')).default;
    const stats = await notificationService.getNotificationStats();
    
    // Get today's notifications count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayNotifications = await Notification.countDocuments({
      createdAt: { $gte: today }
    });

    res.render("admin/send-notification", {
      title: "Send Notification",
      user: { role: "admin" },
      activePage: 'notifications',
      totalNotifications: stats.totalNotifications,
      todayNotifications,
      scheduledNotifications: 0, // Could implement scheduling later
      totalStudents: stats.totalUsers
    });
  } catch (error) {
    console.error('Error loading send-notification page:', error);
    res.render("admin/send-notification", {
      title: "Send Notification",
      user: { role: "admin" },
      activePage: 'notifications',
      totalNotifications: 0,
      todayNotifications: 0,
      scheduledNotifications: 0,
      totalStudents: 0
    });
  }
});

router.post("/send-notification", isAuth, isAdmin, async (req, res) => {
  try {
    const { title, message, type, target, classLevel, student } = req.body;

    // Handle channels from form
    const channels = {
      inApp: true, // Always enabled
      push: req.body['channels[push]'] === 'true',
      whatsapp: req.body['channels[whatsapp]'] === 'true'
    };

    // Validation
    if (!title || !message) {
      return res.render("admin/send-notification", {
        title: "Send Notification",
        user: { role: "admin" },
        activePage: 'notifications',
        error: 'Title and message are required'
      });
    }

    if (target === 'class' && !classLevel) {
      return res.render("admin/send-notification", {
        title: "Send Notification",
        user: { role: "admin" },
        activePage: 'notifications',
        error: 'Please select a class'
      });
    }

    if (target === 'student' && !student) {
      return res.render("admin/send-notification", {
        title: "Send Notification",
        user: { role: "admin" },
        activePage: 'notifications',
        error: 'Please select a student'
      });
    }

    // Prepare notification data
    const notificationData = {
      title,
      message,
      type: type || 'info',
      channels
    };

    // Map target to notification target format
    if (target === 'all' || !target) {
      notificationData.target = { scope: 'all' };
    } else if (target === 'class') {
      notificationData.target = {
        scope: 'class',
        classLevels: [parseInt(classLevel)]
      };
    } else if (target === 'student') {
      notificationData.target = { scope: 'student' };
      if (student) {
        notificationData.student = student;
      }
    }

    // Import notification service
    const notificationService = (await import('../services/notification.service.js')).default;

    // Create and send notification
    const result = await notificationService.createAndSendNotification(notificationData, req.session.userId);

    // Get stats for the page
    const stats = await notificationService.getNotificationStats();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayNotifications = await Notification.countDocuments({
      createdAt: { $gte: today }
    });

    res.render("admin/send-notification", {
      title: "Send Notification",
      user: { role: "admin" },
      activePage: 'notifications',
      success: true,
      totalNotifications: stats.totalNotifications,
      todayNotifications,
      scheduledNotifications: 0,
      totalStudents: stats.totalUsers
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.render("admin/send-notification", {
      title: "Send Notification",
      user: { role: "admin" },
      activePage: 'notifications',
      error: 'Failed to send notification: ' + error.message
    });
  }
});

export default router;
