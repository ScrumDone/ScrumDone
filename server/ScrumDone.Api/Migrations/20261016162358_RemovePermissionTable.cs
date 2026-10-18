using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ScrumDone.Api.Migrations
{
    /// <inheritdoc />
    public partial class RemovePermissionTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_UserPermissionsTypes_UserPermissionsTypeId",
                table: "AspNetUsers");

            migrationBuilder.DropTable(
                name: "UserPermissionsTypes");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_UserPermissionsTypeId",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "UserPermissionsTypeId",
                table: "AspNetUsers");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "UserPermissionsTypeId",
                table: "AspNetUsers",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "UserPermissionsTypes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserPermissionsTypes", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_UserPermissionsTypeId",
                table: "AspNetUsers",
                column: "UserPermissionsTypeId");

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_UserPermissionsTypes_UserPermissionsTypeId",
                table: "AspNetUsers",
                column: "UserPermissionsTypeId",
                principalTable: "UserPermissionsTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
