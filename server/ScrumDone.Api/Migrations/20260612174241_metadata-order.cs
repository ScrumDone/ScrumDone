using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ScrumDone.Api.Migrations
{
    /// <inheritdoc />
    public partial class metadataorder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsDefault",
                table: "AssignmentStatuses");

            migrationBuilder.AddColumn<int>(
                name: "Order",
                table: "AssignmentStatuses",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Order",
                table: "AssignmentPriorities",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Order",
                table: "AssignmentStatuses");

            migrationBuilder.DropColumn(
                name: "Order",
                table: "AssignmentPriorities");

            migrationBuilder.AddColumn<bool>(
                name: "IsDefault",
                table: "AssignmentStatuses",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}
