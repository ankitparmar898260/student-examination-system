using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs;
using server.Models;

namespace server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SubjectsController : ControllerBase
{
    private readonly AppDbContext _context;

    public SubjectsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/subjects
    [HttpGet]
    public async Task<ActionResult<IEnumerable<SubjectDto>>> GetSubjects()
    {
        var subjects = await _context.Subjects
            .AsNoTracking()
            .OrderBy(s => s.SubjectCode)
            .Select(s => new SubjectDto
            {
                SubjectId = s.SubjectId,
                SubjectCode = s.SubjectCode,
                SubjectName = s.SubjectName,
                MaxMarks = s.MaxMarks,
                PassMarks = s.PassMarks
            })
            .ToListAsync();

        return Ok(subjects);
    }

    // POST: api/subjects
    [HttpPost]
    public async Task<ActionResult<SubjectDto>> CreateSubject([FromBody] CreateSubjectDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (dto.PassMarks > dto.MaxMarks)
        {
            return BadRequest(new { message = "PassMarks cannot exceed MaxMarks." });
        }

        var subject = new Subject
        {
            SubjectCode = dto.SubjectCode.Trim(),
            SubjectName = dto.SubjectName.Trim(),
            MaxMarks = dto.MaxMarks,
            PassMarks = dto.PassMarks
        };

        _context.Subjects.Add(subject);
        await _context.SaveChangesAsync();

        var resultDto = new SubjectDto
        {
            SubjectId = subject.SubjectId,
            SubjectCode = subject.SubjectCode,
            SubjectName = subject.SubjectName,
            MaxMarks = subject.MaxMarks,
            PassMarks = subject.PassMarks
        };

        return CreatedAtAction(nameof(GetSubjects), new { id = subject.SubjectId }, resultDto);
    }

    // PUT: api/subjects/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSubject(int id, [FromBody] UpdateSubjectDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (dto.PassMarks > dto.MaxMarks)
        {
            return BadRequest(new { message = "PassMarks cannot exceed MaxMarks." });
        }

        var subject = await _context.Subjects.FindAsync(id);
        if (subject == null)
            return NotFound(new { message = $"Subject with ID {id} not found." });

        subject.SubjectCode = dto.SubjectCode.Trim();
        subject.SubjectName = dto.SubjectName.Trim();
        subject.MaxMarks = dto.MaxMarks;
        subject.PassMarks = dto.PassMarks;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Subject updated successfully." });
    }

    // DELETE: api/subjects/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSubject(int id)
    {
        var subject = await _context.Subjects.FindAsync(id);
        if (subject == null)
            return NotFound(new { message = $"Subject with ID {id} not found." });

        _context.Subjects.Remove(subject);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Subject deleted successfully." });
    }
}

