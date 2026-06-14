using FluentValidation;
using ScrumDone.Api.DTOs.Companies;
using ScrumDone.Api.DTOs.Projects;
using ScrumDone.Api.DTOs.Sprints;

namespace ScrumDone.Api.Validators.Projects
{
    public sealed class SprintCreateDtoValidator : AbstractValidator<SprintCreateDto>
    {
        public SprintCreateDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty()
                .MaximumLength(200);

            RuleFor(x => x.EndDate)
                .NotNull()
                .GreaterThan(x => x.StartDate);

            RuleFor(x => x.StartDate)
                .NotNull();
        }
    }
}
