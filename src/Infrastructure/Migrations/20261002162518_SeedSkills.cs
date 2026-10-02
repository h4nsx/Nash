using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedSkills : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Skills",
                columns: new[] { "Id", "CreatedAt", "Description", "IsActive", "Name" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 10, 2, 16, 25, 17, 810, DateTimeKind.Utc).AddTicks(8579), "Kỹ năng lập trình front-end với thư viện ReactJS.", true, "Phát triển ReactJS" },
                    { new Guid("22222222-2222-2222-2222-222222222222"), new DateTime(2026, 10, 2, 16, 25, 17, 810, DateTimeKind.Utc).AddTicks(8591), "Kỹ năng xây dựng ứng dụng với ngôn ngữ C# và nền tảng .NET.", true, "Lập trình C# .NET" }
                });

            migrationBuilder.InsertData(
                table: "SkillTests",
                columns: new[] { "Id", "CreatedAt", "PassingScore", "SkillId", "Status", "TasksJson", "TimeLimitMinutes", "Title", "Version" },
                values: new object[,]
                {
                    { new Guid("33333333-3333-3333-3333-333333333333"), new DateTime(2026, 10, 2, 16, 25, 17, 810, DateTimeKind.Utc).AddTicks(8797), 70, new Guid("11111111-1111-1111-1111-111111111111"), 1, "[{\"question\":\"Hooks trong React là gì?\",\"options\":[\"Một tính năng mới trong React 16.8\",\"Một loại component\",\"Một phương thức của class\"],\"answer\":0}]", 30, "Bài kiểm tra ReactJS cơ bản", "1.0" },
                    { new Guid("44444444-4444-4444-4444-444444444444"), new DateTime(2026, 10, 2, 16, 25, 17, 810, DateTimeKind.Utc).AddTicks(8813), 80, new Guid("22222222-2222-2222-2222-222222222222"), 1, "[{\"question\":\"Interface trong C# khác abstract class như thế nào?\",\"options\":[\"Interface không thể có field\",\"Interface không thể khai báo method\",\"Cả hai đều giống nhau\"],\"answer\":0}]", 45, "Bài kiểm tra C# .NET", "1.0" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "SkillTests",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"));

            migrationBuilder.DeleteData(
                table: "SkillTests",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"));

            migrationBuilder.DeleteData(
                table: "Skills",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"));

            migrationBuilder.DeleteData(
                table: "Skills",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"));
        }
    }
}
