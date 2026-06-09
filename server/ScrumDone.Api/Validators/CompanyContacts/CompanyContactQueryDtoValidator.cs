using FluentValidation;
using ScrumDone.Api.DTOs.Companies;

namespace ScrumDone.Api.Validators.Companies
{
    public sealed class CompanyContactQueryDtoValidator : AbstractValidator<ContactPersonQueryDto>
    {
        public CompanyContactQueryDtoValidator() 
        {
            RuleFor(x => x.Page)
                .GreaterThanOrEqualTo(1);

            RuleFor(x => x.Limit)
                .InclusiveBetween(1, 100);
        }
    }
}
