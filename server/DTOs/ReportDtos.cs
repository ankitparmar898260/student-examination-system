namespace server.DTOs;

public class StudentListReportDto
{
    public int StudentId { get; set; }
    public string RollNumber { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
}

public class ExamSubjectReportDto
{
    public int SubjectId { get; set; }
    public string SubjectCode { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public int MaxMarks { get; set; }
    public int PassMarks { get; set; }
}

public class EnrollmentListReportDto
{
    public int EnrollmentId { get; set; }
    public string RollNumber { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
}

public class MarksSheetSubjectDto
{
    public string SubjectCode { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public int MaxMarks { get; set; }
    public int PassMarks { get; set; }
    public decimal? MarksObtained { get; set; }
    public string Status { get; set; } = "Missing"; // Pass, Fail, Missing
}

public class MarksSheetReportDto
{
    public string StudentName { get; set; } = string.Empty;
    public string RollNumber { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string ExamName { get; set; } = string.Empty;
    public string AcademicYear { get; set; } = string.Empty;
    public List<MarksSheetSubjectDto> Subjects { get; set; } = new();
    public int TotalMaxMarks { get; set; }
    public decimal TotalObtained { get; set; }
    public decimal? Percentage { get; set; }
    public string OverallResult { get; set; } = string.Empty; // Pass, Fail, Incomplete
}

public class ExamResultItemDto
{
    public int? Rank { get; set; }
    public string RollNumber { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public decimal? TotalObtained { get; set; }
    public int TotalMaxMarks { get; set; }
    public decimal? Percentage { get; set; }
    public string OverallResult { get; set; } = string.Empty; // Pass, Fail, Incomplete
}

public class SubjectWiseReportDto
{
    public int SubjectId { get; set; }
    public string SubjectCode { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public decimal HighestMarks { get; set; }
    public decimal AverageMarks { get; set; }
    public int FailedCount { get; set; }
    public int FailedStudentsCount
    {
        get => FailedCount;
        set => FailedCount = value;
    }
    public int TotalEvaluatedCount { get; set; }
}

public class MissingMarksReportDto
{
    public int EnrollmentId { get; set; }
    public string RollNumber { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string SubjectCode { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
}

