using FluentValidation;
using ScrumDone.Api.DTOs.Projects;

namespace ScrumDone.Api.Validators.Projects
{
    public sealed class ProjectUpdateDtoValidator : AbstractValidator<DTOs.Projects.ProjectUpdateDto>
    {
        public ProjectUpdateDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotNull()
                .NotEmpty()
                .MinimumLength(1)
                .MaximumLength(200)
                // when in setProperties (when to be updated)
                .When(x =>
                    x.SetProperties.Contains(nameof(ProjectUpdateDto.Name)));

            RuleFor(x => x.Description)
                .MaximumLength(1000)
                .When(x => x.SetProperties.Contains(nameof(ProjectUpdateDto.Description)));

            RuleFor(x => x.IsSetToScrum)
                .NotNull()
                .When(x => x.SetProperties.Contains(nameof(ProjectUpdateDto.IsSetToScrum)));

            // cannot check if dates make sense in validator
        }
    }
}
