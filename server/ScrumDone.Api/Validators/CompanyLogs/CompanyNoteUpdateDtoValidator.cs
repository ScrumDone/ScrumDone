using FluentValidation;
using ScrumDone.Api.DTOs.Companies;

namespace ScrumDone.Api.Validators.Companies
{
    public sealed class CompanyLogUpdateDtoValidator : AbstractValidator<CooperationLogUpdateDto>
    {
        public CompanyLogUpdateDtoValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty()
                .MaximumLength(50);

            RuleFor(x => x.Description)
                .MaximumLength(400);

            RuleFor(x => x.OldValue)
                .MaximumLength(100);

            RuleFor(x => x.NewValue)
                .MaximumLength(100);
        }
    }
}
