// Controller: StudentsController
// Purpose: Handles CRUD operations for student profiles, duplicate roll/email validation, and department filtering.

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs;
using server.Models;

namespace server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StudentsController : ControllerBase
{
    private readonly AppDbContext _context;

    public StudentsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/students
    [HttpGet]
    public async Task<ActionResult<IEnumerable<StudentDto>>> GetStudents()
    {
        var students = await _context.Students
            .AsNoTracking()
            .OrderBy(s => s.RollNumber)
            .Select(s => new StudentDto
            {
                StudentId = s.StudentId,
                RollNumber = s.RollNumber,
                FullName = s.FullName,
                Email = s.Email,
                Department = s.Department
            })
            .ToListAsync();

        return Ok(students);
    }

    // POST: api/students
    [HttpPost]
    public async Task<ActionResult<StudentDto>> CreateStudent([FromBody] CreateStudentDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Unique validation for RollNumber
        if (await _context.Students.AnyAsync(s => s.RollNumber.ToLower() == dto.RollNumber.Trim().ToLower()))
        {
            return BadRequest(new { message = $"Roll Number '{dto.RollNumber}' is already in use." });
        }

        // Unique validation for Email
        if (await _context.Students.AnyAsync(s => s.Email.ToLower() == dto.Email.Trim().ToLower()))
        {
            return BadRequest(new { message = $"Email '{dto.Email}' is already registered." });
        }

        var student = new Student
        {
            RollNumber = dto.RollNumber.Trim(),
            FullName = dto.FullName.Trim(),
            Email = dto.Email.Trim(),
            Department = dto.Department.Trim()
        };

        _context.Students.Add(student);
        await _context.SaveChangesAsync();

        var resultDto = new StudentDto
        {
            StudentId = student.StudentId,
            RollNumber = student.RollNumber,
            FullName = student.FullName,
            Email = student.Email,
            Department = student.Department
        };

        return CreatedAtAction(nameof(GetStudents), new { id = student.StudentId }, resultDto);
    }

    // PUT: api/students/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateStudent(int id, [FromBody] UpdateStudentDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var student = await _context.Students.FindAsync(id);
        if (student == null)
            return NotFound(new { message = $"Student with ID {id} not found." });

        // Unique check for RollNumber excluding self
        if (await _context.Students.AnyAsync(s => s.RollNumber.ToLower() == dto.RollNumber.Trim().ToLower() && s.StudentId != id))
        {
            return BadRequest(new { message = $"Roll Number '{dto.RollNumber}' is already in use by another student." });
        }

        // Unique check for Email excluding self
        if (await _context.Students.AnyAsync(s => s.Email.ToLower() == dto.Email.Trim().ToLower() && s.StudentId != id))
        {
            return BadRequest(new { message = $"Email '{dto.Email}' is already registered to another student." });
        }

        student.RollNumber = dto.RollNumber.Trim();
        student.FullName = dto.FullName.Trim();
        student.Email = dto.Email.Trim();
        student.Department = dto.Department.Trim();

        await _context.SaveChangesAsync();
        return Ok(new { message = "Student updated successfully." });
    }

    // DELETE: api/students/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteStudent(int id)
    {
        var student = await _context.Students.FindAsync(id);
        if (student == null)
            return NotFound(new { message = $"Student with ID {id} not found." });

        _context.Students.Remove(student);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Student deleted successfully." });
    }
}

