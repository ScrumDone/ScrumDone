using FluentValidation;
using ScrumDone.Api.DTOs.Assignments;
using ScrumDone.Api.DTOs.Companies;

namespace ScrumDone.Api.Validators.Assignments;

public sealed class AssignmentUpdateDtoValidator : AbstractValidator<AssignmentUpdateDto>
{
    public AssignmentUpdateDtoValidator()
    {
        RuleFor(x => x.Name)
        .NotEmpty()
        .MaximumLength(100)
        .When(x =>
                x.SetProperties.Contains(nameof(AssignmentUpdateDto.Name)));

        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .When(x =>
                x.SetProperties.Contains(nameof(AssignmentUpdateDto.Description)));

        RuleFor(x => x.TimeEstimate)
            .LessThanOrEqualTo(100)
            .When(x =>
                x.SetProperties.Contains(nameof(AssignmentUpdateDto.TimeEstimate)));

        //RuleFor(x => x.DueDate)
        //    .Must(d => d == null || d > DateTimeOffset.UtcNow.AddDays(-1))
        //    .When(x => x.SetProperties.Contains(nameof(AssignmentUpdateDto.DueDate)));

        RuleFor(x => x.StatusId)
            .NotEmpty()
            .When(x => x.SetProperties.Contains(nameof(AssignmentUpdateDto.StatusId)));
    }
}