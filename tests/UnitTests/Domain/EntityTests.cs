using Domain.Common;
using FluentAssertions;
using Xunit;

namespace UnitTests.Domain;

public class TestEntity : Entity
{
    public string Name { get; set; } = string.Empty;
}

public class EntityTests
{
    [Fact]
    public void Entity_WhenInstantiated_ShouldGenerateUniqueNonEmptyId()
    {
        // Act
        var entity1 = new TestEntity { Name = "First" };
        var entity2 = new TestEntity { Name = "Second" };

        // Assert
        entity1.Id.Should().NotBeEmpty();
        entity2.Id.Should().NotBeEmpty();
        entity1.Id.Should().NotBe(entity2.Id);
    }

    [Fact]
    public void Entity_WhenInstantiated_ShouldSetCreatedAtToUtcNearNow()
    {
        // Act
        var entity = new TestEntity { Name = "TimestampTest" };

        // Assert
        entity.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(2));
        entity.UpdatedAt.Should().BeNull();
    }

    [Fact]
    public void DomainException_ShouldRetainMessageAndCustomCode()
    {
        // Arrange
        var message = "Project state is invalid.";
        var code = "PROJECT_INVALID_STATE";

        // Act
        var exception = new DomainException(message, code);

        // Assert
        exception.Message.Should().Be(message);
        exception.Code.Should().Be(code);
    }
}
