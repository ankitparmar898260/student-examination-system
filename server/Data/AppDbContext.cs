using Microsoft.EntityFrameworkCore;
using server.Models;

namespace server.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Student> Students => Set<Student>();
    public DbSet<Subject> Subjects => Set<Subject>();
    public DbSet<Exam> Exams => Set<Exam>();
    public DbSet<ExamSubject> ExamSubjects => Set<ExamSubject>();
    public DbSet<StudentExamEnrollment> StudentExamEnrollments => Set<StudentExamEnrollment>();
    public DbSet<StudentMark> StudentMarks => Set<StudentMark>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Subjects validation constraint: PassMarks <= MaxMarks
        modelBuilder.Entity<Subject>()
            .ToTable(t => t.HasCheckConstraint("chk_passmarks", "PassMarks <= MaxMarks"));

        // Cascade deletes configuration
        modelBuilder.Entity<ExamSubject>()
            .HasOne(es => es.Exam)
            .WithMany(e => e.ExamSubjects)
            .HasForeignKey(es => es.ExamId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ExamSubject>()
            .HasOne(es => es.Subject)
            .WithMany(s => s.ExamSubjects)
            .HasForeignKey(es => es.SubjectId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<StudentExamEnrollment>()
            .HasOne(see => see.Student)
            .WithMany(s => s.Enrollments)
            .HasForeignKey(see => see.StudentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<StudentExamEnrollment>()
            .HasOne(see => see.Exam)
            .WithMany(e => e.Enrollments)
            .HasForeignKey(see => see.ExamId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<StudentMark>()
            .HasOne(sm => sm.Enrollment)
            .WithMany(see => see.StudentMarks)
            .HasForeignKey(sm => sm.EnrollmentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<StudentMark>()
            .HasOne(sm => sm.Subject)
            .WithMany(s => s.StudentMarks)
            .HasForeignKey(sm => sm.SubjectId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

