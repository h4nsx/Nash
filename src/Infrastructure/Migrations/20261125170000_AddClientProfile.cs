using System;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20261125170000_AddClientProfile")]
    public partial class AddClientProfile : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ClientProfiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CompanyName = table.Column<string>(type: "text", nullable: false, defaultValue: ""),
                    Industry = table.Column<string>(type: "text", nullable: false, defaultValue: ""),
                    CompanySize = table.Column<string>(type: "text", nullable: false, defaultValue: ""),
                    WebsiteUrl = table.Column<string>(type: "text", nullable: false, defaultValue: ""),
                    TaxCode = table.Column<string>(type: "text", nullable: false, defaultValue: ""),
                    BillingAddress = table.Column<string>(type: "text", nullable: false, defaultValue: ""),
                    City = table.Column<string>(type: "text", nullable: false, defaultValue: ""),
                    Country = table.Column<string>(type: "text", nullable: false, defaultValue: "Việt Nam"),
                    ContactPhone = table.Column<string>(type: "text", nullable: false, defaultValue: ""),
                    Bio = table.Column<string>(type: "text", nullable: false, defaultValue: ""),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClientProfiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClientProfiles_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ClientProfiles_UserId",
                table: "ClientProfiles",
                column: "UserId",
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ClientProfiles");
        }
    }
}
