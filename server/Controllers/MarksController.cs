using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs;
using server.Models;

namespace server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MarksController : ControllerBase
{
    private readonly AppDbContext _context;

    public MarksController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/marks?examId=1&subjectId=1
    [HttpGet]
    public async Task<ActionResult<IEnumerable<StudentMarksGridItemDto>>> GetMarksGrid(
        [FromQuery] int examId, 
        [FromQuery] int subjectId)
    {
        if (examId <= 0 || subjectId <= 0)
            return BadRequest(new { message = "Valid ExamId and SubjectId are required." });

        // Verify subject belongs to the exam
        var isSubjectInExam = await _context.ExamSubjects
            .AsNoTracking()
            .AnyAsync(es => es.ExamId == examId && es.SubjectId == subjectId);

        if (!isSubjectInExam)
        {
            return BadRequest(new { message = "The selected subject does not belong to this exam." });
        }

        // Get all enrolled students for this exam
        var enrollments = await _context.StudentExamEnrollments
            .AsNoTracking()
            .Where(e => e.ExamId == examId)
            .Include(e => e.Student)
            .OrderBy(e => e.Student!.RollNumber)
            .ToListAsync();

        // Get existing marks for this subject
        var existingMarks = await _context.StudentMarks
            .AsNoTracking()
            .Where(sm => sm.SubjectId == subjectId && enrollments.Select(e => e.EnrollmentId).Contains(sm.EnrollmentId))
            .ToDictionaryAsync(sm => sm.EnrollmentId, sm => sm.MarksObtained);

        var gridItems = enrollments.Select(e => new StudentMarksGridItemDto
        {
            EnrollmentId = e.EnrollmentId,
            StudentId = e.StudentId,
            RollNumber = e.Student!.RollNumber,
            FullName = e.Student.FullName,
            MarksObtained = existingMarks.ContainsKey(e.EnrollmentId) ? existingMarks[e.EnrollmentId] : null
        }).ToList();

        return Ok(gridItems);
    }

    // POST: api/marks/bulk
    [HttpPost("bulk")]
    public async Task<IActionResult> SaveMarksBulk([FromBody] BulkMarksEntryDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (dto.Marks == null || dto.Marks.Count == 0)
        {
            return BadRequest(new { message = "Marks entry list cannot be empty." });
        }

        if (dto.Marks.Select(m => m.EnrollmentId).Distinct().Count() != dto.Marks.Count)
        {
            return BadRequest(new { message = "Duplicate students found in marks entry." });
        }

        // 1. Verify subject belongs to the exam
        var isSubjectInExam = await _context.ExamSubjects
            .AnyAsync(es => es.ExamId == dto.ExamId && es.SubjectId == dto.SubjectId);

        if (!isSubjectInExam)
        {
            return BadRequest(new { message = "The selected subject does not belong to this exam." });
        }

        // 2. Fetch subject to check MaxMarks
        var subject = await _context.Subjects.FindAsync(dto.SubjectId);
        if (subject == null)
            return NotFound(new { message = "Subject not found." });

        // 3. Validate marks range (0 to MaxMarks) for every row
        foreach (var item in dto.Marks)
        {
            if (item.MarksObtained < 0 || item.MarksObtained > subject.MaxMarks)
            {
                return BadRequest(new { message = $"Marks must be between 0 and {subject.MaxMarks}." });
            }
        }

        // 4. Fetch valid enrollment IDs for this exam
        var validEnrollmentIds = await _context.StudentExamEnrollments
            .Where(e => e.ExamId == dto.ExamId)
            .Select(e => e.EnrollmentId)
            .ToListAsync();

        var entryEnrollmentIds = dto.Marks.Select(m => m.EnrollmentId).ToList();
        var existingMarksList = await _context.StudentMarks
            .Where(sm => sm.SubjectId == dto.SubjectId && entryEnrollmentIds.Contains(sm.EnrollmentId))
            .ToListAsync();

        foreach (var item in dto.Marks)
        {
            if (!validEnrollmentIds.Contains(item.EnrollmentId))
            {
                return BadRequest(new { message = $"Enrollment ID {item.EnrollmentId} is not valid for this exam." });
            }

            var existing = existingMarksList.FirstOrDefault(sm => sm.EnrollmentId == item.EnrollmentId);
            if (existing != null)
            {
                existing.MarksObtained = item.MarksObtained;
            }
            else
            {
                _context.StudentMarks.Add(new StudentMark
                {
                    EnrollmentId = item.EnrollmentId,
                    SubjectId = dto.SubjectId,
                    MarksObtained = item.MarksObtained
                });
            }
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "All marks saved successfully." });
    }
}
