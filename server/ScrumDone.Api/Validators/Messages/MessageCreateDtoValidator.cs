using FluentValidation;
using ScrumDone.Api.DTOs.Messages;

namespace ScrumDone.Api.Validators.Companies
{
    public sealed class MessageCreateDtoValidator : AbstractValidator<MessageCreateDto>
    {
        public MessageCreateDtoValidator()
        {
            RuleFor(x => x.Text)
                .NotEmpty()
                .MaximumLength(1000);
        }
    }
}
