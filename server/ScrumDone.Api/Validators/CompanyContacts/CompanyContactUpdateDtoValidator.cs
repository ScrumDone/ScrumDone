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
                .Matches(@"^(\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{3,4}$")
                .MaximumLength(20);

            RuleFor(c => c.Email)
                .Matches("""^(?(")(".+?(?<!\\)"@)|(([0-9a-z]((\.(?!\.))|[-!#\$%&'\*\+/=\?\^`\{\}\|~\w])*)(?<=[0-9a-z])@))(?(\[)(\[(\d{1,3}\.){3}\d{1,3}\])|(([0-9a-z][-\w]*[0-9a-z]*\.)+[a-z0-9][\-a-z0-9]{0,22}[a-z0-9]))$""")
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
