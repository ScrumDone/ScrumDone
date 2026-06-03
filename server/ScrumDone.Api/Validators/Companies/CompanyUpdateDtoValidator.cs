using FluentValidation;
using ScrumDone.Api.DTOs.Companies;

namespace ScrumDone.Api.Validators.Companies
{
    public sealed class CompanyUpdateDtoValidator : AbstractValidator<CompanyUpdateDto>
    {
        public CompanyUpdateDtoValidator()
        {
            RuleFor(x => x.Name)
                .MaximumLength(200)
                .When(x => x.Name is not null);

            RuleFor(x => x.Nip)
                .Length(10)
                .When(x => x.Nip is not null);

            RuleFor(x => x.Krs)
                .Length(10)
                .When(x => x.Krs is not null);

            RuleFor(x => x.Regon)
                .Matches(@"^\d{9}(\d{5})?$")  // 9 digits or 14 digits
                .When(x => x.Regon is not null);

            RuleFor(x => x.Address)
                .MaximumLength(500)
                .When(x => x.Address is not null);
        }
    }
}
