using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs;
using server.Models;

namespace server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EnrollmentController : ControllerBase
{
    private readonly AppDbContext _context;

    public EnrollmentController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/enrollment?examId=1
    [HttpGet]
    public async Task<ActionResult<IEnumerable<EnrolledStudentDto>>> GetEnrolledStudents([FromQuery] int examId)
    {
        if (examId <= 0)
            return BadRequest(new { message = "Valid ExamId is required." });

        var enrolled = await _context.StudentExamEnrollments
            .Where(e => e.ExamId == examId)
            .Include(e => e.Student)
            .OrderBy(e => e.Student!.RollNumber)
            .Select(e => new EnrolledStudentDto
            {
                EnrollmentId = e.EnrollmentId,
                StudentId = e.StudentId,
                RollNumber = e.Student!.RollNumber,
                FullName = e.Student.FullName,
                Email = e.Student.Email,
                Department = e.Student.Department
            })
            .ToListAsync();

        return Ok(enrolled);
    }

    // GET: api/enrollment/available?examId=1
    [HttpGet("available")]
    public async Task<ActionResult<IEnumerable<AvailableStudentDto>>> GetAvailableStudents([FromQuery] int examId)
    {
        if (examId <= 0)
            return BadRequest(new { message = "Valid ExamId is required." });

        // Get student IDs already enrolled in this exam
        var enrolledStudentIds = await _context.StudentExamEnrollments
            .Where(e => e.ExamId == examId)
            .Select(e => e.StudentId)
            .ToListAsync();

        // Get students not yet enrolled
        var available = await _context.Students
            .Where(s => !enrolledStudentIds.Contains(s.StudentId))
            .OrderBy(s => s.RollNumber)
            .Select(s => new AvailableStudentDto
            {
                StudentId = s.StudentId,
                RollNumber = s.RollNumber,
                FullName = s.FullName,
                Department = s.Department
            })
            .ToListAsync();

        return Ok(available);
    }

    // POST: api/enrollment
    [HttpPost]
    public async Task<IActionResult> EnrollStudents([FromBody] CreateEnrollmentDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var examExists = await _context.Exams.AnyAsync(e => e.ExamId == dto.ExamId);
        if (!examExists)
            return NotFound(new { message = $"Exam with ID {dto.ExamId} not found." });

        if (dto.StudentIds == null || dto.StudentIds.Count == 0)
            return BadRequest(new { message = "Please select at least one student to enroll." });

        // Check already enrolled student IDs to prevent duplicate enrollment
        var alreadyEnrolledIds = await _context.StudentExamEnrollments
            .Where(e => e.ExamId == dto.ExamId && dto.StudentIds.Contains(e.StudentId))
            .Select(e => e.StudentId)
            .ToListAsync();

        var newStudentIds = dto.StudentIds.Distinct().Except(alreadyEnrolledIds).ToList();

        if (newStudentIds.Count == 0)
        {
            return BadRequest(new { message = "All selected students are already enrolled in this exam." });
        }

        foreach (var studentId in newStudentIds)
        {
            _context.StudentExamEnrollments.Add(new StudentExamEnrollment
            {
                ExamId = dto.ExamId,
                StudentId = studentId
            });
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = $"{newStudentIds.Count} student(s) successfully enrolled.",
            skippedCount = alreadyEnrolledIds.Count
        });
    }
}

