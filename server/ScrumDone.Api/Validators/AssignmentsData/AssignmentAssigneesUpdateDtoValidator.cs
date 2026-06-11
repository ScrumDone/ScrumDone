using FluentValidation;
using ScrumDone.Api.DTOs.Assignments;

namespace ScrumDone.Api.Validators.Assignments;

public sealed class AssignmentAssigneesUpdateDtoValidator : AbstractValidator<AssignmentAssigneesUpdateDto>
{
    public AssignmentAssigneesUpdateDtoValidator()
    {

    }
}