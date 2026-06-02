using FluentValidation;
using ScrumDone.Api.DTOs.Companies;

namespace ScrumDone.Api.Validators.Companies
{
    internal sealed class CompanyUpdateDtoValidator : AbstractValidator<CompanyUpdateDto>
    {
        public CompanyUpdateDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty()
                .MaximumLength(200)
                .When(x => x.Name is not null);

            RuleFor(x => x.Nip)
                .Length(10)
                .When(x => x.Nip is not null);

            RuleFor(x => x.Krs)
                .Length(10)
                .When(x => x.Krs is not null);

            RuleFor(x => x.Regon)
                .Must(r => r!.Length == 9 || r!.Length == 14)
                .When(x => x.Regon is not null);

            RuleFor(x => x.Address)
                .MaximumLength(500)
                .When(x => x.Address is not null);
        }
    }
}
