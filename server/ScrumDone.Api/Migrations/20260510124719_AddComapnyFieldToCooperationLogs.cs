using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ScrumDone.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddComapnyFieldToCooperationLogs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CooperationLogs_Users_UserId",
                table: "CooperationLogs");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "CooperationLogs",
                newName: "CompanyId");

            migrationBuilder.RenameIndex(
                name: "IX_CooperationLogs_UserId",
                table: "CooperationLogs",
                newName: "IX_CooperationLogs_CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_CooperationLogs_AuthorId",
                table: "CooperationLogs",
                column: "AuthorId");

            migrationBuilder.AddForeignKey(
                name: "FK_CooperationLogs_Companies_CompanyId",
                table: "CooperationLogs",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CooperationLogs_Users_AuthorId",
                table: "CooperationLogs",
                column: "AuthorId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CooperationLogs_Companies_CompanyId",
                table: "CooperationLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_CooperationLogs_Users_AuthorId",
                table: "CooperationLogs");

            migrationBuilder.DropIndex(
                name: "IX_CooperationLogs_AuthorId",
                table: "CooperationLogs");

            migrationBuilder.RenameColumn(
                name: "CompanyId",
                table: "CooperationLogs",
                newName: "UserId");

            migrationBuilder.RenameIndex(
                name: "IX_CooperationLogs_CompanyId",
                table: "CooperationLogs",
                newName: "IX_CooperationLogs_UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_CooperationLogs_Users_UserId",
                table: "CooperationLogs",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
