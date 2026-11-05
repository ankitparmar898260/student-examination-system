// DTOs: Exam Data Transfer Objects
// Purpose: Defines request/response models for creating, updating, and viewing exams with their assigned subjects.

using System.ComponentModel.DataAnnotations;

namespace server.DTOs;

public class CreateExamDto
{
    [Required(ErrorMessage = "Exam Name is required")]
    [MaxLength(150)]
    public string ExamName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Academic Year is required")]
    [MaxLength(20)]
    public string AcademicYear { get; set; } = string.Empty;

    [Required(ErrorMessage = "At least one subject must be selected")]
    [MinLength(1, ErrorMessage = "At least one subject must be selected")]
    public List<int> SubjectIds { get; set; } = new();
}

public class UpdateExamDto : CreateExamDto
{
}

public class ExamListDto
{
    public int ExamId { get; set; }
    public string ExamName { get; set; } = string.Empty;
    public string AcademicYear { get; set; } = string.Empty;
    public int SubjectCount { get; set; }
}

public class ExamDetailDto
{
    public int ExamId { get; set; }
    public string ExamName { get; set; } = string.Empty;
    public string AcademicYear { get; set; } = string.Empty;
    public List<int> SubjectIds { get; set; } = new();
}

