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
                .MaximumLength(100)
                .When(x => x.SetProperties.Contains(nameof(CooperationLogUpdateDto.Title)));

            RuleFor(x => x.Description)
                .MaximumLength(1000);

            RuleFor(x => x.OldValue)
                .MaximumLength(200);

            RuleFor(x => x.NewValue)
                .MaximumLength(200);
        }
    }
}
