using FluentValidation;
using ScrumDone.Api.DTOs.Companies;

namespace ScrumDone.Api.Validators.Companies
{
    public sealed class CompanyContactUpdateDtoValidator : AbstractValidator<ContactPersonUpdateDto>
    {
        public CompanyContactUpdateDtoValidator()
        {
            RuleFor(c => c.Name)
                .MaximumLength(50);

            RuleFor(c => c.Role)
                .MaximumLength(50);

            RuleFor(c => c.Phone)
                .Matches(@"^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$")
                .MaximumLength(20);

            RuleFor(c => c.Email)
                .EmailAddress()
                .MaximumLength(50);
        }

        private bool AreAllNull(ContactPersonUpdateDto dto)
        {
            return dto.Name == null &&
                   dto.Role == null &&
                   dto.Email == null &&
                   dto.Phone == null &&
                   dto.IsPrimary == null;
        }
    }
}
