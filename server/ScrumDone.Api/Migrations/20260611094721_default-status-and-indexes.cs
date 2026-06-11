using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ScrumDone.Api.Migrations
{
    /// <inheritdoc />
    public partial class defaultstatusandindexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AssignmentUserMTMTable_AssignmentId",
                table: "AssignmentUserMTMTable");

            migrationBuilder.DropIndex(
                name: "IX_AssignmentAssignmentLabelMTMTable_AssignmentId",
                table: "AssignmentAssignmentLabelMTMTable");

            migrationBuilder.DropIndex(
                name: "IX_Assignment_CreatedAt",
                table: "Assignment");

            migrationBuilder.AddColumn<bool>(
                name: "IsDefault",
                table: "AssignmentStatuses",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Assignment",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentUserMTMTable_AssignmentId_UserId",
                table: "AssignmentUserMTMTable",
                columns: new[] { "AssignmentId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentAssignmentLabelMTMTable_AssignmentId_AssignmentLa~",
                table: "AssignmentAssignmentLabelMTMTable",
                columns: new[] { "AssignmentId", "AssignmentLabelId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AssignmentUserMTMTable_AssignmentId_UserId",
                table: "AssignmentUserMTMTable");

            migrationBuilder.DropIndex(
                name: "IX_AssignmentAssignmentLabelMTMTable_AssignmentId_AssignmentLa~",
                table: "AssignmentAssignmentLabelMTMTable");

            migrationBuilder.DropColumn(
                name: "IsDefault",
                table: "AssignmentStatuses");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Assignment",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentUserMTMTable_AssignmentId",
                table: "AssignmentUserMTMTable",
                column: "AssignmentId");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentAssignmentLabelMTMTable_AssignmentId",
                table: "AssignmentAssignmentLabelMTMTable",
                column: "AssignmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Assignment_CreatedAt",
                table: "Assignment",
                column: "CreatedAt");
        }
    }
}
