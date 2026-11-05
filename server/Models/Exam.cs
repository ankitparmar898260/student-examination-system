// Model: Exam (Exams Table)
// Purpose: Stores exam metadata such as Exam Name and Academic Year.

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.Models;

public class Exam
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int ExamId { get; set; }

    [Required]
    [MaxLength(150)]
    public string ExamName { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string AcademicYear { get; set; } = string.Empty;

    // Navigation properties
    public ICollection<ExamSubject> ExamSubjects { get; set; } = new List<ExamSubject>();
    public ICollection<StudentExamEnrollment> Enrollments { get; set; } = new List<StudentExamEnrollment>();
}

