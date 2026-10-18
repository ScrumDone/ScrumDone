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
                .MaximumLength(50);

            RuleFor(c => c.NewPassword)
                .NotEmpty()
                .MinimumLength(8);
        }
    }
}
