using FluentValidation;
using ScrumDone.Api.DTOs.Companies;

namespace ScrumDone.Api.Validators.Companies
{
    public sealed class CompanyLogCreateDtoValidator : AbstractValidator<CooperationLogCreateDto>
    {
        public CompanyLogCreateDtoValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty()
                .MaximumLength(100);

            RuleFor(x => x.Description)
                .MaximumLength(1000);

            RuleFor(x => x.OldValue)
                .MaximumLength(200);

            RuleFor(x => x.NewValue)
                .MaximumLength(200);
        }
    }
}
