// DTOs: Student Data Transfer Objects
// Purpose: Defines request/response models for student registration, profile updates, and detail responses.

using System.ComponentModel.DataAnnotations;

namespace server.DTOs;

public class CreateStudentDto
{
    [Required(ErrorMessage = "Roll Number is required")]
    [MaxLength(50)]
    public string RollNumber { get; set; } = string.Empty;

    [Required(ErrorMessage = "Full Name is required")]
    [MaxLength(150)]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Department is required")]
    [MaxLength(100)]
    public string Department { get; set; } = string.Empty;
}

public class UpdateStudentDto : CreateStudentDto
{
}

public class StudentDto
{
    public int StudentId { get; set; }
    public string RollNumber { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
}

