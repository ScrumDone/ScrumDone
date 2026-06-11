using FluentValidation;
using ScrumDone.Api.DTOs.Assignments;

namespace ScrumDone.Api.Validators.Projects
{
    public sealed class AssignmentLabelCreateDtoValidator : AbstractValidator<AssignmentLabelCreateDto>
    {
        public AssignmentLabelCreateDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty()
                .MaximumLength(200);

            RuleFor(x => x.HexColor)
                .NotEmpty()
                .Matches("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$");   
        }
    }
}
