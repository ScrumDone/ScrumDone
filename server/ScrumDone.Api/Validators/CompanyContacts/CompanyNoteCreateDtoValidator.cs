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
                .Must(c => !AreAllNull(c))
                .WithMessage("All values are null");

            RuleFor(c => c.Name).MaximumLength(50);

            RuleFor(c => c.Role).MaximumLength(50);

            RuleFor(c => c.Phone).MaximumLength(20);

            RuleFor(c => c.Email).MaximumLength(50);
        }

        private bool AreAllNull(ContactPersonCreateDto dto)
        {
            return dto.Name == null &&
                   dto.Role == null &&
                   dto.Email == null &&
                   dto.Phone == null &&
                   dto.IsPrimary == null;
        }
    }
}
