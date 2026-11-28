using FluentValidation;
using ScrumDone.Api.DTOs.Users;

namespace ScrumDone.Api.Validators.Companies
{
    public sealed class UserUpdateDtoValidator : AbstractValidator<UserUpdateDto>
    {
        public UserUpdateDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty()
                .When(x => x.SetProperties.Contains(nameof(UserUpdateDto.Name)));
        }
    }
}
