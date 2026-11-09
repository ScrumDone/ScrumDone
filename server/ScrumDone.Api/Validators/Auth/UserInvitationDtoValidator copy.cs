using FluentValidation;
using ScrumDone.Api.DTOs.Auth;

namespace ScrumDone.Api.Validators.Auth
{
    public class UserAddRolesDtoValidator : AbstractValidator<UserAddRolesDto>
    {
        public UserAddRolesDtoValidator()
        {
            RuleFor(x => x.RolesIds)
                .NotEmpty();
        }
    }
}
