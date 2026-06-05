using FluentValidation;
using ScrumDone.Api.DTOs.Companies;

namespace ScrumDone.Api.Validators.Companies
{
    public sealed class CompanyNoteUpdateDtoValidator : AbstractValidator<CompanyNoteUpdateDto>
    {
        public CompanyNoteUpdateDtoValidator()
        {
            RuleFor(x => x.Content)
                .NotEmpty()
                .MaximumLength(1000);
        }
    }
}
