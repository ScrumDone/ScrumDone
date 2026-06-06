using FluentValidation;
using ScrumDone.Api.DTOs.Companies;

namespace ScrumDone.Api.Validators.Companies
{
    public sealed class CompanyUpdateDtoValidator : AbstractValidator<CompanyUpdateDto>
    {
        public CompanyUpdateDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotNull() // name is required so can't be deleted
                .MinimumLength(1)
                .MaximumLength(200)
                // when in setProperties (when to be updated)
                .When(x =>
                    x.SetProperties.Contains(nameof(CompanyUpdateDto.Name)));

            RuleFor(x => x.Nip)
                .Length(10)
                .When(x => x.SetProperties.Contains(nameof(CompanyUpdateDto.Nip)));

            RuleFor(x => x.Krs)
                .Length(10)
                .When(x => x.SetProperties.Contains(nameof(CompanyUpdateDto.Krs)));

            RuleFor(x => x.Regon)
                .Matches(@"^\d{9}(\d{5})?$")
                .When(x => x.SetProperties.Contains(nameof(CompanyUpdateDto.Regon)));

            RuleFor(x => x.Address)
                .MaximumLength(500)
                .When(x => x.SetProperties.Contains(nameof(CompanyUpdateDto.Address)));
        }
    }
}
