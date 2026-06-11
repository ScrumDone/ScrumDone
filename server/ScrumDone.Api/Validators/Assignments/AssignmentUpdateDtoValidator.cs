using FluentValidation;
using ScrumDone.Api.DTOs.Assignments;

namespace ScrumDone.Api.Validators.Assignments;

public sealed class AssignmentUpdateDtoValidator : AbstractValidator<AssignmentUpdateDto>
{
    public AssignmentUpdateDtoValidator()
    {

    }
}