using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace server.Models;

[Index(nameof(EnrollmentId), nameof(SubjectId), IsUnique = true)]
public class StudentMark
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int MarkId { get; set; }

    [Required]
    public int EnrollmentId { get; set; }

    [Required]
    public int SubjectId { get; set; }

    [Required]
    [Column(TypeName = "decimal(8,2)")]
    public decimal MarksObtained { get; set; }

    // Foreign Keys
    [ForeignKey(nameof(EnrollmentId))]
    public StudentExamEnrollment? Enrollment { get; set; }

    [ForeignKey(nameof(SubjectId))]
    public Subject? Subject { get; set; }
}

