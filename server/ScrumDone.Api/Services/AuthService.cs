using Bogus.DataSets;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;
using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Auth;
using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.DTOs.Users;
using ScrumDone.Api.Exceptions;
using ScrumDone.Api.Mappers;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Net.NetworkInformation;
using System.Reflection.Emit;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace ScrumDone.Api.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private SignInManager<User> _signInManager;
        private UserManager<User> _userManager;

        public AuthService(AppDbContext context, UserManager<User> userManager, SignInManager<User> signInManager)
        {
            _context = context;
            _userManager = userManager;
            _signInManager = signInManager;
        }

        public async Task InviteUser(UserInvitationDto dto)
        {
            if (_context.Users.Any(u => u.Email == dto.Email))
            {
                throw new ConflictException($"Some user already uses this email address: {dto.Email}");
            }

            if (_context.Invitations.Any(i => i.Email == dto.Email)){
                throw new ConflictException($"Invitation for this email address already exists: {dto.Email}");
            }

            var invitation = new UserInvitation{
                Email = dto.Email,
                UserName = dto.Name,
                RoleId = dto.RoleId
            };

            _context.Invitations.Add(invitation);

            Console.WriteLine($"This invitation ID is: {invitation.Id}");

            await _context.SaveChangesAsync();

            return;
        }

        public async Task RegisterUser(Guid id, UserRegistrationDto dto)
        {
            var invitation = await _context.Invitations.FirstOrDefaultAsync(i => i.Id == id);

            if (invitation is null)
            {
                throw new BadRequestException("There is no invitation for this id.");
            }

            var user = new User
            {
                UserName = invitation.UserName,
                Name = invitation.UserName,
                Email = invitation.Email,
                UserPermissionsTypeId = invitation.RoleId
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
            {
                throw new BadRequestException("Password is too weak.");
            }

            _context.Invitations.Remove(invitation);


            await _context.SaveChangesAsync();            

            return;
        }

        public async Task Login(LoginDto dto)
        {
            var result = await _signInManager.PasswordSignInAsync(
                userName: dto.UserName,
                password: dto.Password,
                isPersistent: dto.RememberMe,
                lockoutOnFailure: false);        

            if (!result.Succeeded)
            {
                throw new BadRequestException("Incorrect username or password.");
            }

            return;
        }

        public async Task Logout()
        {
            await _signInManager.SignOutAsync();      

            return;
        }
    }

    
}
