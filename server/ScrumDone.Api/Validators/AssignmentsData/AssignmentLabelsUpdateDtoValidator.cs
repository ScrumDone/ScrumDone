using FluentValidation;
using ScrumDone.Api.DTOs.Assignments;

namespace ScrumDone.Api.Validators.Assignments;

public sealed class AssignmentLabelsUpdateDtoValidator : AbstractValidator<AssignmentLabelsUpdateDto>
{
    public const int MaxLabels = 20;

    public AssignmentLabelsUpdateDtoValidator()
    {
        RuleForEach(x => x.LabelIds)
            .NotEqual(Guid.Empty);

        RuleFor(x => x.LabelIds)
            .Must(ids => ids.Distinct().Count() == ids.Count);

        RuleFor(x => x.LabelIds)
            .Must(ids => ids.Count <= MaxLabels);
    }
}