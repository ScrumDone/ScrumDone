using FluentValidation;
using ScrumDone.Api.DTOs.Users;

namespace ScrumDone.Api.Validators.Users
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
