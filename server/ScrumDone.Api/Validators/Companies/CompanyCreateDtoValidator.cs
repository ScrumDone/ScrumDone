using FluentValidation;
using ScrumDone.Api.DTOs.Companies;

namespace ScrumDone.Api.Validators.Companies
{
    public sealed class CompanyCreateDtoValidator : AbstractValidator<CompanyCreateDto>
    {
        // try allowing different validation than regex
        public CompanyCreateDtoValidator()
        {
            RuleFor(x => x.Name)
                .MinimumLength(1)
                .MaximumLength(200);

            RuleFor(x => x.Nip)
                .Length(10)
                .When(x => x.Nip is not null);

            RuleFor(x => x.Krs)
                .Length(10)
                .When(x => x.Krs is not null);

            RuleFor(x => x.Regon)
                .Matches(@"^\d{9}(\d{5})?$")
                .When(x => x.Regon is not null);

            RuleFor(x => x.Address)
                .MaximumLength(500)
                .When(x => x.Address is not null);
        }
    }
}
