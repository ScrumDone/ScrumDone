using FluentValidation;
using Microsoft.AspNetCore.Routing.Constraints;
using ScrumDone.Api.DTOs.Companies;

namespace ScrumDone.Api.Validators.Companies
{
    public sealed class CompanyContactCreateDtoValidator : AbstractValidator<ContactPersonCreateDto>
    {
        public CompanyContactCreateDtoValidator()
        {
            RuleFor(c => c)
                .Must(c => !AreRelevantNull(c))
                .WithMessage("All relevant values are null");

            RuleFor(c => c.Name)
                .MaximumLength(50);

            RuleFor(c => c.Role)
                .MaximumLength(50);

            RuleFor(c => c.Phone)
                .MaximumLength(20);

            RuleFor(c => c.Email)
                .EmailAddress()
                .MaximumLength(50);
        }

        // Don't want tu accept empty person only with IsPrimary = true
        private bool AreRelevantNull(ContactPersonCreateDto dto)
        {
            return dto.Name == null &&
                   dto.Role == null &&
                   dto.Email == null &&
                   dto.Phone == null;
        }
    }
}
