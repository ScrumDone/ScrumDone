using FluentValidation;
using ScrumDone.Api.DTOs.Companies;

namespace ScrumDone.Api.Validators.Companies
{
    public sealed class CompanyNoteQueryDtoValidator : AbstractValidator<CompanyNoteQueryDto>
    {
        public CompanyNoteQueryDtoValidator() 
        {
            RuleFor(x => x.Page)
                .GreaterThanOrEqualTo(1);

            RuleFor(x => x.Limit)
                .InclusiveBetween(1, 100);
        }
    }
}
