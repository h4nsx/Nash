using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentAndBankingFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "Projects",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "ExperienceLevel",
                table: "Projects",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "FileAttachmentsJson",
                table: "Projects",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "HourlyRateMax",
                table: "Projects",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "HourlyRateMin",
                table: "Projects",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LocationPreference",
                table: "Projects",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PreferredLanguage",
                table: "Projects",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "PricingType",
                table: "Projects",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Scope",
                table: "Projects",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "SubCategory",
                table: "Projects",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "SkillTests",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "CreatedAt",
                value: new DateTime(2026, 11, 24, 14, 50, 51, 446, DateTimeKind.Utc).AddTicks(5000));

            migrationBuilder.UpdateData(
                table: "SkillTests",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "CreatedAt",
                value: new DateTime(2026, 11, 24, 14, 50, 51, 446, DateTimeKind.Utc).AddTicks(5013));

            migrationBuilder.UpdateData(
                table: "Skills",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CreatedAt",
                value: new DateTime(2026, 11, 24, 14, 50, 51, 446, DateTimeKind.Utc).AddTicks(4709));

            migrationBuilder.UpdateData(
                table: "Skills",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CreatedAt",
                value: new DateTime(2026, 11, 24, 14, 50, 51, 446, DateTimeKind.Utc).AddTicks(4721));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Category",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "ExperienceLevel",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "FileAttachmentsJson",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "HourlyRateMax",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "HourlyRateMin",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "LocationPreference",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "PreferredLanguage",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "PricingType",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "Scope",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "SubCategory",
                table: "Projects");

            migrationBuilder.UpdateData(
                table: "SkillTests",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "CreatedAt",
                value: new DateTime(2026, 11, 24, 14, 18, 53, 733, DateTimeKind.Utc).AddTicks(2797));

            migrationBuilder.UpdateData(
                table: "SkillTests",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "CreatedAt",
                value: new DateTime(2026, 11, 24, 14, 18, 53, 733, DateTimeKind.Utc).AddTicks(2810));

            migrationBuilder.UpdateData(
                table: "Skills",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CreatedAt",
                value: new DateTime(2026, 11, 24, 14, 18, 53, 733, DateTimeKind.Utc).AddTicks(2500));

            migrationBuilder.UpdateData(
                table: "Skills",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CreatedAt",
                value: new DateTime(2026, 11, 24, 14, 18, 53, 733, DateTimeKind.Utc).AddTicks(2511));
        }
    }
}
