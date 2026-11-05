// Controller: ExamsController
// Purpose: Handles CRUD operations for exams and mapping/managing subjects assigned to an exam.

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs;
using server.Models;

namespace server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExamsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ExamsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/exams
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ExamListDto>>> GetExams()
    {
        var exams = await _context.Exams
            .AsNoTracking()
            .Include(e => e.ExamSubjects)
            .OrderByDescending(e => e.ExamId)
            .Select(e => new ExamListDto
            {
                ExamId = e.ExamId,
                ExamName = e.ExamName,
                AcademicYear = e.AcademicYear,
                SubjectCount = e.ExamSubjects.Count
            })
            .ToListAsync();

        return Ok(exams);
    }

    // GET: api/exams/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<ExamDetailDto>> GetExam(int id)
    {
        var exam = await _context.Exams
            .AsNoTracking()
            .Include(e => e.ExamSubjects)
            .FirstOrDefaultAsync(e => e.ExamId == id);

        if (exam == null)
            return NotFound(new { message = $"Exam with ID {id} not found." });

        var dto = new ExamDetailDto
        {
            ExamId = exam.ExamId,
            ExamName = exam.ExamName,
            AcademicYear = exam.AcademicYear,
            SubjectIds = exam.ExamSubjects.Select(es => es.SubjectId).ToList()
        };

        return Ok(dto);
    }

    // GET: api/exams/{id}/subjects
    [HttpGet("{id}/subjects")]
    public async Task<ActionResult<IEnumerable<SubjectDto>>> GetExamSubjects(int id)
    {
        var subjects = await _context.ExamSubjects
            .AsNoTracking()
            .Where(es => es.ExamId == id)
            .Include(es => es.Subject)
            .Select(es => new SubjectDto
            {
                SubjectId = es.Subject!.SubjectId,
                SubjectCode = es.Subject.SubjectCode,
                SubjectName = es.Subject.SubjectName,
                MaxMarks = es.Subject.MaxMarks,
                PassMarks = es.Subject.PassMarks
            })
            .OrderBy(s => s.SubjectCode)
            .ToListAsync();

        return Ok(subjects);
    }

    // POST: api/exams
    [HttpPost]
    public async Task<ActionResult<ExamDetailDto>> CreateExam([FromBody] CreateExamDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (dto.SubjectIds == null || dto.SubjectIds.Count == 0)
        {
            return BadRequest(new { message = "At least one subject must be assigned to the exam." });
        }

        // Validate that all subject IDs exist
        var existingSubjectCount = await _context.Subjects
            .Where(s => dto.SubjectIds.Contains(s.SubjectId))
            .CountAsync();

        if (existingSubjectCount != dto.SubjectIds.Distinct().Count())
        {
            return BadRequest(new { message = "One or more selected subjects do not exist." });
        }

        var exam = new Exam
        {
            ExamName = dto.ExamName.Trim(),
            AcademicYear = dto.AcademicYear.Trim()
        };

        exam.ExamSubjects ??= new List<ExamSubject>();
        foreach (var subjectId in dto.SubjectIds.Distinct())
        {
            exam.ExamSubjects.Add(new ExamSubject
            {
                SubjectId = subjectId
            });
        }

        _context.Exams.Add(exam);
        await _context.SaveChangesAsync();

        var resultDto = new ExamDetailDto
        {
            ExamId = exam.ExamId,
            ExamName = exam.ExamName,
            AcademicYear = exam.AcademicYear,
            SubjectIds = dto.SubjectIds.Distinct().ToList()
        };

        return CreatedAtAction(nameof(GetExam), new { id = exam.ExamId }, resultDto);
    }

    // PUT: api/exams/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateExam(int id, [FromBody] UpdateExamDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (dto.SubjectIds == null || dto.SubjectIds.Count == 0)
        {
            return BadRequest(new { message = "At least one subject must be assigned to the exam." });
        }

        var exam = await _context.Exams
            .Include(e => e.ExamSubjects)
            .FirstOrDefaultAsync(e => e.ExamId == id);

        if (exam == null)
            return NotFound(new { message = $"Exam with ID {id} not found." });

        // Validate that all subject IDs exist
        var existingSubjectCount = await _context.Subjects
            .Where(s => dto.SubjectIds.Contains(s.SubjectId))
            .CountAsync();

        if (existingSubjectCount != dto.SubjectIds.Distinct().Count())
        {
            return BadRequest(new { message = "One or more selected subjects do not exist." });
        }

        // Check if any removed subject already has marks entered for this exam
        var currentSubjectIds = exam.ExamSubjects.Select(es => es.SubjectId).ToList();
        var newSubjectIds = dto.SubjectIds.Distinct().ToList();
        var removedSubjectIds = currentSubjectIds.Except(newSubjectIds).ToList();

        if (removedSubjectIds.Count > 0)
        {
            var subjectsWithMarksIds = await _context.StudentMarks
                .Where(sm => sm.Enrollment!.ExamId == id && removedSubjectIds.Contains(sm.SubjectId))
                .Select(sm => sm.SubjectId)
                .Distinct()
                .ToListAsync();

            if (subjectsWithMarksIds.Count > 0)
            {
                var subjectDetails = await _context.Subjects
                    .Where(s => subjectsWithMarksIds.Contains(s.SubjectId))
                    .Select(s => $"{s.SubjectName} ({s.SubjectCode})")
                    .ToListAsync();

                var subjectNames = subjectDetails.Count > 0 ? string.Join(", ", subjectDetails) : string.Join(", ", subjectsWithMarksIds);
                return BadRequest(new { message = $"Cannot remove subject(s) that already have marks entered for this exam: {subjectNames}." });
            }
        }

        exam.ExamName = dto.ExamName.Trim();
        exam.AcademicYear = dto.AcademicYear.Trim();

        // Remove old mappings and add new mappings
        _context.ExamSubjects.RemoveRange(exam.ExamSubjects);

        foreach (var subjectId in newSubjectIds)
        {
            _context.ExamSubjects.Add(new ExamSubject
            {
                ExamId = exam.ExamId,
                SubjectId = subjectId
            });
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Exam updated successfully." });
    }
}
