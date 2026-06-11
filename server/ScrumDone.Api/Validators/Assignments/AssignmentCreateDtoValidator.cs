using FluentValidation;
using ScrumDone.Api.DTOs.Assignments;

namespace ScrumDone.Api.Validators.Assignments;

public sealed class AssignmentCreateDtoValidator : AbstractValidator<AssignmentCreateDto>
{
    public AssignmentCreateDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.Description)
            .MaximumLength(1000);

        RuleFor(x => x.TimeEstimate)
            .LessThanOrEqualTo(100)
            .When(x => x.TimeEstimate.HasValue);

        RuleFor(x => x.DueDate)
            .Must(d => d!.Value > DateTimeOffset.UtcNow)
            .When(x => x.DueDate.HasValue);

        RuleFor(x => new AssignmentAssigneesUpdateDto
        {
            UserIds = x.AssigneeIds.ToList()
        })
        .SetValidator(new AssignmentAssigneesUpdateDtoValidator());

        RuleFor(x => new AssignmentLabelsUpdateDto
        {
            LabelIds = x.LabelIds.ToList()
        })
        .SetValidator(new AssignmentLabelsUpdateDtoValidator());
    }
}