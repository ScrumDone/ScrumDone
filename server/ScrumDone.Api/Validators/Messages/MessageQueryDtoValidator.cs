using FluentValidation;
using ScrumDone.Api.DTOs.Messages;

namespace ScrumDone.Api.Validators.Companies
{
    public sealed class MessageQueryDtoValidator : AbstractValidator<MessagesQueryDto>
    {
        public MessageQueryDtoValidator() 
        {
            RuleFor(x => x.Page)
                .GreaterThanOrEqualTo(1);

            RuleFor(x => x.Limit)
                .InclusiveBetween(1, 100);
        }
    }
}
