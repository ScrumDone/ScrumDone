using FluentValidation;
using ScrumDone.Api.DTOs.Assignments;

namespace ScrumDone.Api.Validators.Assignments;

public sealed class AssignmentAssigneesUpdateDtoValidator : AbstractValidator<AssignmentAssigneesUpdateDto>
{
    public const int MaxAssignees = 20;

    public AssignmentAssigneesUpdateDtoValidator()
    {
        RuleForEach(x => x.UserIds)
            .NotEqual(Guid.Empty);

        RuleFor(x => x.UserIds)
            .Must(ids => ids.Distinct().Count() == ids.Count);

        RuleFor(x => x.UserIds)
            .Must(ids => ids.Count <= MaxAssignees);
    }
}