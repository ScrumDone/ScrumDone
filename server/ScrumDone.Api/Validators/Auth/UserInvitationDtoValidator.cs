using FluentValidation;
using ScrumDone.Api.DTOs.Auth;

namespace ScrumDone.Api.Validators.Auth
{
    public class UserInvitationDtoValidator : AbstractValidator<UserInvitationDto>
    {
        public UserInvitationDtoValidator()
        {
            RuleFor(x => x.UserName)
                .MinimumLength(1)
                .MaximumLength(50);

            RuleFor(c => c.Email)
                .NotEmpty()
                .EmailAddress()
                .MaximumLength(128);
        }
    }
}
