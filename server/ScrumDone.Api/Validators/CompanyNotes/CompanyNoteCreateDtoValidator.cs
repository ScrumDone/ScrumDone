using FluentValidation;
using ScrumDone.Api.DTOs.Companies;

namespace ScrumDone.Api.Validators.Companies
{
    public sealed class CompanyNoteCreateDtoValidator : AbstractValidator<CompanyNoteCreateDto>
    {
        public CompanyNoteCreateDtoValidator()
        {
            RuleFor(x => x.Content)
                .NotEmpty()
                .MaximumLength(1000);
        }
    }
}
