// Model: ExamSubject (ExamSubjects Table)
// Purpose: Maps which subjects are included in a specific exam (Many-to-Many relationship).

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace server.Models;

[Index(nameof(ExamId), nameof(SubjectId), IsUnique = true)]
public class ExamSubject
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int ExamSubjectId { get; set; }

    [Required]
    public int ExamId { get; set; }

    [Required]
    public int SubjectId { get; set; }

    // Foreign Keys
    [ForeignKey(nameof(ExamId))]
    public Exam? Exam { get; set; }

    [ForeignKey(nameof(SubjectId))]
    public Subject? Subject { get; set; }
}

