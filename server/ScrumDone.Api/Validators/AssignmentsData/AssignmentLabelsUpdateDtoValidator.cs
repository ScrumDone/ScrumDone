using FluentValidation;
using ScrumDone.Api.DTOs.Assignments;

namespace ScrumDone.Api.Validators.Assignments;

public sealed class AssignmentLabelsUpdateDtoValidator : AbstractValidator<AssignmentLabelsUpdateDto>
{
    public AssignmentLabelsUpdateDtoValidator()
    {
        RuleFor(a => a.LabelIds)
            .NotEmpty();
    }
}