using FluentValidation;
using ScrumDone.Api.DTOs.Auth;

namespace ScrumDone.Api.Validators.Auth
{
    public sealed class UserRegistrationDtoValidator : AbstractValidator<UserRegistrationDto>
    {
        public UserRegistrationDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty()
                .MaximumLength(50);

            RuleFor(x => x.Password)
                .NotEmpty()
                .MaximumLength(128);

            RuleFor(x => x.Token)
                .NotEmpty()
                .MaximumLength(1024);
        }
    }
}
            