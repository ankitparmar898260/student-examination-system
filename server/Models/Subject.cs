using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.Models;

public class Subject
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int SubjectId { get; set; }

    [Required]
    [MaxLength(50)]
    public string SubjectCode { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string SubjectName { get; set; } = string.Empty;

    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "MaxMarks must be greater than 0")]
    public int MaxMarks { get; set; }

    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "PassMarks must be greater than 0")]
    public int PassMarks { get; set; }

    // Navigation properties
    public ICollection<ExamSubject> ExamSubjects { get; set; } = new List<ExamSubject>();
    public ICollection<StudentMark> StudentMarks { get; set; } = new List<StudentMark>();
}

