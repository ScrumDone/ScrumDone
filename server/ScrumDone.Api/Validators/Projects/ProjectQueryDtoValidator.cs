using FluentValidation;
using ScrumDone.Api.DTOs.Projects;

namespace ScrumDone.Api.Validators.Projects
{
    public sealed class ProjectQueryDtoValidator : AbstractValidator<ProjectQueryDto>
    {
        public ProjectQueryDtoValidator() 
        {
            RuleFor(x => x.Page)
                .GreaterThanOrEqualTo(1);

            RuleFor(x => x.Limit)
                .InclusiveBetween(1, 100);
        }
    }
}
