using FluentValidation;
using ScrumDone.Api.DTOs.Companies;

namespace ScrumDone.Api.Validators.Companies
{
    internal sealed class CompanyQueryDtoValidator : AbstractValidator<CompanyQueryDto>
    {
        public CompanyQueryDtoValidator() 
        {
            RuleFor(x => x.Page)
                .GreaterThanOrEqualTo(1);

            RuleFor(x => x.Limit)
                .InclusiveBetween(1, 100);
        }
    }
}
