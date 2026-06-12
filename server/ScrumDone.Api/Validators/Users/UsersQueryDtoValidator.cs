using FluentValidation;
using ScrumDone.Api.DTOs.Companies;
using ScrumDone.Api.DTOs.Users;

namespace ScrumDone.Api.Validators.Companies
{
    public sealed class UserQueryDtoValidator : AbstractValidator<UserQueryDto>
    {
        public UserQueryDtoValidator()
        {
            RuleFor(x => x.Page)
                .GreaterThanOrEqualTo(1);

            RuleFor(x => x.Limit)
                .InclusiveBetween(1, 100);
        }
    }
}
