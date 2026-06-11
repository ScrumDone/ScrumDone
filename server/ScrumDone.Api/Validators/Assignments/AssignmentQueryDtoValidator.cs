using FluentValidation;
using ScrumDone.Api.DTOs.Assignments;

namespace ScrumDone.Api.Validators.Assignments;

public sealed class AssignmentQueryDtoValidator : AbstractValidator<AssignmentQueryDto>
{
    public AssignmentQueryDtoValidator()
    {
        RuleFor(x => x.Page)
                .GreaterThanOrEqualTo(1);

        RuleFor(x => x.Limit)
            .InclusiveBetween(1, 100);

        RuleFor(x => x.DueOnOrAfter)
            .LessThanOrEqualTo(x => x.DueOnOrBefore!.Value)
            .When(x => x.DueOnOrAfter.HasValue && x.DueOnOrBefore.HasValue);
    }
}