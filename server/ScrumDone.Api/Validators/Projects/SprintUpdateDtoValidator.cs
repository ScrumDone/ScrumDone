using FluentValidation;
using ScrumDone.Api.DTOs.Companies;
using ScrumDone.Api.DTOs.Projects;
using ScrumDone.Api.DTOs.Sprints;

namespace ScrumDone.Api.Validators.Projects
{
    public sealed class SprintUpdateDtoValidator : AbstractValidator<SprintUpdateDto>
    {
        public SprintUpdateDtoValidator()
        {
            RuleFor(x => x.Name)
                .MaximumLength(200)
                .When(x =>
                    x.SetProperties.Contains(nameof(SprintUpdateDto.Name)));

            RuleFor(x => x.EndDate)
                .GreaterThanOrEqualTo(x => x.StartDate)
                .When(x => x.StartDate.HasValue && x.EndDate.HasValue);
        }
    }
}
