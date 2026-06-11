using FluentValidation;
using ScrumDone.Api.DTOs.Projects;

namespace ScrumDone.Api.Validators.Projects
{
    public sealed class TeamMembersQueryDtoValidator : AbstractValidator<TeamMembersQueryDto>
    {
        public TeamMembersQueryDtoValidator() 
        {
            RuleFor(x => x.Page)
                .GreaterThanOrEqualTo(1);

            RuleFor(x => x.Limit)
                .InclusiveBetween(1, 100);
        }
    }
}
