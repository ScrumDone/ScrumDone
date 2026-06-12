using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ScrumDone.Api.Migrations
{
    /// <inheritdoc />
    public partial class parent_index : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AssignmentUserMTMTable_AssignmentId_UserId",
                table: "AssignmentUserMTMTable");

            migrationBuilder.DropIndex(
                name: "IX_AssignmentAssignmentLabelMTMTable_AssignmentId_AssignmentLa~",
                table: "AssignmentAssignmentLabelMTMTable");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentUserMTMTable_AssignmentId_UserId",
                table: "AssignmentUserMTMTable",
                columns: new[] { "AssignmentId", "UserId" },
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentAssignmentLabelMTMTable_AssignmentId_AssignmentLa~",
                table: "AssignmentAssignmentLabelMTMTable",
                columns: new[] { "AssignmentId", "AssignmentLabelId" },
                unique: true,
                filter: "\"IsDeleted\" = false");
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
    }
}
