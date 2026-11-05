// Model: StudentExamEnrollment (StudentExamEnrollments Table)
// Purpose: Records which students are enrolled to appear in a specific exam.

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace server.Models;

[Index(nameof(StudentId), nameof(ExamId), IsUnique = true)]
public class StudentExamEnrollment
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int EnrollmentId { get; set; }

    [Required]
    public int StudentId { get; set; }

    [Required]
    public int ExamId { get; set; }

    // Foreign Keys
    [ForeignKey(nameof(StudentId))]
    public Student? Student { get; set; }

    [ForeignKey(nameof(ExamId))]
    public Exam? Exam { get; set; }

    // Navigation property
    public ICollection<StudentMark> StudentMarks { get; set; } = new List<StudentMark>();
}

