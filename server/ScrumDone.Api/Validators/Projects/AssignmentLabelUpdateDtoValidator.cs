using FluentValidation;
using ScrumDone.Api.DTOs.Assignments;

namespace ScrumDone.Api.Validators.Projects
{
    public sealed class AssignmentLabelUpdateDtoValidator : AbstractValidator<AssignmentLabelUpdateDto>
    {
        public AssignmentLabelUpdateDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty()
                .MaximumLength(200)
                .When(x =>
                    x.SetProperties.Contains(nameof(AssignmentLabelUpdateDto.Name)));

            RuleFor(x => x.HexColor)
                .NotEmpty()
                .Matches("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
                .When(x =>
                    x.SetProperties.Contains(nameof(AssignmentLabelUpdateDto.HexColor)));
        }
    }
}
