using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ScrumDone.Api.Migrations
{
    /// <inheritdoc />
    public partial class MarkSomeFieldsAsNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Assignment_AssignmentPriorities_PriorityId",
                table: "Assignment");

            migrationBuilder.AlterColumn<Guid>(
                name: "PriorityId",
                table: "Assignment",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddForeignKey(
                name: "FK_Assignment_AssignmentPriorities_PriorityId",
                table: "Assignment",
                column: "PriorityId",
                principalTable: "AssignmentPriorities",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Assignment_AssignmentPriorities_PriorityId",
                table: "Assignment");

            migrationBuilder.AlterColumn<Guid>(
                name: "PriorityId",
                table: "Assignment",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Assignment_AssignmentPriorities_PriorityId",
                table: "Assignment",
                column: "PriorityId",
                principalTable: "AssignmentPriorities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
