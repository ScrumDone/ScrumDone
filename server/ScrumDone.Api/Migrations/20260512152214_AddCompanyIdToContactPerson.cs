using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ScrumDone.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddCompanyIdToContactPerson : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ContactPeople_Companies_CompanyId",
                table: "ContactPeople");

            migrationBuilder.AlterColumn<Guid>(
                name: "CompanyId",
                table: "ContactPeople",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ContactPeople_Companies_CompanyId",
                table: "ContactPeople",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ContactPeople_Companies_CompanyId",
                table: "ContactPeople");

            migrationBuilder.AlterColumn<Guid>(
                name: "CompanyId",
                table: "ContactPeople",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddForeignKey(
                name: "FK_ContactPeople_Companies_CompanyId",
                table: "ContactPeople",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id");
        }
    }
}
