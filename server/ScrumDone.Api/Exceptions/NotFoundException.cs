namespace ScrumDone.Api.Exceptions
{
    public class NotFoundException : Exception
    {
        public NotFoundException(string entity, Guid id)
            : base($"{entity} with id '{id}' was not found.") { }
    }
}
