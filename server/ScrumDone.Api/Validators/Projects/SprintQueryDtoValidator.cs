using FluentValidation;
using ScrumDone.Api.DTOs.Projects;
using ScrumDone.Api.DTOs.Sprints;

namespace ScrumDone.Api.Validators.Projects
{
    public sealed class SprintQueryDtoValidator : AbstractValidator<SprintQueryDto>
    {
        public SprintQueryDtoValidator() 
        {
            RuleFor(x => x.Page)
                .GreaterThanOrEqualTo(1);

            RuleFor(x => x.Limit)
                .InclusiveBetween(1, 100);
        }
    }
}
