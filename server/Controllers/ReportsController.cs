using System.Globalization;
using System.Text;
using CsvHelper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs;

namespace server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReportsController(AppDbContext context)
    {
        _context = context;
    }

    // 1. Student list with department filter and search
    // GET: api/reports/student-list?department=CS&search=rahul
    [HttpGet("student-list")]
    public async Task<ActionResult<IEnumerable<StudentListReportDto>>> GetStudentListReport(
        [FromQuery] string? department,
        [FromQuery] string? search)
    {
        var query = _context.Students.AsQueryable();

        if (!string.IsNullOrWhiteSpace(department) && department != "All")
        {
            query = query.Where(s => s.Department.ToLower() == department.Trim().ToLower());
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var sTerm = search.Trim().ToLower();
            query = query.Where(s => s.FullName.ToLower().Contains(sTerm) || 
                                     s.RollNumber.ToLower().Contains(sTerm) || 
                                     s.Email.ToLower().Contains(sTerm));
        }

        var list = await query
            .OrderBy(s => s.RollNumber)
            .Select(s => new StudentListReportDto
            {
                StudentId = s.StudentId,
                RollNumber = s.RollNumber,
                FullName = s.FullName,
                Email = s.Email,
                Department = s.Department
            })
            .ToListAsync();

        return Ok(list);
    }

    // Distinct departments for filter dropdown
    [HttpGet("departments")]
    public async Task<ActionResult<IEnumerable<string>>> GetDepartments()
    {
        var departments = await _context.Students
            .Select(s => s.Department)
            .Distinct()
            .OrderBy(d => d)
            .ToListAsync();

        return Ok(departments);
    }

    // 2. Exam-wise subject list
    // GET: api/reports/exam-subjects?examId=1
    [HttpGet("exam-subjects")]
    public async Task<ActionResult<IEnumerable<ExamSubjectReportDto>>> GetExamSubjectListReport([FromQuery] int examId)
    {
        if (examId <= 0)
            return BadRequest(new { message = "Valid ExamId is required." });

        var subjects = await _context.ExamSubjects
            .Where(es => es.ExamId == examId)
            .Include(es => es.Subject)
            .OrderBy(es => es.Subject!.SubjectCode)
            .Select(es => new ExamSubjectReportDto
            {
                SubjectId = es.SubjectId,
                SubjectCode = es.Subject!.SubjectCode,
                SubjectName = es.Subject.SubjectName,
                MaxMarks = es.Subject.MaxMarks,
                PassMarks = es.Subject.PassMarks
            })
            .ToListAsync();

        return Ok(subjects);
    }

    // 3. Exam-wise enrollment list
    // GET: api/reports/enrollment-list?examId=1
    [HttpGet("enrollment-list")]
    public async Task<ActionResult<IEnumerable<EnrollmentListReportDto>>> GetEnrollmentListReport([FromQuery] int examId)
    {
        if (examId <= 0)
            return BadRequest(new { message = "Valid ExamId is required." });

        var list = await _context.StudentExamEnrollments
            .Where(e => e.ExamId == examId)
            .Include(e => e.Student)
            .OrderBy(e => e.Student!.RollNumber)
            .Select(e => new EnrollmentListReportDto
            {
                EnrollmentId = e.EnrollmentId,
                RollNumber = e.Student!.RollNumber,
                FullName = e.Student.FullName,
                Email = e.Student.Email,
                Department = e.Student.Department
            })
            .ToListAsync();

        return Ok(list);
    }

    // 4. Student marks sheet: subject-wise marks with Pass or Fail, total, and percentage
    // GET: api/reports/marks-sheet?examId=1&studentId=1
    [HttpGet("marks-sheet")]
    public async Task<ActionResult<MarksSheetReportDto>> GetStudentMarksSheet(
        [FromQuery] int examId, 
        [FromQuery] int studentId)
    {
        if (examId <= 0 || studentId <= 0)
            return BadRequest(new { message = "Valid ExamId and StudentId are required." });

        var exam = await _context.Exams.FindAsync(examId);
        if (exam == null)
            return NotFound(new { message = "Exam not found." });

        var enrollment = await _context.StudentExamEnrollments
            .Include(e => e.Student)
            .FirstOrDefaultAsync(e => e.ExamId == examId && e.StudentId == studentId);

        if (enrollment == null)
            return NotFound(new { message = "Student is not enrolled in this exam." });

        // Get all subjects assigned to this exam
        var examSubjects = await _context.ExamSubjects
            .Where(es => es.ExamId == examId)
            .Include(es => es.Subject)
            .OrderBy(es => es.Subject!.SubjectCode)
            .Select(es => es.Subject!)
            .ToListAsync();

        // Get marks entered for this student in this enrollment
        var marksDict = await _context.StudentMarks
            .Where(sm => sm.EnrollmentId == enrollment.EnrollmentId)
            .ToDictionaryAsync(sm => sm.SubjectId, sm => sm.MarksObtained);

        var reportSubjects = new List<MarksSheetSubjectDto>();
        int totalMaxMarks = 0;
        decimal totalObtained = 0;
        bool hasMissingMarks = false;
        bool hasFailedSubject = false;

        foreach (var sub in examSubjects)
        {
            totalMaxMarks += sub.MaxMarks;
            decimal? obtained = marksDict.ContainsKey(sub.SubjectId) ? marksDict[sub.SubjectId] : null;

            string status;
            if (obtained == null)
            {
                status = "Missing";
                hasMissingMarks = true;
            }
            else
            {
                totalObtained += obtained.Value;
                if (obtained.Value >= sub.PassMarks)
                {
                    status = "Pass";
                }
                else
                {
                    status = "Fail";
                    hasFailedSubject = true;
                }
            }

            reportSubjects.Add(new MarksSheetSubjectDto
            {
                SubjectCode = sub.SubjectCode,
                SubjectName = sub.SubjectName,
                MaxMarks = sub.MaxMarks,
                PassMarks = sub.PassMarks,
                MarksObtained = obtained,
                Status = status
            });
        }

        // Business rules:
        // - A subject is passed when MarksObtained >= PassMarks.
        // - An exam is passed only when every subject of that exam is passed.
        // - Percentage = total marks obtained / total MaxMarks x 100.
        // - A student with missing marks must not show as Pass.
        string overallResult;
        decimal? percentage = null;

        if (hasMissingMarks)
        {
            overallResult = "Incomplete";
        }
        else if (hasFailedSubject)
        {
            overallResult = "Fail";
            percentage = totalMaxMarks > 0 ? Math.Round((totalObtained / totalMaxMarks) * 100, 2) : 0;
        }
        else
        {
            overallResult = "Pass";
            percentage = totalMaxMarks > 0 ? Math.Round((totalObtained / totalMaxMarks) * 100, 2) : 0;
        }

        var report = new MarksSheetReportDto
        {
            StudentName = enrollment.Student!.FullName,
            RollNumber = enrollment.Student.RollNumber,
            Department = enrollment.Student.Department,
            ExamName = exam.ExamName,
            AcademicYear = exam.AcademicYear,
            Subjects = reportSubjects,
            TotalMaxMarks = totalMaxMarks,
            TotalObtained = totalObtained,
            Percentage = percentage,
            OverallResult = overallResult
        };

        return Ok(report);
    }

    // 5. Exam result list: all students with total, percentage, overall Pass or Fail, and rank
    // GET: api/reports/exam-result?examId=1
    [HttpGet("exam-result")]
    public async Task<ActionResult<IEnumerable<ExamResultItemDto>>> GetExamResultList([FromQuery] int examId)
    {
        if (examId <= 0)
            return BadRequest(new { message = "Valid ExamId is required." });

        var results = await BuildExamResultsAsync(examId);
        return Ok(results);
    }

    // CSV Export for Report 5
    // GET: api/reports/exam-result/export?examId=1
    [HttpGet("exam-result/export")]
    public async Task<IActionResult> ExportExamResultCSV([FromQuery] int examId)
    {
        if (examId <= 0)
            return BadRequest(new { message = "Valid ExamId is required." });

        var results = await BuildExamResultsAsync(examId);

        var sb = new StringBuilder();
        sb.AppendLine("Rank,RollNumber,FullName,Department,TotalObtained,TotalMaxMarks,Percentage,OverallResult");

        foreach (var r in results)
        {
            var rankStr = r.Rank.HasValue ? r.Rank.Value.ToString() : "-";
            var obtainedStr = r.TotalObtained.HasValue ? r.TotalObtained.Value.ToString("F2") : "-";
            var pctStr = r.Percentage.HasValue ? $"{r.Percentage.Value:F2}%" : "-";

            sb.AppendLine($"\"{rankStr}\",\"{r.RollNumber}\",\"{r.FullName}\",\"{r.Department}\",\"{obtainedStr}\",\"{r.TotalMaxMarks}\",\"{pctStr}\",\"{r.OverallResult}\"");
        }

        return File(Encoding.UTF8.GetBytes(sb.ToString()), "text/csv", $"ExamResult_Exam_{examId}.csv");
    }

    // 6. Subject-wise report: highest marks, average marks, and number of failed students
    // GET: api/reports/subject-wise?examId=1
    [HttpGet("subject-wise")]
    public async Task<ActionResult<IEnumerable<SubjectWiseReportDto>>> GetSubjectWiseReport([FromQuery] int examId)
    {
        if (examId <= 0)
            return BadRequest(new { message = "Valid ExamId is required." });

        // Get all subjects of this exam
        var examSubjects = await _context.ExamSubjects
            .Where(es => es.ExamId == examId)
            .Include(es => es.Subject)
            .ToListAsync();

        var enrollments = await _context.StudentExamEnrollments
            .Where(e => e.ExamId == examId)
            .Select(e => e.EnrollmentId)
            .ToListAsync();

        var report = new List<SubjectWiseReportDto>();

        foreach (var es in examSubjects)
        {
            var marks = await _context.StudentMarks
                .Where(sm => sm.SubjectId == es.SubjectId && enrollments.Contains(sm.EnrollmentId))
                .ToListAsync();

            decimal highest = marks.Any() ? marks.Max(m => m.MarksObtained) : 0;
            decimal average = marks.Any() ? Math.Round(marks.Average(m => m.MarksObtained), 2) : 0;
            int failed = marks.Count(m => m.MarksObtained < es.Subject!.PassMarks);

            report.Add(new SubjectWiseReportDto
            {
                SubjectId = es.SubjectId,
                SubjectCode = es.Subject!.SubjectCode,
                SubjectName = es.Subject.SubjectName,
                HighestMarks = highest,
                AverageMarks = average,
                FailedCount = failed,
                FailedStudentsCount = failed,
                TotalEvaluatedCount = marks.Count
            });
        }

        return Ok(report.OrderBy(r => r.SubjectCode));
    }

    // 7. Missing marks report: enrolled students with no marks for an exam subject
    // GET: api/reports/missing-marks?examId=1
    [HttpGet("missing-marks")]
    public async Task<ActionResult<IEnumerable<MissingMarksReportDto>>> GetMissingMarksReport([FromQuery] int examId)
    {
        if (examId <= 0)
            return BadRequest(new { message = "Valid ExamId is required." });

        var examSubjects = await _context.ExamSubjects
            .Where(es => es.ExamId == examId)
            .Include(es => es.Subject)
            .ToListAsync();

        var enrollments = await _context.StudentExamEnrollments
            .Where(e => e.ExamId == examId)
            .Include(e => e.Student)
            .ToListAsync();

        var enrollmentIds = enrollments.Select(e => e.EnrollmentId).ToList();
        var existingMarks = await _context.StudentMarks
            .Where(sm => enrollmentIds.Contains(sm.EnrollmentId))
            .ToListAsync();

        var missingList = new List<MissingMarksReportDto>();

        foreach (var enrollment in enrollments)
        {
            foreach (var es in examSubjects)
            {
                bool hasMark = existingMarks.Any(sm => sm.EnrollmentId == enrollment.EnrollmentId && sm.SubjectId == es.SubjectId);
                if (!hasMark)
                {
                    missingList.Add(new MissingMarksReportDto
                    {
                        EnrollmentId = enrollment.EnrollmentId,
                        RollNumber = enrollment.Student!.RollNumber,
                        FullName = enrollment.Student.FullName,
                        Department = enrollment.Student.Department,
                        SubjectCode = es.Subject!.SubjectCode,
                        SubjectName = es.Subject.SubjectName
                    });
                }
            }
        }

        return Ok(missingList.OrderBy(m => m.RollNumber).ThenBy(m => m.SubjectCode));
    }

    // Helper method to compute exam results with ranks and business rules
    private async Task<List<ExamResultItemDto>> BuildExamResultsAsync(int examId)
    {
        var examSubjects = await _context.ExamSubjects
            .Where(es => es.ExamId == examId)
            .Include(es => es.Subject)
            .Select(es => es.Subject!)
            .ToListAsync();

        int totalMaxMarks = examSubjects.Sum(s => s.MaxMarks);

        var enrollments = await _context.StudentExamEnrollments
            .Where(e => e.ExamId == examId)
            .Include(e => e.Student)
            .ToListAsync();

        var enrollmentIds = enrollments.Select(e => e.EnrollmentId).ToList();
        var allMarks = await _context.StudentMarks
            .Where(sm => enrollmentIds.Contains(sm.EnrollmentId))
            .ToListAsync();

        var items = new List<ExamResultItemDto>();

        foreach (var enrollment in enrollments)
        {
            var studentMarks = allMarks.Where(m => m.EnrollmentId == enrollment.EnrollmentId).ToList();

            bool hasMissing = false;
            bool hasFailed = false;
            decimal totalObtained = 0;

            foreach (var sub in examSubjects)
            {
                var mark = studentMarks.FirstOrDefault(m => m.SubjectId == sub.SubjectId);
                if (mark == null)
                {
                    hasMissing = true;
                }
                else
                {
                    totalObtained += mark.MarksObtained;
                    if (mark.MarksObtained < sub.PassMarks)
                    {
                        hasFailed = true;
                    }
                }
            }

            string overallResult;
            decimal? percentage = null;
            decimal? finalTotal = null;

            // Business Rules:
            // - A subject is passed when MarksObtained >= PassMarks.
            // - An exam is passed only when every subject of that exam is passed.
            // - Percentage = total marks obtained / total MaxMarks x 100.
            // - A student with missing marks must not show as Pass.
            if (hasMissing)
            {
                overallResult = "Incomplete";
            }
            else if (hasFailed)
            {
                overallResult = "Fail";
                finalTotal = totalObtained;
                percentage = totalMaxMarks > 0 ? Math.Round((totalObtained / totalMaxMarks) * 100, 2) : 0;
            }
            else
            {
                overallResult = "Pass";
                finalTotal = totalObtained;
                percentage = totalMaxMarks > 0 ? Math.Round((totalObtained / totalMaxMarks) * 100, 2) : 0;
            }

            items.Add(new ExamResultItemDto
            {
                Rank = null, // will compute below
                RollNumber = enrollment.Student!.RollNumber,
                FullName = enrollment.Student.FullName,
                Department = enrollment.Student.Department,
                TotalObtained = finalTotal,
                TotalMaxMarks = totalMaxMarks,
                Percentage = percentage,
                OverallResult = overallResult
            });
        }

        // Rank Calculation:
        // Rank 1, 2, 3... based on TotalObtained DESC (only for Pass students, or ordered list)
        var passedStudents = items
            .Where(i => i.OverallResult == "Pass" && i.TotalObtained.HasValue)
            .OrderByDescending(i => i.TotalObtained!.Value)
            .ToList();

        int currentRank = 1;
        foreach (var p in passedStudents)
        {
            p.Rank = currentRank++;
        }

        // Return ordered: Passed with rank first (by Rank ASC), then Fail, then Incomplete
        return items
            .OrderBy(i => i.OverallResult == "Pass" ? 0 : i.OverallResult == "Fail" ? 1 : 2)
            .ThenBy(i => i.Rank ?? int.MaxValue)
            .ThenBy(i => i.RollNumber)
            .ToList();
    }
}
