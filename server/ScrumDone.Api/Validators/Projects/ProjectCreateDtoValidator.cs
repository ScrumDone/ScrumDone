using FluentValidation;
using ScrumDone.Api.DTOs.Companies;
using ScrumDone.Api.DTOs.Projects;

namespace ScrumDone.Api.Validators.Projects
{
    public sealed class ProjectCreateDtoValidator : AbstractValidator<ProjectCreateDto>
    {
        public ProjectCreateDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty()
                .MinimumLength(1)
                .MaximumLength(200);

            RuleFor(x => x.Description)
                .MaximumLength(1000);

            RuleFor(x => x.HexColor)
                .Matches("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
                .When(x => x is not null);

            RuleFor(x => x.ExpectedFinishDate)
                .GreaterThanOrEqualTo(x => x.StartDate)
                .When(x => x.StartDate.HasValue && x.ExpectedFinishDate.HasValue);

            RuleFor(x => x.StartDate)
                .LessThanOrEqualTo(x => x.ExpectedFinishDate)
                .When(x => x.StartDate.HasValue && x.ExpectedFinishDate.HasValue);
        }
    }
}
