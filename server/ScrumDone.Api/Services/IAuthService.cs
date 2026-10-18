using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using ScrumDone.Api.DTOs.Auth;
using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.DTOs.Companies;
using ScrumDone.Api.DTOs.Users;

namespace ScrumDone.Api.Services
{
    public interface IAuthService
    {
        //Auth
        Task<Guid> InviteUser(UserInvitationDto dto);

        Task RegisterUser(Guid id, UserRegistrationDto dto);

        Task ForgotPassword(ForgotPasswordDto dto);

        Task Login(LoginDto dto);

        Task Logout();

        Task<IEnumerable<RoleDto>> GetRoles();
    }
}
