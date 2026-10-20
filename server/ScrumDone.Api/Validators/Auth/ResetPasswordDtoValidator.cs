using FluentValidation;
using ScrumDone.Api.DTOs.Auth;

namespace ScrumDone.Api.Validators.Auth
{
    public class ResetPasswordDtoValidator : AbstractValidator<ResetPasswordDto>
    {
        public ResetPasswordDtoValidator()
        {
            RuleFor(c => c.Email)
                .NotEmpty()
                .EmailAddress()
                .MaximumLength(128);

            RuleFor(c => c.NewPassword)
                .NotEmpty()
                .MaximumLength(128);

            RuleFor(c => c.Token)
                .NotEmpty()
                .MaximumLength(1024);
        }
    }
}
