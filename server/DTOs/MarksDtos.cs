// DTOs: Marks Data Transfer Objects
// Purpose: Defines request/response models for marks entry grid items and bulk marks submission.

using System.ComponentModel.DataAnnotations;

namespace server.DTOs;

public class StudentMarksGridItemDto
{
    public int EnrollmentId { get; set; }
    public int StudentId { get; set; }
    public string RollNumber { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public decimal? MarksObtained { get; set; }
}

public class MarkEntryItemDto
{
    [Required]
    public int EnrollmentId { get; set; }

    [Required]
    [Range(0, double.MaxValue, ErrorMessage = "Marks must be 0 or greater")]
    public decimal MarksObtained { get; set; }
}

public class BulkMarksEntryDto
{
    [Required]
    public int ExamId { get; set; }

    [Required]
    public int SubjectId { get; set; }

    [Required]
    public List<MarkEntryItemDto> Marks { get; set; } = new();
}

