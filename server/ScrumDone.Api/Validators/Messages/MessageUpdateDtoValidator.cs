using FluentValidation;
using ScrumDone.Api.DTOs.Messages;

namespace ScrumDone.Api.Validators.Companies
{
    public sealed class MessageUpdateDtoValidator : AbstractValidator<MessageUpdateDto>
    {
        public MessageUpdateDtoValidator()
        {
            RuleFor(x => x.Text)
                .NotEmpty()
                .MaximumLength(1000);
        }
    }
}
