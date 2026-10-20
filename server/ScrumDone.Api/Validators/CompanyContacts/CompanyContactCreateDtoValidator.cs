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
                .Matches(@"^(\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{3,4}$")
                .MaximumLength(20);

            RuleFor(c => c.Email)
                .EmailAddress()
                .MaximumLength(128)
                .When(x => x.Email != null);
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
