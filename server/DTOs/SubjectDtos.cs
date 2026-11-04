using System.ComponentModel.DataAnnotations;

namespace server.DTOs;

public class CreateSubjectDto
{
    [Required(ErrorMessage = "Subject Code is required")]
    [MaxLength(50)]
    public string SubjectCode { get; set; } = string.Empty;

    [Required(ErrorMessage = "Subject Name is required")]
    [MaxLength(150)]
    public string SubjectName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Max Marks is required")]
    [Range(1, int.MaxValue, ErrorMessage = "Max Marks must be greater than 0")]
    public int MaxMarks { get; set; }

    [Required(ErrorMessage = "Pass Marks is required")]
    [Range(1, int.MaxValue, ErrorMessage = "Pass Marks must be greater than 0")]
    public int PassMarks { get; set; }
}

public class UpdateSubjectDto : CreateSubjectDto
{
}

public class SubjectDto
{
    public int SubjectId { get; set; }
    public string SubjectCode { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public int MaxMarks { get; set; }
    public int PassMarks { get; set; }
}

