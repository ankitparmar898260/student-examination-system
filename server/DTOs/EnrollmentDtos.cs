using System.ComponentModel.DataAnnotations;

namespace server.DTOs;

public class CreateEnrollmentDto
{
    [Required(ErrorMessage = "Exam is required")]
    public int ExamId { get; set; }

    [Required(ErrorMessage = "At least one student must be selected")]
    [MinLength(1, ErrorMessage = "At least one student must be selected")]
    public List<int> StudentIds { get; set; } = new();
}

public class EnrolledStudentDto
{
    public int EnrollmentId { get; set; }
    public int StudentId { get; set; }
    public string RollNumber { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
}

public class AvailableStudentDto
{
    public int StudentId { get; set; }
    public string RollNumber { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
}

